import type { ConstructionId, Evaluation } from '@/types/pedagogy';

export interface LearningObservation {
  id: string;
  at: string;
  source: 'triage' | 'flashcards' | 'lingvist' | 'dictation' | 'sentence_builder';
  skill: 'recognition' | 'recall' | 'guided_usage' | 'listening' | 'guided_writing';
  targetId: string;
  context: string;
  answer: string;
  usedHint: boolean;
  outcome: Evaluation['outcome'] | 'declared' | 'focus';
  constructionId?: ConstructionId;
}
export type ObservationInput = Omit<LearningObservation, 'id' | 'at'>;
