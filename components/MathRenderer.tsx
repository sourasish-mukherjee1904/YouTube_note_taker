"use client";

import React, { useMemo } from "react";
import katex from "katex";

interface MathRendererProps {
  latex: string;
  displayMode?: boolean;
}

export function MathRenderer({ latex, displayMode = true }: MathRendererProps) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(latex, {
        displayMode,
        throwOnError: false,
      });
    } catch (e) {
      return `<code class="text-xs text-red-600">${latex}</code>`;
    }
  }, [latex, displayMode]);

  return (
    <div
      className={`katex-wrapper overflow-x-auto py-1 ${displayMode ? "text-center my-2" : "inline-block"}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
