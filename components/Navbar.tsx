"use client";

import React from "react";
import { BookOpen, Sparkles, Key, CheckCircle2, AlertCircle } from "lucide-react";

interface NavbarProps {
  hasApiKey: boolean;
  onOpenKeyModal: () => void;
  onLoadDemo: () => void;
  onReset: () => void;
}

export function Navbar({ hasApiKey, onOpenKeyModal, onLoadDemo, onReset }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={onReset}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-200">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-slate-900">LectureLens</span>
              <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700 border border-indigo-100">
                Sarvam AI
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">AI-Powered YouTube Study Companion</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onLoadDemo}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
            Sample Workspace
          </button>

          <button
            onClick={onOpenKeyModal}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
              hasApiKey
                ? "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                : "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
            }`}
          >
            <Key className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sarvam API Key</span>
            {hasApiKey ? (
              <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Active
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] text-amber-700 font-semibold">
                <AlertCircle className="h-3 w-3 text-amber-600" /> Configure
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
