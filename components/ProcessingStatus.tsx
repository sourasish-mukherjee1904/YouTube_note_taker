"use client";

import React from "react";
import { CheckCircle2, Loader2, AlertCircle, RefreshCw, FileText, Sparkles, Search, Volume2, ArrowLeft } from "lucide-react";
import { VideoMetadata } from "@/types";

interface ProcessingStatusProps {
  currentStage: string;
  stageMessage: string;
  metadata?: VideoMetadata | null;
  error?: string | null;
  onRetry: () => void;
  onCancel: () => void;
}

export function ProcessingStatus({
  currentStage,
  stageMessage,
  metadata,
  error,
  onRetry,
  onCancel,
}: ProcessingStatusProps) {
  const stages = [
    {
      id: "fetching_transcript",
      title: "1. Extracting Video Transcript",
      desc: "Retrieving full speech captions, timing offsets, and speaker segments.",
      icon: FileText,
    },
    {
      id: "analyzing_structure",
      title: "2. Analyzing Lecture Structure",
      desc: "Identifying major themes, prerequisites, derivations, and topic boundaries.",
      icon: Sparkles,
    },
    {
      id: "generating_notes",
      title: "3. Synthesizing Comprehensive Study Notes",
      desc: "Formatting definitions, LaTeX mathematical formulas, comparison matrices, and practice questions.",
      icon: FileText,
    },
    {
      id: "researching_gaps",
      title: "4. Web Research for Knowledge Gaps",
      desc: "Querying authoritative academic resources to clarify omitted prerequisites.",
      icon: Search,
    },
    {
      id: "generating_audio",
      title: "5. Synthesizing Spoken Audio Tutor",
      desc: "Generating conversational voice lesson with Sarvam Bulbul TTS and synchronizing note markers.",
      icon: Volume2,
    },
  ];

  const getStageStatus = (stageId: string) => {
    if (error) return "failed";
    const stageOrder = ["fetching_transcript", "analyzing_structure", "generating_notes", "researching_gaps", "generating_audio", "completed"];
    const currentIndex = stageOrder.indexOf(currentStage);
    const stageIndex = stageOrder.indexOf(stageId);

    if (stageIndex < currentIndex) return "completed";
    if (stageIndex === currentIndex) return "in_progress";
    return "pending";
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Back button */}
      <button
        onClick={onCancel}
        className="mb-6 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Cancel and return to Home
      </button>

      {/* Video Preview Card */}
      {metadata && (
        <div className="mb-8 flex flex-col sm:flex-row items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="relative aspect-video w-full sm:w-48 overflow-hidden rounded-xl bg-slate-100 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={metadata.thumbnailUrl}
              alt={metadata.title}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="space-y-1">
            <span className="rounded bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
              Active Lecture Ingestion
            </span>
            <h2 className="text-base font-bold text-slate-900 line-clamp-2">{metadata.title}</h2>
            <p className="text-xs text-slate-500">
              Instructor: <span className="font-medium text-slate-700">{metadata.channelTitle}</span> • {metadata.durationFormatted}
            </p>
          </div>
        </div>
      )}

      {/* Main Status Container */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md sm:p-8">
        <div className="flex items-center justify-between pb-6 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Processing Study Companion</h3>
            <p className="text-xs text-slate-500 mt-0.5">{stageMessage || "Initializing multi-stage pipeline..."}</p>
          </div>
          {!error && (
            <div className="flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Working</span>
            </div>
          )}
        </div>

        {/* Error Notice */}
        {error && (
          <div className="my-6 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-bold text-sm mb-1">Processing Interrupted</p>
                <p className="leading-relaxed">{error}</p>
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={onRetry}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Retry Processing
                  </button>
                  <button
                    onClick={onCancel}
                    className="rounded-lg border border-red-300 bg-white px-3.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 transition"
                  >
                    Back to URL Input
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stage Timeline */}
        <div className="mt-6 space-y-4">
          {stages.map((stage) => {
            const status = getStageStatus(stage.id);
            const Icon = stage.icon;

            return (
              <div
                key={stage.id}
                className={`flex items-start gap-3.5 rounded-xl p-3.5 transition ${
                  status === "in_progress"
                    ? "border border-indigo-200 bg-indigo-50/50"
                    : status === "completed"
                    ? "bg-slate-50/80"
                    : "opacity-60"
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {status === "completed" && <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
                  {status === "in_progress" && <Loader2 className="h-5 w-5 text-indigo-600 animate-spin" />}
                  {status === "pending" && (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 bg-white text-[10px] text-slate-400">
                      •
                    </div>
                  )}
                  {status === "failed" && <AlertCircle className="h-5 w-5 text-red-500" />}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5 text-slate-400" />
                    <span
                      className={`text-xs font-semibold ${
                        status === "in_progress" ? "text-indigo-900 font-bold" : "text-slate-800"
                      }`}
                    >
                      {stage.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{stage.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
