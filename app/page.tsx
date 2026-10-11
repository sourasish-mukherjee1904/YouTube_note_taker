"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { HeroInput } from "@/components/HeroInput";
import { ProcessingStatus } from "@/components/ProcessingStatus";
import { Workspace } from "@/components/Workspace";
import { ApiKeyModal } from "@/components/ApiKeyModal";
import { SAMPLE_LECTURE } from "@/lib/sample-data";
import { LectureData, VideoMetadata } from "@/types";

export default function Home() {
  const [view, setView] = useState<"home" | "processing" | "workspace">("home");
  const [lecture, setLecture] = useState<LectureData | null>(null);
  const [currentStage, setCurrentStage] = useState<string>("fetching_transcript");
  const [stageMessage, setStageMessage] = useState<string>("Ingesting video...");
  const [activeMetadata, setActiveMetadata] = useState<VideoMetadata | null>(null);
  const [processingError, setProcessingError] = useState<string | null>(null);

  // API Keys state
  const [sarvamKey, setSarvamKey] = useState<string>("");
  const [tavilyKey, setTavilyKey] = useState<string>("");
  const [isKeyModalOpen, setIsKeyModalOpen] = useState<boolean>(false);
  const [hasServerSarvamKey, setHasServerSarvamKey] = useState<boolean>(false);

  // Check health and server keys on mount
  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await fetch("/api/health");
        if (res.ok) {
          const data = await res.json();
          if (data.environment?.hasSarvamApiKey) {
            setHasServerSarvamKey(true);
          }
        }
      } catch (err) {
        console.warn("Health check error:", err);
      }
    };
    fetchHealth();

    // Load keys from localStorage if saved
    if (typeof window !== "undefined") {
      const storedSarvam = localStorage.getItem("lecturelens_sarvam_key");
      const storedTavily = localStorage.getItem("lecturelens_tavily_key");
      if (storedSarvam) setSarvamKey(storedSarvam);
      if (storedTavily) setTavilyKey(storedTavily);
    }
  }, []);

  const handleSaveKeys = (newSarvam: string, newTavily: string) => {
    setSarvamKey(newSarvam);
    setTavilyKey(newTavily);
    if (typeof window !== "undefined") {
      localStorage.setItem("lecturelens_sarvam_key", newSarvam);
      localStorage.setItem("lecturelens_tavily_key", newTavily);
    }
  };

  const handleProcessUrl = async (url: string, manualTranscript?: string) => {
    setView("processing");
    setProcessingError(null);
    setCurrentStage("fetching_transcript");
    setStageMessage("Extracting full speech captions, timing offsets, and speaker segments...");

    try {
      // Initiate request to /api/process
      const res = await fetch("/api/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(sarvamKey ? { "x-sarvam-key": sarvamKey } : {}),
        },
        body: JSON.stringify({
          url,
          manualTranscript,
          apiKey: sarvamKey || undefined,
          tavilyKey: tavilyKey || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to process lecture video.");
      }

      if (data.success && data.data) {
        setLecture(data.data);
        setView("workspace");
      } else {
        throw new Error("Invalid response received from processing server.");
      }
    } catch (err: any) {
      console.error("Processing failure:", err);
      setProcessingError(err.message || "An unexpected error occurred.");
    }
  };

  const handleLoadSample = () => {
    setLecture(SAMPLE_LECTURE);
    setView("workspace");
  };

  const handleReset = () => {
    setView("home");
    setProcessingError(null);
  };

  const hasActiveKey = hasServerSarvamKey || Boolean(sarvamKey && sarvamKey.trim().length > 0);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar
        hasApiKey={hasActiveKey}
        onOpenKeyModal={() => setIsKeyModalOpen(true)}
        onLoadDemo={handleLoadSample}
        onReset={handleReset}
      />

      <main className="flex-1">
        {view === "home" && (
          <HeroInput
            onSubmitUrl={handleProcessUrl}
            onLoadSample={handleLoadSample}
            isProcessing={false}
          />
        )}

        {view === "processing" && (
          <ProcessingStatus
            currentStage={currentStage}
            stageMessage={stageMessage}
            metadata={activeMetadata}
            error={processingError}
            onRetry={() => handleReset()}
            onCancel={handleReset}
          />
        )}

        {view === "workspace" && lecture && (
          <Workspace lecture={lecture} onBackToSearch={handleReset} />
        )}
      </main>

      <ApiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        currentSarvamKey={sarvamKey}
        currentTavilyKey={tavilyKey}
        onSave={handleSaveKeys}
      />
    </div>
  );
}
