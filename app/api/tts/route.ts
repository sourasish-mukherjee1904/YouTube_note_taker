import { NextRequest, NextResponse } from "next/server";
import { SarvamService } from "@/lib/sarvam";

export async function POST(req: NextRequest) {
  try {
    const { text, apiKey, speaker, languageCode } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required for TTS generation." }, { status: 400 });
    }

    const headerKey = req.headers.get("x-sarvam-key");
    const activeKey = (headerKey && headerKey.trim()) || (apiKey && apiKey.trim()) || process.env.SARVAM_API_KEY || null;

    const sarvam = new SarvamService(activeKey);
    if (!sarvam.hasApiKey()) {
      return NextResponse.json(
        { error: "SARVAM_API_KEY is not configured. Please supply an API key." },
        { status: 401 }
      );
    }

    const audioDataUri = await sarvam.textToSpeech(text, {
      speaker: speaker || "shubh",
      languageCode: languageCode || "en-IN",
      model: "bulbul:v4-flash",
    });

    return NextResponse.json({ success: true, audioDataUri });
  } catch (err: any) {
    console.error("API /api/tts error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate text-to-speech audio with Sarvam AI." },
      { status: 500 }
    );
  }
}
