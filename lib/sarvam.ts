/**
 * Sarvam AI Service Integration
 * Documentation: https://docs.sarvam.ai
 * - Chat Completions: POST https://api.sarvam.ai/v1/chat/completions (model: sarvam-105b)
 * - Text-to-Speech: POST https://api.sarvam.ai/text-to-speech (models: bulbul:v4-flash, bulbul:v3)
 */

interface SarvamChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export class SarvamService {
  private apiKey: string | null;

  constructor(apiKey?: string | null) {
    this.apiKey = apiKey || process.env.SARVAM_API_KEY || null;
  }

  public hasApiKey(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0 && this.apiKey !== "your_sarvam_api_key_here");
  }

  /**
   * Generates chat completion using Sarvam-105b
   */
  async chatCompletion(
    messages: SarvamChatMessage[],
    options: {
      temperature?: number;
      maxTokens?: number;
      model?: string;
    } = {}
  ): Promise<string> {
    if (!this.hasApiKey()) {
      throw new Error("SARVAM_API_KEY is not configured. Please provide a valid Sarvam API key.");
    }

    const model = options.model || "sarvam-105b";
    const endpoint = "https://api.sarvam.ai/v1/chat/completions";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-subscription-key": this.apiKey!,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: options.temperature ?? 0.2,
          max_tokens: options.maxTokens ?? 2048,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Sarvam Chat API returned ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error("Sarvam Chat API returned an empty completion response.");
      }
      return content;
    } catch (err: any) {
      console.error("Sarvam Chat Completion Error:", err);
      throw err;
    }
  }

  /**
   * Generates speech for a text segment using Sarvam Bulbul TTS
   * Converts text (max 2,500 chars) into high-fidelity audio (base64 data URI).
   */
  async textToSpeech(
    text: string,
    options: {
      languageCode?: string;
      speaker?: string;
      model?: string;
    } = {}
  ): Promise<string> {
    if (!this.hasApiKey()) {
      throw new Error("SARVAM_API_KEY is not configured.");
    }

    // Truncate to safe limit (Sarvam allows max 2500 chars)
    const cleanText = text.slice(0, 2400).trim();
    if (!cleanText) {
      throw new Error("Text for TTS cannot be empty.");
    }

    const endpoint = "https://api.sarvam.ai/text-to-speech";
    const languageCode = options.languageCode || "en-IN";
    const speaker = options.speaker || "shubh"; // Indian English tutor voice
    const model = options.model || "bulbul:v4-flash";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-subscription-key": this.apiKey!,
        },
        body: JSON.stringify({
          text: cleanText,
          language_code: languageCode,
          speaker,
          model,
        }),
      });

      if (!response.ok) {
        // If bulbul:v4-flash fails or is not authorized, retry with bulbul:v3
        if (model === "bulbul:v4-flash") {
          console.warn("bulbul:v4-flash returned status", response.status, "retrying with bulbul:v3");
          return this.textToSpeech(cleanText, { ...options, model: "bulbul:v3" });
        }
        const errorText = await response.text();
        throw new Error(`Sarvam TTS API returned ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      if (data?.audios && data.audios.length > 0) {
        const base64Audio = data.audios[0];
        return `data:audio/wav;base64,${base64Audio}`;
      }

      throw new Error("Sarvam TTS did not return audio data in response.");
    } catch (err: any) {
      console.error("Sarvam TTS Generation Error:", err);
      throw err;
    }
  }
}
