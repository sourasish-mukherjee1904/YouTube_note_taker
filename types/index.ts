export interface TranscriptSegment {
  text: string;
  start: number; // in seconds
  duration: number; // in seconds
}

export interface VideoMetadata {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
  durationSeconds: number;
  durationFormatted: string;
}

export interface NoteBlock {
  id: string;
  type: "paragraph" | "heading" | "definition" | "formula" | "example" | "table" | "warning" | "takeaway" | "supplementary";
  content: string; // Markdown or plain text
  latex?: string; // Optional LaTeX equation
  sourceCitation?: {
    title: string;
    url: string;
    sourceName: string;
    accessedDate: string;
  };
}

export interface NoteSection {
  id: string;
  title: string;
  order: number;
  youtubeStartTime: number; // in seconds
  youtubeEndTime: number; // in seconds
  summary: string;
  blocks: NoteBlock[];
  supplementaryNotes?: NoteBlock[];
  audioScript?: string; // Conversational lesson script for this section
  audioSegmentId?: string;
  audioDurationSeconds?: number;
}

export interface PracticeQuestion {
  question: string;
  answer: string;
  explanation: string;
}

export interface RevisionSheet {
  quickSummary: string[];
  coreFormulas: { formula: string; explanation: string }[];
  keyDefinitions: { term: string; definition: string }[];
  examTips: string[];
}

export interface AudioSegment {
  id: string;
  sectionId: string;
  sectionTitle: string;
  audioDataUri?: string; // base64 data URI (audio/wav or audio/mp3)
  startTime: number; // cumulative start time in seconds
  duration: number; // duration in seconds
  endTime: number; // cumulative end time in seconds
  noteBlockIds: string[];
  youtubeStartTime: number;
  youtubeEndTime: number;
}

export interface LearningGap {
  id: string;
  topicTitle: string;
  sectionId: string;
  unclearConcept: string;
  reason: string;
  searchQuery: string;
  resolution?: string;
  resolvedCitation?: {
    title: string;
    url: string;
    sourceName: string;
  };
}

export interface LectureData {
  id: string;
  youtubeUrl: string;
  metadata: VideoMetadata;
  transcript: TranscriptSegment[];
  overview: string;
  prerequisites: string[];
  sections: NoteSection[];
  learningGaps: LearningGap[];
  revisionSheet: RevisionSheet;
  practiceQuestions: PracticeQuestion[];
  audioSegments: AudioSegment[];
  totalAudioDuration: number;
  createdAt: string;
  status: "idle" | "fetching_transcript" | "analyzing_structure" | "generating_notes" | "researching_gaps" | "generating_audio" | "completed" | "failed";
  errorMessage?: string;
}

export interface JobProgress {
  stage: LectureData["status"];
  message: string;
  percent: number;
  data?: Partial<LectureData>;
}
