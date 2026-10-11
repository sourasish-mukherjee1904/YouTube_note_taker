import { TranscriptSegment, VideoMetadata } from "@/types";

/**
 * Extracts a 11-character YouTube video ID from various URL formats.
 */
export function extractYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  const cleanUrl = url.trim();

  // Pattern matches standard watch, short, embed, and youtu.be links
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/i,
    /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})/i,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/i,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/i,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([a-zA-Z0-9_-]{11})/i,
    /^([a-zA-Z0-9_-]{11})$/,
  ];

  for (const pattern of patterns) {
    const match = cleanUrl.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Fetches video metadata via YouTube oEmbed API and thumbnail fallbacks.
 */
export async function fetchYouTubeMetadata(videoId: string): Promise<VideoMetadata> {
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const defaultThumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(watchUrl)}&format=json`;
    const res = await fetch(oembedUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
      next: { revalidate: 3600 },
    });

    if (res.ok) {
      const data = await res.json();
      return {
        videoId,
        title: data.title || "YouTube Lecture",
        channelTitle: data.author_name || "Instructor",
        thumbnailUrl: data.thumbnail_url || defaultThumbnail,
        durationSeconds: 0, // Will be updated from transcript if available
        durationFormatted: "Video Lecture",
      };
    }
  } catch (err) {
    console.warn("oEmbed fetch failed, using fallback:", err);
  }

  return {
    videoId,
    title: `YouTube Lecture (${videoId})`,
    channelTitle: "Instructor",
    thumbnailUrl: defaultThumbnail,
    durationSeconds: 0,
    durationFormatted: "Video Lecture",
  };
}

/**
 * Parses raw XML timedtext subtitles from YouTube's caption endpoint.
 */
function parseTimedTextXml(xml: string): TranscriptSegment[] {
  const segments: TranscriptSegment[] = [];
  // Regex to match <text start="12.34" dur="3.45">...</text>
  const regex = /<text\s+start="([\d.]+)"(?:\s+dur="([\d.]+)")?[^>]*>([\s\S]*?)<\/text>/gi;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(xml)) !== null) {
    const start = parseFloat(match[1]);
    const duration = match[2] ? parseFloat(match[2]) : 2.5;
    // Decode HTML entities
    let text = match[3]
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\n/g, " ")
      .trim();

    if (text) {
      segments.push({ start, duration, text });
    }
  }

  return segments;
}

/**
 * Fetches transcript segments using direct YouTube page extraction or the youtube-transcript library.
 */
export async function fetchYouTubeTranscript(videoId: string): Promise<TranscriptSegment[]> {
  // Strategy 1: Attempt using youtube-transcript package if available
  try {
    const { YoutubeTranscript } = await import("youtube-transcript");
    const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
    if (transcriptItems && transcriptItems.length > 0) {
      return transcriptItems.map((item) => ({
        text: item.text.replace(/\n/g, " ").trim(),
        start: Math.round(item.offset / 1000 * 10) / 10,
        duration: Math.round(item.duration / 1000 * 10) / 10,
      }));
    }
  } catch (err: any) {
    console.warn("Strategy 1 (youtube-transcript package) failed:", err?.message || err);
  }

  // Strategy 2: Direct YouTube watch page parsing for player captions
  try {
    const pageUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const pageRes = await fetch(pageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (pageRes.ok) {
      const html = await pageRes.text();
      // Look for captionTracks in ytInitialPlayerResponse
      const match = html.match(/"captionTracks":\s*(\[.*?\])/);
      if (match && match[1]) {
        const tracks = JSON.parse(match[1]);
        if (tracks.length > 0) {
          // Prefer English track or first available
          const enTrack = tracks.find((t: any) => t.languageCode?.startsWith("en")) || tracks[0];
          if (enTrack && enTrack.baseUrl) {
            const timedTextRes = await fetch(enTrack.baseUrl);
            if (timedTextRes.ok) {
              const xml = await timedTextRes.text();
              const parsed = parseTimedTextXml(xml);
              if (parsed.length > 0) {
                return parsed;
              }
            }
          }
        }
      }
    }
  } catch (err: any) {
    console.warn("Strategy 2 (captionTracks extraction) failed:", err?.message || err);
  }

  // If no transcripts could be found
  throw new Error(
    "Could not automatically retrieve captions for this video. YouTube captions may be disabled, private, or age-restricted. You can paste an authorized lecture transcript manually."
  );
}

/**
 * Formats seconds into HH:MM:SS or MM:SS
 */
export function formatTimestamp(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Divides transcript segments into timestamp-preserving chunks with overlap for deep analysis.
 */
export function chunkTranscript(
  segments: TranscriptSegment[],
  maxTokensPerChunk: number = 3000,
  overlapSegments: number = 5
): Array<{ chunkIndex: number; startTime: number; endTime: number; text: string; segments: TranscriptSegment[] }> {
  const chunks: Array<{ chunkIndex: number; startTime: number; endTime: number; text: string; segments: TranscriptSegment[] }> = [];
  if (!segments || segments.length === 0) return chunks;

  let currentChunk: TranscriptSegment[] = [];
  let currentWordCount = 0;
  let chunkIdx = 0;

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const words = seg.text.split(/\s+/).length;

    currentChunk.push(seg);
    currentWordCount += words;

    // ~1 word ≈ 1.3 tokens
    if (currentWordCount >= maxTokensPerChunk || i === segments.length - 1) {
      const startTime = currentChunk[0].start;
      const last = currentChunk[currentChunk.length - 1];
      const endTime = last.start + last.duration;
      const text = currentChunk.map((s) => `[${formatTimestamp(s.start)}] ${s.text}`).join("\n");

      chunks.push({
        chunkIndex: chunkIdx++,
        startTime,
        endTime,
        text,
        segments: [...currentChunk],
      });

      // Prepare next chunk with overlapping context
      if (i < segments.length - 1) {
        const overlap = currentChunk.slice(Math.max(0, currentChunk.length - overlapSegments));
        currentChunk = [...overlap];
        currentWordCount = currentChunk.reduce((acc, s) => acc + s.text.split(/\s+/).length, 0);
      } else {
        currentChunk = [];
        currentWordCount = 0;
      }
    }
  }

  return chunks;
}
