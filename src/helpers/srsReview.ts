import type { ReviewGrade, SrsWord } from '@/types/learning';

/** Règles de répétition espacée partagées avec l'application mobile. */
export function buildReviewedWord(
  word: Partial<SrsWord>,
  grade: ReviewGrade,
  metadata: Record<string, unknown> = {},
  now = new Date(),
) {
  const result = grade === 'again' ? 'fail' : grade === 'hard' ? 'almost' : 'success';
  let repetitions = (word.repetitions ?? 0) + 1;
  const easeChange = { again: -0.2, hard: -0.05, good: 0.05, easy: 0.15 }[grade];
  const facilite = Math.max(1.3, (word.facilite ?? 2.5) + easeChange);
  let intervalle: number;

  if (grade === 'again') {
    repetitions = 0;
    intervalle = 1;
  } else if (grade === 'hard') {
    intervalle = repetitions === 1 ? 1 : repetitions === 2 ? 2 : Math.max(1, Math.round((word.intervalle ?? 0) * 1.2));
  } else if (grade === 'easy') {
    intervalle = repetitions === 1 ? 2 : repetitions === 2 ? 5 : Math.max(1, Math.round((word.intervalle ?? 0) * facilite * 1.3));
  } else {
    intervalle = repetitions === 1 ? 1 : repetitions === 2 ? 3 : Math.max(1, Math.round((word.intervalle ?? 0) * facilite));
  }

  const level = result === 'success'
    ? Math.min(4, (word.level ?? 0) + 1)
    : result === 'almost' ? Math.min(4, (word.level ?? 0) + 0.5) : Math.max(0, (word.level ?? 0) - 1);

  return {
    ...word,
    prochaine_revision: new Date(now.getTime() + intervalle * 86_400_000).toISOString(),
    derniere_revision: now.toISOString(),
    intervalle,
    facilite,
    repetitions,
    seen_count: (word.seen_count ?? 0) + 1,
    success_count: (word.success_count ?? 0) + (result === 'success' ? 1 : 0),
    almost_count: (word.almost_count ?? 0) + (result === 'almost' ? 1 : 0),
    fail_count: (word.fail_count ?? 0) + (result === 'fail' ? 1 : 0),
    level,
    status: level >= 4 ? 'known' as const : 'learning' as const,
    review_history: [...(word.review_history ?? []), { ...metadata, date: now.toISOString(), result }].slice(-20),
    lastGrade: grade,
  };
}
