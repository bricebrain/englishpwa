import type { Evaluation, LabExercise } from '@/types/pedagogy';

export function normalizeLabAnswer(value: string): string {
  return value.toLowerCase().replace(/[’‘]/g, "'")
    .replace(/\bdon't\b/g, 'do not').replace(/\bdoesn't\b/g, 'does not')
    .replace(/\b(i|you|he|she|we|they)'d\b/g, '$1 would')
    .replace(/\b(i|you|we|they)'ve\b/g, '$1 have')
    .replace(/\b(i|you|he|she|it|we|they)'ll\b/g, '$1 will')
    .replace(/\bwon't\b/g, 'will not')
    .replace(/\bdidn't\b/g, 'did not')
    .replace(/[.,!?;:]/g, '').replace(/\s+/g, ' ').trim();
}

export function evaluateLabAnswer(exercise: LabExercise, answer: string): Evaluation {
  const normalized = normalizeLabAnswer(answer);
  if (exercise.accepted.some((variant) => normalizeLabAnswer(variant) === normalized)) {
    return { outcome: 'correct', explanation: exercise.explanation };
  }
  const error = exercise.knownErrors?.find((item) => normalizeLabAnswer(item.answer) === normalized);
  if (error) {
    return { outcome: 'incorrect', explanation: error.explanation, errorCategory: error.category };
  }
  return {
    outcome: 'uncertain',
    explanation: 'Cette formulation doit être vérifiée. Le correcteur local ne peut pas conclure : elle n’est pas comptée comme une erreur ni comme une maîtrise.',
  };
}
