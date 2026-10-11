"use client";

import React, { useState } from "react";
import { Youtube, ArrowRight, Sparkles, FileText, CheckCircle2, AlertTriangle, Layers, BookOpen, Volume2 } from "lucide-react";

interface HeroInputProps {
  onSubmitUrl: (url: string, manualTranscript?: string) => void;
  onLoadSample: () => void;
  isProcessing: boolean;
}

export function HeroInput({ onSubmitUrl, onLoadSample, isProcessing }: HeroInputProps) {
  const [url, setUrl] = useState("");
  const [showManualTranscript, setShowManualTranscript] = useState(false);
  const [manualTranscript, setManualTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = url.trim();
    if (!trimmed) {
      setError("Please enter a YouTube video URL.");
      return;
    }

    if (!trimmed.includes("youtube.com") && !trimmed.includes("youtu.be")) {
      setError("Please provide a valid YouTube URL (e.g., https://www.youtube.com/watch?v=... or youtu.be/...)");
      return;
    }

    onSubmitUrl(trimmed, manualTranscript.trim() || undefined);
  };

  const samplePicks = [
    {
      title: "Stanford CS224N: Attention Mechanisms & Transformers",
      url: "https://www.youtube.com/watch?v=kCc8FmEb1nY",
      tag: "Deep Learning",
    },
    {
      title: "3Blue1Brown: But what is a neural network?",
      url: "https://www.youtube.com/watch?v=aircAruvnKk",
      tag: "Linear Algebra",
    },
    {
      title: "MIT 6.006: Asymptotic Complexity & Divide-and-Conquer",
      url: "https://www.youtube.com/watch?v=76d3n_vjSDE",
      tag: "Computer Science",
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-20 lg:px-8">
      {/* Header & Tagline */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50/80 px-4 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Multimodal AI Tutor powered by Sarvam AI</span>
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl font-serif">
          Turn any lecture into <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
            notes you can listen to.
          </span>
        </h1>

        <p className="mx-auto max-w-2xl text-base text-slate-600 sm:text-lg">
          LectureLens extracts full video transcripts, synthesizes structured academic study notes, detects learning gaps, searches the web for supplementary context, and generates a synchronized audio tutor.
        </p>
      </div>

      {/* Main Input Form */}
      <div className="mt-10 mx-auto max-w-3xl">
        <form onSubmit={handleSubmit} className="relative rounded-2xl bg-white p-2.5 shadow-xl shadow-slate-200/50 border border-slate-200">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1 flex items-center pl-3">
              <Youtube className="h-5 w-5 text-red-500 shrink-0" />
              <input
                type="text"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Paste YouTube lecture URL (e.g. https://www.youtube.com/watch?v=...)"
                className="w-full border-0 bg-transparent px-3 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-0"
                disabled={isProcessing}
              />
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Process Lecture</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>

          {/* Optional manual transcript toggle */}
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between px-3 text-xs text-slate-500">
            <button
              type="button"
              onClick={() => setShowManualTranscript(!showManualTranscript)}
              className="hover:text-indigo-600 transition flex items-center gap-1 text-[11px]"
            >
              <FileText className="h-3 w-3" />
              {showManualTranscript ? "Hide custom transcript input" : "Video has no captions? Paste custom transcript"}
            </button>

            <button
              type="button"
              onClick={onLoadSample}
              className="text-indigo-600 font-medium hover:underline text-[11px] flex items-center gap-1"
            >
              <Sparkles className="h-3 w-3" />
              Preview Demo Lecture
            </button>
          </div>

          {showManualTranscript && (
            <div className="mt-3 px-3 pb-2">
              <textarea
                value={manualTranscript}
                onChange={(e) => setManualTranscript(e.target.value)}
                rows={4}
                placeholder="Paste authorized lecture transcript or speaker notes here (one paragraph per line)..."
                className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-700 placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          )}
        </form>

        {error && (
          <div className="mt-3 rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Quick Sample Picks */}
        <div className="mt-6">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5 text-center">
            Or try one of these standard educational lectures:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {samplePicks.map((pick, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setUrl(pick.url)}
                className="flex flex-col text-left rounded-xl border border-slate-200 bg-white p-3 hover:border-indigo-300 hover:shadow-sm transition group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-700">
                    {pick.tag}
                  </span>
                  <Youtube className="h-3 w-3 text-red-500" />
                </div>
                <span className="text-xs font-semibold text-slate-800 line-clamp-1 group-hover:text-indigo-600">
                  {pick.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="mt-20 border-t border-slate-200/80 pt-16">
        <h2 className="text-center text-sm font-semibold uppercase tracking-wider text-slate-400 mb-8">
          The Complete Multimodal AI Learning Architecture
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 mb-4">
              <Youtube className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">1. Full Video Ingestion</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Extracts complete transcripts with sub-second timestamps. Divides long lectures into overlapping contextual chunks without silent truncation.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 mb-4">
              <BookOpen className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">2. Structured Study Notes</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Synthesizes overview, prerequisites, LaTeX derivations, worked tables, common misconceptions, revision summaries, and exam practice questions.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 mb-4">
              <Layers className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">3. Web Gap Enrichment</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Detects unexplained prerequisites and queries authoritative academic literature to inject labeled supplementary explanations and citations.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 mb-4">
              <Volume2 className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">4. Synchronized Audio Tutor</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Sarvam Bulbul TTS converts notes into conversational voice segments. The note blocks dynamically highlight in sync with the audio narrator.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
