"use client";

import React, { useState } from "react";
import {
  Download,
  FileDown,
  ArrowLeft,
  Share2,
  Check,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { LectureData } from "@/types";
import { VideoPlayer } from "./VideoPlayer";
import { NoteRenderer } from "./NoteRenderer";
import { AudioTutorPlayer } from "./AudioTutorPlayer";
import { generateLecturePdf, generateLectureMarkdown } from "@/lib/pdf";

interface WorkspaceProps {
  lecture: LectureData;
  onBackToSearch: () => void;
}

export function Workspace({ lecture, onBackToSearch }: WorkspaceProps) {
  const [activeSectionId, setActiveSectionId] = useState<string>(
    lecture.sections[0]?.id || "sec-1"
  );
  const [seekYouTubeTime, setSeekYouTubeTime] = useState<number | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Synchronized section selection
  const handleSelectSection = (sectionId: string, youtubeTime?: number) => {
    setActiveSectionId(sectionId);
    if (youtubeTime !== undefined) {
      setSeekYouTubeTime(youtubeTime);
    }
  };

  const handleSeekYouTube = (timestamp: number) => {
    setSeekYouTubeTime(timestamp);
  };

  // Called continuously from Audio Tutor
  const handleAudioTimeUpdate = (
    _currentCumulativeTime: number,
    sectionId: string
  ) => {
    if (sectionId !== activeSectionId) {
      setActiveSectionId(sectionId);
    }
  };

  // Download high-resolution PDF
  const handleDownloadPdf = () => {
    setIsExportingPdf(true);
    try {
      const doc = generateLecturePdf(lecture);
      const cleanTitle = lecture.metadata.title.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 30);
      doc.save(`LectureLens_${cleanTitle}.pdf`);
    } catch (err) {
      console.error("PDF export error:", err);
      alert("Error generating PDF document. Please try again.");
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Download GitHub Markdown
  const handleDownloadMarkdown = () => {
    try {
      const md = generateLectureMarkdown(lecture);
      const blob = new Blob([md], { type: "text/markdown;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const cleanTitle = lecture.metadata.title.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 30);
      a.href = url;
      a.download = `LectureLens_${cleanTitle}.md`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Markdown export error:", err);
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-slate-100/70">
      {/* Top Workspace Toolbar */}
      <div className="bg-white border-b border-slate-200 px-4 py-2.5 sm:px-6 flex items-center justify-between shrink-0 shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBackToSearch}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
            title="Return to Lecture Input"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
              {lecture.metadata.title}
            </h1>
            <p className="text-[11px] text-slate-500 truncate hidden sm:block">
              {lecture.metadata.channelTitle} • {lecture.metadata.durationFormatted} • {lecture.sections.length} Study Modules
            </p>
          </div>
        </div>

        {/* Export & Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleShare}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
          >
            {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Share2 className="h-3.5 w-3.5" />}
            {copiedLink ? "Copied" : "Share"}
          </button>

          <button
            onClick={handleDownloadMarkdown}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
          >
            <FileDown className="h-3.5 w-3.5 text-slate-600" />
            <span className="hidden md:inline">Export</span> Markdown
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={isExportingPdf}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{isExportingPdf ? "Generating..." : "Download PDF"}</span>
          </button>
        </div>
      </div>

      {/* Tri-Panel Synchronized Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 p-3 overflow-hidden">
        {/* Left Panel: Video & Milestones (Col 3 on Large) */}
        <div className="lg:col-span-3 h-[320px] lg:h-full overflow-hidden">
          <VideoPlayer
            metadata={lecture.metadata}
            sections={lecture.sections}
            activeSectionId={activeSectionId}
            onSelectSection={handleSelectSection}
            seekTimestamp={seekYouTubeTime}
          />
        </div>

        {/* Center Panel: Synchronized Rich Study Notes (Col 6 on Large) */}
        <div className="lg:col-span-6 h-[500px] lg:h-full overflow-hidden">
          <NoteRenderer
            lecture={lecture}
            activeSectionId={activeSectionId}
            onSelectSection={handleSelectSection}
            onSeekYouTube={handleSeekYouTube}
          />
        </div>

        {/* Right Panel: Audio Tutor Player (Col 3 on Large) */}
        <div className="lg:col-span-3 h-auto lg:h-full flex flex-col justify-between overflow-y-auto space-y-3">
          <AudioTutorPlayer
            sections={lecture.sections}
            audioSegments={lecture.audioSegments}
            currentSectionId={activeSectionId}
            onSectionChange={handleSelectSection}
            onTimeUpdate={handleAudioTimeUpdate}
          />

          {/* Web Research Gaps Summary Card */}
          {lecture.learningGaps && lecture.learningGaps.length > 0 && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 text-xs space-y-2">
              <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] text-emerald-800">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                <span>Web Research Resolved Gaps ({lecture.learningGaps.length})</span>
              </div>
              <p className="text-[11px] text-emerald-900 leading-relaxed">
                The lecture omitted {lecture.learningGaps.length} prerequisite concepts. Verified educational references have been woven into the notes.
              </p>
            </div>
          )}

          {/* Quick Learning Stats */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs space-y-2">
            <span className="font-bold uppercase tracking-wider text-[10px] text-slate-400 block">
              Study Metrics
            </span>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="rounded-xl bg-slate-50 p-2 border border-slate-100">
                <span className="text-base font-extrabold text-indigo-600 block">
                  {lecture.sections.length}
                </span>
                <span className="text-[10px] text-slate-500">Key Topics</span>
              </div>
              <div className="rounded-xl bg-slate-50 p-2 border border-slate-100">
                <span className="text-base font-extrabold text-indigo-600 block">
                  {lecture.practiceQuestions.length}
                </span>
                <span className="text-[10px] text-slate-500">Practice Q&A</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
