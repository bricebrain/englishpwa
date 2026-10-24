import type { VocabularyEnrichmentDto } from '@/types/vocabulary';

export interface LearningProfile {
  id: string;
  name: string;
  level: 'A2' | 'B1' | 'B2' | 'C1';
  dailyGoal: number;
}

export interface DashboardData {
  reviewedToday: number;
  dueCount: number;
  learnedCount: number;
  totalCount: number;
  streak: number;
  activeDays: boolean[];
  preparedContentCount: number;
}

export interface LingvistCard {
  id: string;
  wordId?: string;
  srsWord?: SrsWord;
  lemma: string;
  targetPos?: 'verb' | 'other';
  verbFormLabel?: string | null;
  inputPlaceholder?: string;
  expectedAnswer: string;
  sentenceWithGap: string;
  sentenceFull: string;
  translationFr: string;
  wordTraductionFr?: string;
  /** Sens visé par la phrase, si le Worker le transmet. */
  senseKey?: string;
  grammarHint: string;
  level: LearningProfile['level'];
  source?: 'remote' | 'local';
  qualityReasons?: string[];
  qualityScore?: number;
  qualityStatus?: 'valid' | 'rebuilt' | 'needs_regeneration';
  sourceLesson?: {
    provider: 'assimil';
    lessonIndex: number;
    lessonCode: string;
    titleEn: string | null;
    titleFr: string | null;
    level: string;
    recycled: boolean;
  };
  nativeAudio?: {
    audioUrl: string;
    start: number;
    end: number;
    speakerLabel: string;
    speakerNumber: number;
    gender: 'female' | 'male' | 'unknown';
    emotion: string;
    tone: string;
    text: string;
    textFr: string;
  };
}

export type ReviewGrade = 'again' | 'hard' | 'good' | 'easy';
export type ReviewMode = 'due' | 'new' | 'mixed';
export type ReviewResult = 'success' | 'almost' | 'fail';

export interface LingvistAnalysis {
  result: ReviewResult;
  score: number;
  shortFeedback: string;
  explanation: string;
  examples: string[];
  commonMistakes: string[];
  usageCases: string[];
}

export interface LingvistDecision {
  resultKind: 'success' | 'almost' | 'error' | 'dont_know';
  grade: ReviewGrade;
  analysis: LingvistAnalysis | null;
  responseTimeSeconds: number;
  stars: number;
  known: boolean;
  metadata: Record<string, unknown>;
}

export interface WordExample {
  en: string;
  fr: string;
}

export interface SrsWord {
  id: string;
  mot: string;
  traduction: string | null;
  niveau: string;
  type: string | null;
  ipa_uk: string | null;
  ipa_us: string | null;
  exemple_en: string | null;
  exemple_fr: string | null;
  examples?: WordExample[];
  audio_uk: string | null;
  audio_us: string | null;
  prochaine_revision: string;
  intervalle: number;
  facilite: number;
  repetitions: number;
  derniere_revision: string | null;
  seen_count: number;
  success_count: number;
  almost_count: number;
  fail_count: number;
  level: number;
  status: 'new' | 'learning' | 'known';
  review_history?: Array<Record<string, unknown>>;
  enrichment?: VocabularyEnrichmentDto | null;
}

export interface SrsSession {
  words: SrsWord[];
  reviewHistory: Record<string, number>;
  dueCount: number;
  newCount: number;
}

export interface SrsTriageCandidate {
  id: string;
  mot: string;
  traduction: string | null;
  niveau: string;
  type: string | null;
  frequence: number;
  enrichment?: VocabularyEnrichmentDto | null;
}

/** Résumé renvoyé par GET /content?view=summary : la liste ne contient ni
 *  segments, ni chunks, ni textes complets (servis par GET /content/:id). */
export interface PreparedContentSummary {
  segmentCount: number;
  chunkCount: number;
  grammarPointCount: number;
  hasTimings: boolean;
  bodyTruncated: boolean;
  truncatedKeys: string[];
}

export interface PreparedContent {
  id: string;
  profileId?: string;
  title: string;
  source: string;
  durationLabel: string;
  language: string;
  level?: string | null;
  topic?: string | null;
  body: string;
  audioUrl?: string;
  audioR2Key?: string | null;
  type?: 'story' | 'grammar_note' | 'translation' | 'podcast' | 'course' | 'channel_lesson' | 'daily_podcast' | 'script_audio' | 'youtube_import';
  metadata?: Record<string, unknown>;
  /** Présent seulement pour un élément de liste résumé (détail à charger). */
  summary?: PreparedContentSummary;
  isFavorite?: boolean;
  publishedAt: string;
}

export type AssimilLevel = 'all' | 'A1' | 'A2' | 'B1' | 'B2';

export interface AssimilLesson {
  id: string;
  index: number;
  code: string;
  title: string;
  titleEn?: string | null;
  titleFr?: string | null;
  level: Exclude<AssimilLevel, 'all'>;
  stageLabel: string;
  audioUrl: string;
  available?: boolean;
  status?: 'audio_ready' | 'transcribing' | 'transcript_ready' | 'generated';
  artifactAvailable?: boolean;
}

export interface AssimilArtifact {
  titleEn: string;
  titleFr: string;
  summaryFr: string;
  objectives: string[];
  sentences: { id: string; textEn: string; textFr: string; focus: string; pronunciationTipFr: string }[];
  notes?: { id: string; topic: string; explanationFr: string; examples: { en: string; fr: string }[] }[];
  exercises: {
    id: string;
    type: 'dictation' | 'fill_blank' | 'translation' | 'shadowing';
    instructionFr: string;
    items: { prompt: string; answer: string; hintFr?: string; focus?: string }[];
  }[];
  recyclingTargets: { term: string; reasonFr: string; skill: 'vocabulary' | 'grammar' | 'listening' | 'speaking' | 'idiom' }[];
}

export interface AssimilDialogueLine {
  speakerLabel: string;
  speakerNumber: number;
  gender: 'female' | 'male' | 'unknown';
  text: string;
  textFr?: string;
  emotion: string;
  tone: string;
  start: number;
  end: number;
}

export interface AssimilPreparedLesson extends AssimilLesson {
  transcript: string | null;
  transcriptSource: string | null;
  artifact: AssimilArtifact | null;
  audioAnalysis?: {
    summaryFr?: string;
    dialogue?: AssimilDialogueLine[];
    pedagogicalNotes?: { topic: string; explanationFr: string }[];
  } | null;
  generatedBy: string | null;
}

export interface AssimilProgress {
  index: number;
  listened: boolean;
  guided: boolean;
  exercises: number;
  kept: number;
  lastAt: string | null;
}

export interface StatisticsData extends DashboardData {
  retentionRate: number;
  weeklyReviews: number[];
  strengths: string[];
  focusAreas: string[];
}

export interface UserPreferences {
  profile: LearningProfile;
  denseMode: boolean;
  autoPlayAudio: boolean;
  hapticsEnabled: boolean;
}
