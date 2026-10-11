import { NextRequest, NextResponse } from "next/server";
import { extractYouTubeVideoId, fetchYouTubeMetadata, fetchYouTubeTranscript } from "@/lib/youtube";
import { runNoteGenerationPipeline } from "@/lib/notes-pipeline";
import { TranscriptSegment } from "@/types";

export const maxDuration = 60; // Allow sufficient serverless execution time

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, manualTranscript, apiKey, tavilyKey } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Please provide a valid YouTube video URL." }, { status: 400 });
    }

    const videoId = extractYouTubeVideoId(url);
    if (!videoId) {
      return NextResponse.json(
        { error: "Invalid YouTube URL. Please enter a valid YouTube link (e.g. https://www.youtube.com/watch?v=... or youtu.be/...)." },
        { status: 400 }
      );
    }

    // 1. Fetch metadata
    const metadata = await fetchYouTubeMetadata(videoId);

    // 2. Fetch or parse transcript
    let transcriptSegments: TranscriptSegment[] = [];

    if (manualTranscript && typeof manualTranscript === "string" && manualTranscript.trim().length > 0) {
      // User provided an authorized transcript or fallback text
      const lines = manualTranscript.split("\n").filter((l) => l.trim().length > 0);
      let t = 0;
      transcriptSegments = lines.map((line) => {
        const seg = { start: t, duration: 4, text: line.trim() };
        t += 4;
        return seg;
      });
    } else {
      try {
        transcriptSegments = await fetchYouTubeTranscript(videoId);
      } catch (err: any) {
        return NextResponse.json(
          {
            error: err.message || "Failed to extract captions from this YouTube video.",
            videoId,
            metadata,
            requiresManualTranscript: true,
          },
          { status: 422 }
        );
      }
    }

    if (!transcriptSegments || transcriptSegments.length === 0) {
      return NextResponse.json(
        {
          error: "No spoken content could be extracted from this video.",
          videoId,
          requiresManualTranscript: true,
        },
        { status: 422 }
      );
    }

    // 3. Determine Sarvam API key: Header -> Request body -> Server environment variable
    const headerKey = req.headers.get("x-sarvam-key");
    const activeSarvamKey = (headerKey && headerKey.trim()) || (apiKey && apiKey.trim()) || process.env.SARVAM_API_KEY || null;

    // 4. Run multi-stage AI note-generation pipeline
    const lectureData = await runNoteGenerationPipeline(metadata, transcriptSegments, {
      sarvamApiKey: activeSarvamKey,
      tavilyApiKey: tavilyKey || process.env.TAVILY_API_KEY,
    });

    return NextResponse.json({ success: true, data: lectureData });
  } catch (error: any) {
    console.error("API /api/process error:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred while processing the lecture." },
      { status: 500 }
    );
  }
}
