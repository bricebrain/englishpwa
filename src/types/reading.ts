export interface ReadingItem {
  id: string;
  title: string;
  category: string;
  level: string;
  description: string | null;
  summaryFr: string | null;
  sourceTitle: string;
  segmentCount: number;
  wordCount: number;
  audioUrl: string | null;
}

export interface ReadingQuestion {
  question: string;
  answer: string;
  type: string;
}

export interface ReadingSegment {
  id: string;
  itemId: string;
  title: string;
  text: string;
  summaryFr: string;
  level: string;
  segmentIndex: number;
  wordCount: number;
  vocabulary: string[];
  questions: ReadingQuestion[];
}

export interface SrtSource {
  id: string;
  title: string;
  language: string;
  episodeCount: number;
  sceneCount: number;
  readyCount: number;
}

export interface SrtEpisode {
  id: string;
  sourceId: string;
  episodeNo: number;
  title: string;
  sceneCount: number;
  lineCount: number;
  durationSec: number | null;
}

export interface SrtScene {
  id: string;
  episodeId: string;
  sceneIndex: number;
  startTime: string;
  endTime: string;
  text: string;
  summaryFr: string | null;
  vocabulary: string[];
  level: string;
  wordCount: number;
  wordsPerMin: number;
  shadowingPrompts: string[];
  /** Questions de compréhension générées la nuit par Workers AI. */
  questions?: { question: string; answer: string }[];
}
