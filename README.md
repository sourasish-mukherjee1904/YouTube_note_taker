# LectureLens — AI-Powered YouTube Study Companion

Turn any educational YouTube lecture into notes you can listen to.

LectureLens transforms video lectures into an interactive study workspace featuring timestamped transcripts, deep structured study notes, automated learning gap detection, verified web research enrichments, high-resolution downloadable PDFs, and a synchronized audio tutor powered by **Sarvam AI**.

---

## 🌟 Key Features

1. **Complete Video & Transcript Ingestion**:
   - Ingests public YouTube lectures via URL.
   - Extracts complete transcripts with accurate timestamps.
   - Handles long lectures with timestamp-preserving overlapping semantic chunks.
   - Provides graceful fallback for videos without captions via manual transcript input.

2. **Multistage AI Note Generation**:
   - **Stage A (Structure Outline)**: Identifies major topics, prerequisites, derivations, and timestamps.
   - **Stage B (Detailed Study Notes)**: Generates comprehensive overviews, definitions, LaTeX formulas, comparison tables, common misconceptions, and practice Q&As.
   - **Stage C (Learning Gap Identification)**: Uncovers unexplained prerequisites and skipped derivation steps.
   - **Stage D (Web Research Enrichment)**: Queries authoritative academic literature (Tavily / Wikipedia / DuckDuckGo) and integrates labeled supplementary notes with clickable citations.

3. **Spoken Audio Lesson via Sarvam AI**:
   - Spoken lesson generated using Sarvam's `bulbul:v4-flash` / `bulbul:v3` text-to-speech models.
   - Natural conversational phrasing that introduces concepts verbally and explains equations intuitively.
   - Multi-segment continuous playback sequencer.

4. **Synchronized 3-Panel Study Workspace**:
   - **Left Panel**: Embedded YouTube player with topic milestones. Clicking any topic seeks the video.
   - **Center Panel**: Structured study notes with collapsible sections, LaTeX math rendering (KaTeX), and active section highlighting.
   - **Right Panel / Drawer**: Audio tutor player with seek bar, playback speed (0.75x–2.0x), and section switcher.
   - **Deterministic Synchronization**: Notes highlight dynamically as the audio progresses; clicking any note section jumps both audio and YouTube video.

5. **Professional Exports**:
   - **Download PDF**: Formatted academic document with cover page, table of contents, LaTeX styling, and page numbering.
   - **Export Markdown**: Clean GitHub-flavored Markdown document with all equations, tables, and citations.

---

## 🛠️ Tech Stack

- **Frontend & Backend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Math Rendering**: KaTeX
- **PDF Generation**: jsPDF
- **AI Engine**: Sarvam AI (`sarvam-105b` & `bulbul:v4-flash` TTS)
- **Web Research**: Tavily Search API with Wikipedia & DuckDuckGo fallbacks
- **Video Playback**: YouTube IFrame API

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ (tested on Node v22.16)
- Sarvam AI API Key (from [Sarvam Dashboard](https://dashboard.sarvam.ai))

### 2. Installation
```bash
git clone <repository_url>
cd youtube_note_taker
npm install
```

### 3. Environment Variables
Create a `.env` file in the project root:
```env
# Sarvam AI API Key
SARVAM_API_KEY=your_sarvam_api_key_here

# Optional: Tavily Search Key (falls back to Wikipedia/DDG if omitted)
TAVILY_API_KEY=your_tavily_api_key_here
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production
```bash
npm run build
npm start
```

---

## 🔒 Security & Credit Optimization
- API keys are never exposed to browser clients, client logs, or public repositories.
- Intermediate outputs are cached to prevent duplicate generation.
- Segmented text ensures Sarvam TTS requests stay strictly within safe payload limits without unexpected costs.
