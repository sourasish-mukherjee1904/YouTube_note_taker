import { NextResponse } from "next/server";

export async function GET() {
  const hasSarvam = Boolean(process.env.SARVAM_API_KEY && process.env.SARVAM_API_KEY !== "your_sarvam_api_key_here");
  const hasTavily = Boolean(process.env.TAVILY_API_KEY && process.env.TAVILY_API_KEY !== "your_tavily_api_key_here");

  return NextResponse.json({
    status: "ok",
    appName: "LectureLens — AI YouTube Study Companion",
    environment: {
      hasSarvamApiKey: hasSarvam,
      hasTavilyApiKey: hasTavily,
    },
    timestamp: new Date().toISOString(),
  });
}
