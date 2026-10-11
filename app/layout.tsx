import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LectureLens — AI YouTube Study Companion",
  description:
    "Transform any YouTube educational video into structured academic study notes, web-enriched gap explanations, and synchronized audio lessons powered by Sarvam AI.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css"
        />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
