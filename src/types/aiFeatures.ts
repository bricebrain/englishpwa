/** Fonctions IA servies par le Worker (Workers AI, Vectorize). */

export type PassageSource = 'content' | 'reading' | 'srt';

export interface SemanticResult {
  score: number;
  source: PassageSource;
  refId: string;
  parentId: string;
  title: string;
  text: string;
  textFr?: string;
  level?: string;
}

export interface WordContext {
  source: PassageSource;
  parentId: string;
  title: string;
  sentence: string;
}

export interface SentenceExercise {
  prompt: string;
  expected: string;
  hint: string;
  distractors: string[];
  wordId?: string;
}

export interface DailySentences {
  day: string;
  targets: string[];
  exercises: SentenceExercise[];
}

export interface ComprehensionQuestion {
  question: string;
  answer: string;
}

export interface DailyStory {
  day: string;
  title: string;
  textEn: string;
  textFr: string;
  wordsUsed: string[];
  questions: ComprehensionQuestion[];
}

export interface LiveAnalysis {
  summaryFr: string;
  strengths: string[];
  errors: { wrong: string; correct: string; explanationFr: string }[];
  expressions: { en: string; fr: string; example: string }[];
}
