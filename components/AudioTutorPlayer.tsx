"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Download,
  Sparkles,
  Headphones,
  RotateCcw,
} from "lucide-react";
import { AudioSegment, NoteSection } from "@/types";
import { formatTimestamp } from "@/lib/youtube";

interface AudioTutorPlayerProps {
  sections: NoteSection[];
  audioSegments: AudioSegment[];
  currentSectionId: string;
  onSectionChange: (sectionId: string) => void;
  onTimeUpdate: (currentCumulativeTime: number, activeSectionId: string) => void;
}

export function AudioTutorPlayer({
  sections,
  audioSegments,
  currentSectionId,
  onSectionChange,
  onTimeUpdate,
}: AudioTutorPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [segmentCurrentTime, setSegmentCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const synthTimerRef = useRef<any>(null);

  // Sync segment index with external activeSectionId
  useEffect(() => {
    const idx = audioSegments.findIndex((seg) => seg.sectionId === currentSectionId);
    if (idx !== -1 && idx !== currentSegmentIndex) {
      setCurrentSegmentIndex(idx);
      setSegmentCurrentTime(0);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
    }
  }, [currentSectionId, audioSegments]);

  const activeSegment = audioSegments[currentSegmentIndex] || audioSegments[0];
  const activeSection = sections.find((s) => s.id === activeSegment?.sectionId) || sections[0];

  // Duration of current segment
  const segmentDuration = activeSegment?.duration || 30;

  // Handle Play / Pause
  const togglePlay = () => {
    if (isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  };

  const playAudio = () => {
    setIsPlaying(true);

    if (activeSegment?.audioDataUri && audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
      audioRef.current.play().catch((e) => console.warn("Audio play error:", e));
    } else if (typeof window !== "undefined" && "speechSynthesis" in window && activeSection?.audioScript) {
      // SpeechSynthesis Fallback
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(activeSection.audioScript);
      utterance.rate = playbackSpeed;
      utterance.pitch = 1.0;

      // Try selecting an English Indian or natural voice if available
      const voices = window.speechSynthesis.getVoices();
      const inVoice = voices.find((v) => v.lang.includes("en-IN") || v.lang.includes("en-GB") || v.name.includes("Natural"));
      if (inVoice) utterance.voice = inVoice;

      utterance.onend = () => {
        handleSegmentFinished();
      };

      utterance.onerror = (e) => {
        console.warn("SpeechSynthesis error:", e);
        setIsPlaying(false);
      };

      synthUtteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);

      // Track progress timer for synthesis fallback
      clearInterval(synthTimerRef.current);
      synthTimerRef.current = setInterval(() => {
        setSegmentCurrentTime((prev) => {
          const next = prev + 0.5 * playbackSpeed;
          if (next >= segmentDuration) {
            clearInterval(synthTimerRef.current);
            return segmentDuration;
          }
          if (activeSegment) {
            onTimeUpdate(activeSegment.startTime + next, activeSegment.sectionId);
          }
          return next;
        });
      }, 500);
    }
  };

  const pauseAudio = () => {
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.pause();
      clearInterval(synthTimerRef.current);
    }
  };

  // Called when audio segment completes
  const handleSegmentFinished = () => {
    if (currentSegmentIndex < audioSegments.length - 1) {
      const nextIdx = currentSegmentIndex + 1;
      setCurrentSegmentIndex(nextIdx);
      setSegmentCurrentTime(0);
      const nextSeg = audioSegments[nextIdx];
      onSectionChange(nextSeg.sectionId);
      // Auto continue playing next section
      setTimeout(() => playAudio(), 200);
    } else {
      setIsPlaying(false);
      setSegmentCurrentTime(0);
    }
  };

  // Skip Next / Prev
  const handleNextSection = () => {
    if (currentSegmentIndex < audioSegments.length - 1) {
      pauseAudio();
      const nextIdx = currentSegmentIndex + 1;
      setCurrentSegmentIndex(nextIdx);
      setSegmentCurrentTime(0);
      onSectionChange(audioSegments[nextIdx].sectionId);
    }
  };

  const handlePrevSection = () => {
    if (currentSegmentIndex > 0) {
      pauseAudio();
      const prevIdx = currentSegmentIndex - 1;
      setCurrentSegmentIndex(prevIdx);
      setSegmentCurrentTime(0);
      onSectionChange(audioSegments[prevIdx].sectionId);
    }
  };

  // Seek bar scrubber
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSec = parseFloat(e.target.value);
    setSegmentCurrentTime(newSec);

    if (audioRef.current && activeSegment?.audioDataUri) {
      audioRef.current.currentTime = newSec;
    }

    if (activeSegment) {
      onTimeUpdate(activeSegment.startTime + newSec, activeSegment.sectionId);
    }
  };

  // Speed changer
  const speeds = [0.75, 1, 1.25, 1.5, 2];
  const cycleSpeed = () => {
    const curIdx = speeds.indexOf(playbackSpeed);
    const nextSpeed = speeds[(curIdx + 1) % speeds.length];
    setPlaybackSpeed(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  // HTML5 audio time update
  const onAudioTimeUpdate = () => {
    if (audioRef.current && activeSegment) {
      const cur = audioRef.current.currentTime;
      setSegmentCurrentTime(cur);
      onTimeUpdate(activeSegment.startTime + cur, activeSegment.sectionId);
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      clearInterval(synthTimerRef.current);
    };
  }, []);

  // Download section audio (if base64 data URI available)
  const handleDownloadAudio = () => {
    if (activeSegment?.audioDataUri) {
      const a = document.createElement("a");
      a.href = activeSegment.audioDataUri;
      a.download = `lecturelens-${activeSegment.sectionId}.wav`;
      a.click();
    } else {
      alert("This segment was synthesized in browser memory. Configure Sarvam API key to generate permanent downloadable WAV files.");
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      {/* Hidden audio element for Sarvam audio data URI */}
      {activeSegment?.audioDataUri && (
        <audio
          ref={audioRef}
          src={activeSegment.audioDataUri}
          onTimeUpdate={onAudioTimeUpdate}
          onEnded={handleSegmentFinished}
          muted={isMuted}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Headphones className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-900">Audio Tutor</span>
              <span className="rounded bg-indigo-100 px-1.5 py-0.2 text-[9px] font-bold text-indigo-800">
                Sarvam Voice
              </span>
            </div>
            <p className="text-[10px] text-slate-500">
              Section {currentSegmentIndex + 1} of {audioSegments.length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={cycleSpeed}
            className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 transition"
          >
            {playbackSpeed}x
          </button>
          <button
            onClick={handleDownloadAudio}
            title="Download Audio Segment"
            className="rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-slate-600 hover:bg-slate-100 transition"
          >
            <Download className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Currently Spoken Topic Title */}
      <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100">
        <div className="flex items-center gap-1.5 mb-1">
          <div className={`h-2 w-2 rounded-full ${isPlaying ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Narrating Concept</span>
        </div>
        <p className="text-xs font-bold text-slate-900 line-clamp-1">{activeSection?.title}</p>
      </div>

      {/* Scrubber Progress Bar */}
      <div className="space-y-1">
        <input
          type="range"
          min={0}
          max={segmentDuration || 1}
          step={0.1}
          value={segmentCurrentTime}
          onChange={handleSeek}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-indigo-600"
        />
        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
          <span>{formatTimestamp(segmentCurrentTime)}</span>
          <span>{formatTimestamp(segmentDuration)}</span>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="flex items-center justify-center gap-4 pt-1">
        <button
          onClick={handlePrevSection}
          disabled={currentSegmentIndex === 0}
          className="rounded-full p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition"
          title="Previous Topic"
        >
          <SkipBack className="h-4 w-4" />
        </button>

        <button
          onClick={() => {
            setSegmentCurrentTime(0);
            if (audioRef.current) audioRef.current.currentTime = 0;
          }}
          className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 transition"
          title="Restart Section"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>

        <button
          onClick={togglePlay}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 transition"
        >
          {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current ml-0.5" />}
        </button>

        <button
          onClick={() => setIsMuted(!isMuted)}
          className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 transition"
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <VolumeX className="h-3.5 w-3.5 text-red-500" /> : <Volume2 className="h-3.5 w-3.5" />}
        </button>

        <button
          onClick={handleNextSection}
          disabled={currentSegmentIndex === audioSegments.length - 1}
          className="rounded-full p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition"
          title="Next Topic"
        >
          <SkipForward className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
