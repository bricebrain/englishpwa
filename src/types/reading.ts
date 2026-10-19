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
