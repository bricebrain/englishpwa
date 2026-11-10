import { constructions } from '@/constants/pedagogy/constructions';
import type { LearningObservation } from '@/types/learningObservation';
import type { PedagogyProfile } from '@/types/pedagogy';

export function isObservation(value: unknown): value is LearningObservation {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  return ['id', 'targetId', 'context', 'answer'].every((key) => typeof item[key] === 'string')
    && typeof item.at === 'string' && Number.isFinite(Date.parse(item.at))
    && typeof item.usedHint === 'boolean'
    && ['triage', 'flashcards', 'lingvist', 'dictation', 'sentence_builder'].includes(String(item.source))
    && ['recognition', 'recall', 'guided_usage', 'listening', 'guided_writing'].includes(String(item.skill))
    && ['correct', 'incorrect', 'uncertain', 'declared', 'focus'].includes(String(item.outcome))
    && (item.constructionId === undefined || constructions.some((entry) => entry.id === item.constructionId));
}

export function recentlyDeclaredIds(profile: PedagogyProfile, now = Date.now()): Set<string> {
  const latest = new Map<string, LearningObservation>();
  for (const item of profile.observations ?? []) {
    if (item.source === 'triage') latest.set(item.targetId, item);
  }
  return new Set([...latest.values()]
    .filter((item) => item.outcome === 'declared' && now - Date.parse(item.at) < 7 * 86_400_000)
    .map((item) => item.targetId));
}

export function recentlyDeclared(profile: PedagogyProfile, wordId: string, now = Date.now()): boolean {
  return recentlyDeclaredIds(profile, now).has(wordId);
}

export function summarizeLearning(profile: PedagogyProfile) {
  const observations = profile.observations ?? [];
  const evidence = profile.evidence;
  const declared = new Set(observations.filter((item) => item.outcome === 'declared').map((item) => item.targetId));
  const guided = new Set(observations.filter((item) => item.skill === 'guided_usage' && item.outcome === 'correct' && !item.usedHint).map((item) => item.targetId));
  const recall = new Set(observations.filter((item) => item.skill === 'recall' && item.outcome === 'correct' && !item.usedHint).map((item) => item.targetId));
  return {
    declared: declared.size, guided: guided.size, recall: recall.size,
    listening: observations.filter((item) => item.skill === 'listening' && item.outcome === 'correct').length,
    pending: evidence.filter((item) => item.evaluation.outcome === 'uncertain').length + observations.filter((item) => item.outcome === 'uncertain').length,
    writing: observations.filter((item) => item.source === 'sentence_builder' && item.outcome === 'correct').length,
    productions: evidence.filter((item) => ['production', 'transfer'].includes(item.kind) && !item.usedHint && item.evaluation.outcome === 'correct').length,
    errors: evidence.filter((item) => item.evaluation.outcome === 'incorrect' && item.evaluation.errorCategory),
    total: observations.length + evidence.length,
  };
}
