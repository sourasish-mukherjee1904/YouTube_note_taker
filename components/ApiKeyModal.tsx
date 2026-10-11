"use client";

import React, { useState } from "react";
import { Key, ShieldCheck, X, Sparkles, ExternalLink, Info } from "lucide-react";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSarvamKey: string;
  currentTavilyKey: string;
  onSave: (sarvamKey: string, tavilyKey: string) => void;
}

export function ApiKeyModal({
  isOpen,
  onClose,
  currentSarvamKey,
  currentTavilyKey,
  onSave,
}: ApiKeyModalProps) {
  const [sarvamKey, setSarvamKey] = useState(currentSarvamKey);
  const [tavilyKey, setTavilyKey] = useState(currentTavilyKey);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(sarvamKey.trim(), tavilyKey.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 sm:p-8">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <Key className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">API Credentials & Keys</h3>
            <p className="text-xs text-slate-500">Configure your Sarvam AI key for voice lessons & LLM notes</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Sarvam AI Key */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                Sarvam AI API Key
                <span className="rounded bg-indigo-100 text-indigo-800 text-[10px] font-bold px-1.5 py-0.2">Primary</span>
              </label>
              <a
                href="https://dashboard.sarvam.ai"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-indigo-600 hover:underline flex items-center gap-0.5"
              >
                Get Key <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </div>
            <input
              type="password"
              value={sarvamKey}
              onChange={(e) => setSarvamKey(e.target.value)}
              placeholder="e.g. sk_live_... or paste your Sarvam subscription key"
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
            <p className="mt-1 text-[11px] text-slate-500">
              Powers conversational tutoring with <span className="font-semibold text-slate-700">Bulbul TTS</span> and structured notes synthesis.
            </p>
          </div>

          {/* Tavily AI Key */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                Tavily Search API Key
                <span className="rounded bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.2 font-medium">Optional</span>
              </label>
              <a
                href="https://tavily.com"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-slate-500 hover:underline flex items-center gap-0.5"
              >
                Tavily.com <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </div>
            <input
              type="password"
              value={tavilyKey}
              onChange={(e) => setTavilyKey(e.target.value)}
              placeholder="tvly-... (Leave empty to use automatic Wikipedia/DDG fallback)"
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Credit Optimization Guarantee Banner */}
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-3.5 text-xs text-indigo-900 flex items-start gap-2.5">
            <Info className="h-4 w-4 text-indigo-600 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="font-semibold">Credit-Conscious Protection:</p>
              <p className="text-[11px] text-indigo-800 leading-relaxed">
                LectureLens divides long lectures into compact semantic chunks and caches intermediate results. Your key is stored in server-side session headers and never exposed to the public browser console or git repos.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
            >
              {savedSuccess ? (
                <>
                  <ShieldCheck className="h-3.5 w-3.5 text-white" />
                  Saved Successfully!
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  Save Credentials
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
