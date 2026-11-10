import type { LearningObservation } from '@/types/learningObservation';

export type ConstructionId = 'want_to_verb' | 'would_like_to_verb' | 'present_simple_negative'
  | 'past_simple' | 'present_perfect' | 'first_conditional';
export type ActivityKind = 'comprehension' | 'transformation' | 'error_correction' | 'production' | 'transfer';
export type ErrorCategory = 'missing_word' | 'subject_agreement' | 'auxiliary';

export interface Construction {
  id: ConstructionId;
  level: 'A1' | 'A2' | 'B1' | 'B2';
  category: string;
  objective: string;
  description: string;
  pattern: string;
  examples: string[];
  commonErrors: { sentence: string; category: ErrorCategory; explanation: string }[];
  prerequisites: ConstructionId[];
  related: ConstructionId[];
  exerciseTypes: ActivityKind[];
  masteryCriteria: { delayedTransfers: number; minimumDelayDays: number; distinctContexts: number };
}

export interface LabExercise {
  id: string;
  kind: ActivityKind;
  prompt: string;
  source?: string;
  hint?: string;
  accepted: string[];
  explanation: string;
  knownErrors?: { answer: string; category: ErrorCategory; explanation: string }[];
}

export interface LabContext {
  id: string;
  title: string;
  text: string;
  topic: string;
  vocabulary: string[];
  exercises: LabExercise[];
  transfer: LabExercise;
}

export interface Evaluation {
  outcome: 'correct' | 'incorrect' | 'uncertain';
  explanation: string;
  errorCategory?: ErrorCategory;
}

export interface LearningEvidence {
  id: string;
  sessionId: string;
  constructionId: ConstructionId;
  exerciseId: string;
  contextId: string;
  kind: ActivityKind;
  usedHint: boolean;
  answer: string;
  at: string;
  evaluation: Evaluation;
}

export interface PedagogyProfile {
  version: 1;
  evidence: LearningEvidence[];
  observations?: LearningObservation[];
}

export interface CompetencyProgress {
  constructionId: ConstructionId;
  status: 'new' | 'learning' | 'consolidating' | 'mastered';
  dueAt: string | null;
  delayedTransfers: number;
  pendingCount: number;
  showHints: boolean;
  lastContextId: string | null;
}

export interface LabSession {
  id: string;
  construction: Construction;
  context: LabContext;
  exercises: LabExercise[];
  showHints: boolean;
  isDue: boolean;
  mixed?: boolean;
  targets?: { construction: Construction; context: LabContext; exercise: LabExercise }[];
}
