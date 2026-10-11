"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ChevronDown,
  ChevronUp,
  Bookmark,
  ExternalLink,
  BookOpen,
  HelpCircle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Youtube,
  Volume2,
} from "lucide-react";
import { LectureData, NoteSection, NoteBlock } from "@/types";
import { MathRenderer } from "./MathRenderer";
import { formatTimestamp } from "@/lib/youtube";

interface NoteRendererProps {
  lecture: LectureData;
  activeSectionId: string;
  onSelectSection: (sectionId: string, youtubeTime?: number) => void;
  onSeekYouTube: (timestamp: number) => void;
}

export function NoteRenderer({
  lecture,
  activeSectionId,
  onSelectSection,
  onSeekYouTube,
}: NoteRendererProps) {
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<"notes" | "revision" | "questions">("notes");
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Auto scroll active section into view smoothly
  useEffect(() => {
    if (activeSectionId && sectionRefs.current[activeSectionId]) {
      const el = sectionRefs.current[activeSectionId];
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [activeSectionId]);

  const toggleCollapse = (secId: string) => {
    setCollapsedSections((prev) => ({ ...prev, [secId]: !prev[secId] }));
  };

  const activeIndex = lecture.sections.findIndex((s) => s.id === activeSectionId);

  const handlePrevSection = () => {
    if (activeIndex > 0) {
      const prevSec = lecture.sections[activeIndex - 1];
      onSelectSection(prevSec.id, prevSec.youtubeStartTime);
    }
  };

  const handleNextSection = () => {
    if (activeIndex < lecture.sections.length - 1) {
      const nextSec = lecture.sections[activeIndex + 1];
      onSelectSection(nextSec.id, nextSec.youtubeStartTime);
    }
  };

  // Helper to render individual note blocks
  const renderBlock = (block: NoteBlock) => {
    switch (block.type) {
      case "heading":
        return null; // Heading is rendered at section header

      case "paragraph":
        return (
          <p className="text-sm text-slate-700 leading-relaxed my-2.5">
            {block.content.split("\n").map((line, i) => (
              <span key={i} className="block mb-1.5">
                {line.replace(/\*\*(.*?)\*\*/g, (_, p1) => `<strong>${p1}</strong>`).includes("<strong>") ? (
                  <span dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />
                ) : (
                  line
                )}
              </span>
            ))}
          </p>
        );

      case "definition":
        return (
          <div className="my-3 rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs text-amber-900 shadow-xs">
            <span className="font-bold uppercase tracking-wider text-[10px] text-amber-800 block mb-1">
              Core Definition
            </span>
            <div
              className="leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: block.content.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"),
              }}
            />
          </div>
        );

      case "formula":
        return (
          <div className="my-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5 shadow-xs">
            <span className="font-bold uppercase tracking-wider text-[10px] text-slate-500 block mb-1">
              {block.content.replace(/\*\*/g, "")}
            </span>
            {block.latex && <MathRenderer latex={block.latex} />}
          </div>
        );

      case "table":
        // Markdown table rendering
        const rows = block.content.split("\n").filter((r) => r.trim().startsWith("|") && !r.includes("---"));
        return (
          <div className="my-3 overflow-x-auto rounded-xl border border-slate-200 shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 font-semibold">
                {rows[0] && (
                  <tr>
                    {rows[0]
                      .split("|")
                      .filter((c) => c.trim().length > 0)
                      .map((cell, idx) => (
                        <th key={idx} className="p-2.5">
                          {cell.trim().replace(/\*\*/g, "")}
                        </th>
                      ))}
                  </tr>
                )}
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-slate-600">
                {rows.slice(1).map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-50">
                    {row
                      .split("|")
                      .filter((c) => c.trim().length > 0)
                      .map((cell, cIdx) => (
                        <td key={cIdx} className="p-2.5">
                          {cell.trim().replace(/\*\*/g, "")}
                        </td>
                      ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case "supplementary":
        return (
          <div className="my-3 rounded-xl border border-emerald-300 bg-emerald-50/80 p-4 text-xs text-emerald-950 shadow-xs">
            <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] text-emerald-800 mb-1.5">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
              <span>Supplementary Explanation (Web Enriched)</span>
            </div>
            <p className="leading-relaxed whitespace-pre-line text-emerald-900 mb-2">
              {block.content.replace(/\*\*(.*?)\*\*/g, "$1")}
            </p>
            {block.sourceCitation && (
              <div className="mt-2 pt-2 border-t border-emerald-200 flex flex-wrap items-center justify-between text-[11px] text-emerald-800">
                <span className="font-semibold">
                  Source: {block.sourceCitation.title} ({block.sourceCitation.sourceName})
                </span>
                {block.sourceCitation.url && (
                  <a
                    href={block.sourceCitation.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-emerald-700 font-bold hover:underline"
                  >
                    View Reference <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                )}
              </div>
            )}
          </div>
        );

      case "takeaway":
        return (
          <div className="my-3 rounded-xl border border-indigo-100 bg-indigo-50/60 p-3 text-xs text-indigo-900 shadow-xs">
            <span className="font-bold text-indigo-950 block mb-0.5">
              {block.content.replace(/\*\*(.*?)\*\*/g, "$1")}
            </span>
          </div>
        );

      default:
        return <p className="text-sm text-slate-700 my-1">{block.content}</p>;
    }
  };

  return (
    <div className="flex flex-col h-full rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      {/* Top Header & Tab Switcher */}
      <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab("notes")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === "notes"
                ? "bg-white text-indigo-600 shadow-xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Study Notes ({lecture.sections.length})
          </button>
          <button
            onClick={() => setActiveTab("revision")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === "revision"
                ? "bg-white text-indigo-600 shadow-xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Revision Sheet
          </button>
          <button
            onClick={() => setActiveTab("questions")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === "questions"
                ? "bg-white text-indigo-600 shadow-xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Practice Q&A ({lecture.practiceQuestions.length})
          </button>
        </div>

        {/* Section Navigation Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={handlePrevSection}
            disabled={activeIndex <= 0}
            className="rounded-lg p-1 text-slate-500 hover:bg-slate-200 disabled:opacity-30 transition"
            title="Previous Section"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-[11px] font-mono text-slate-400">
            {activeIndex + 1}/{lecture.sections.length}
          </span>
          <button
            onClick={handleNextSection}
            disabled={activeIndex >= lecture.sections.length - 1}
            className="rounded-lg p-1 text-slate-500 hover:bg-slate-200 disabled:opacity-30 transition"
            title="Next Section"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Tab 1: Detailed Synchronized Study Notes */}
      {activeTab === "notes" && (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Lecture Overview Card */}
          <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-white p-5 shadow-xs">
            <h2 className="text-sm font-bold text-indigo-950 mb-1 flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-indigo-600" />
              Lecture Overview
            </h2>
            <p className="text-xs text-slate-700 leading-relaxed">{lecture.overview}</p>

            {lecture.prerequisites && lecture.prerequisites.length > 0 && (
              <div className="mt-3 pt-3 border-t border-indigo-100/60">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-800 block mb-1">
                  Prerequisites:
                </span>
                <ul className="list-disc list-inside text-xs text-slate-600 space-y-0.5">
                  {lecture.prerequisites.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sections List */}
          {lecture.sections.map((sec, idx) => {
            const isActive = sec.id === activeSectionId;
            const isCollapsed = collapsedSections[sec.id];

            return (
              <div
                key={sec.id}
                ref={(el) => {
                  sectionRefs.current[sec.id] = el;
                }}
                className={`rounded-2xl border transition-all duration-300 p-5 ${
                  isActive
                    ? "border-indigo-400 bg-indigo-50/30 shadow-md ring-2 ring-indigo-200/50"
                    : "border-slate-200 bg-white hover:border-slate-300 shadow-xs"
                }`}
              >
                {/* Section Header */}
                <div className="flex items-center justify-between gap-3 cursor-pointer" onClick={() => onSelectSection(sec.id, sec.youtubeStartTime)}>
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${
                        isActive ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <div>
                      <h3 className={`text-sm font-bold ${isActive ? "text-indigo-950" : "text-slate-900"}`}>
                        {sec.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1 hover:text-indigo-600" onClick={(e) => { e.stopPropagation(); onSeekYouTube(sec.youtubeStartTime); }}>
                          <Youtube className="h-3 w-3 text-red-500" />
                          {formatTimestamp(sec.youtubeStartTime)}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 hover:text-indigo-600" onClick={(e) => { e.stopPropagation(); onSelectSection(sec.id); }}>
                          <Volume2 className="h-3 w-3 text-indigo-500" />
                          Listen to audio lesson
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCollapse(sec.id);
                    }}
                    className="p-1 rounded-md text-slate-400 hover:bg-slate-100"
                  >
                    {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                  </button>
                </div>

                {/* Section Content */}
                {!isCollapsed && (
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1">
                    {sec.blocks.map((block) => (
                      <div key={block.id}>{renderBlock(block)}</div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Revision Sheet */}
      {activeTab === "revision" && (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Executive Summary</h3>
            <ul className="space-y-1.5 text-xs text-slate-600">
              {lecture.revisionSheet.quickSummary.map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-indigo-600 font-bold">•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Core Formulas & Models</h3>
            <div className="space-y-3">
              {lecture.revisionSheet.coreFormulas.map((f, i) => (
                <div key={i} className="rounded-xl bg-slate-50 p-3 border border-slate-200">
                  <MathRenderer latex={f.formula} />
                  <p className="text-[11px] text-slate-600 text-center mt-1">{f.explanation}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Key Exam Tips</h3>
            <ul className="space-y-2 text-xs text-slate-700">
              {lecture.revisionSheet.examTips.map((tip, i) => (
                <li key={i} className="rounded-lg bg-amber-50/70 border border-amber-200 p-2.5 text-amber-900">
                  💡 {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Tab 3: Practice Questions */}
      {activeTab === "questions" && (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {lecture.practiceQuestions.map((q, idx) => (
            <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
              <div className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700">
                  {idx + 1}
                </span>
                <p className="text-xs font-bold text-slate-900">{q.question}</p>
              </div>

              <div className="ml-7 pt-2 border-t border-slate-100 space-y-1">
                <div className="text-xs text-indigo-950 font-semibold bg-indigo-50/60 p-2.5 rounded-lg border border-indigo-100">
                  Answer: <span className="font-normal">{q.answer}</span>
                </div>
                <p className="text-[11px] text-slate-500 italic mt-1">
                  Explanation: {q.explanation}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
