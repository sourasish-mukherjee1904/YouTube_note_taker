"use client";

import React, { useRef, useEffect } from "react";
import { Youtube, ExternalLink, Clock, Play } from "lucide-react";
import { VideoMetadata, NoteSection } from "@/types";
import { formatTimestamp } from "@/lib/youtube";

interface VideoPlayerProps {
  metadata: VideoMetadata;
  sections: NoteSection[];
  activeSectionId: string;
  onSelectSection: (sectionId: string, youtubeTime: number) => void;
  seekTimestamp?: number | null;
}

export function VideoPlayer({
  metadata,
  sections,
  activeSectionId,
  onSelectSection,
  seekTimestamp,
}: VideoPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Send seek command to YouTube IFrame API via postMessage
  useEffect(() => {
    if (seekTimestamp !== undefined && seekTimestamp !== null && iframeRef.current) {
      try {
        iframeRef.current.contentWindow?.postMessage(
          JSON.stringify({
            event: "command",
            func: "seekTo",
            args: [seekTimestamp, true],
          }),
          "*"
        );
      } catch (err) {
        console.warn("Could not postMessage to YouTube player:", err);
      }
    }
  }, [seekTimestamp]);

  return (
    <div className="flex flex-col h-full rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      {/* Video Embed Header */}
      <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2">
          <Youtube className="h-4 w-4 text-red-600" />
          <span className="text-xs font-bold text-slate-800">Original Lecture Player</span>
        </div>
        <a
          href={`https://www.youtube.com/watch?v=${metadata.videoId}`}
          target="_blank"
          rel="noreferrer"
          className="text-[11px] text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition"
        >
          YouTube <ExternalLink className="h-2.5 w-2.5" />
        </a>
      </div>

      {/* Responsive YouTube Embed */}
      <div className="relative aspect-video w-full bg-black">
        <iframe
          ref={iframeRef}
          src={`https://www.youtube.com/embed/${metadata.videoId}?enablejsapi=1&origin=${typeof window !== "undefined" ? window.location.origin : ""}&modestbranding=1&rel=0`}
          title={metadata.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>

      {/* Video Title and Metadata */}
      <div className="p-4 border-b border-slate-100 space-y-1">
        <h3 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">{metadata.title}</h3>
        <p className="text-[11px] text-slate-500">
          {metadata.channelTitle} • {metadata.durationFormatted}
        </p>
      </div>

      {/* Timestamped Topics List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
        <div className="flex items-center justify-between px-1 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Lecture Milestones</span>
          <span className="text-[10px] text-slate-400">Click to seek video</span>
        </div>

        {sections.map((sec, idx) => {
          const isActive = sec.id === activeSectionId;
          return (
            <button
              key={sec.id}
              onClick={() => onSelectSection(sec.id, sec.youtubeStartTime)}
              className={`w-full text-left rounded-xl p-2.5 transition flex items-start gap-2.5 ${
                isActive
                  ? "bg-indigo-50/80 border border-indigo-200 text-indigo-900 shadow-xs"
                  : "hover:bg-slate-50 text-slate-700 border border-transparent"
              }`}
            >
              <div
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[10px] font-bold mt-0.5 ${
                  isActive ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"
                }`}
              >
                {isActive ? <Play className="h-2.5 w-2.5 fill-current" /> : idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-semibold truncate ${isActive ? "text-indigo-950 font-bold" : "text-slate-800"}`}>
                  {sec.title}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-400">
                  <Clock className="h-2.5 w-2.5" />
                  <span>{formatTimestamp(sec.youtubeStartTime)}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
