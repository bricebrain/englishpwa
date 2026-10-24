import { describe, expect, it } from 'vitest';

import { buildReviewedWord } from '@/helpers/srsReview';
import type { ReviewGrade, SrsWord } from '@/types/learning';

const now = new Date('2026-10-24T10:00:00Z');

describe('progression SRS', () => {
  it('programme un nouveau mot réussi pour demain', () => {
    expect(buildReviewedWord({ id: 'word' }, 'good', {}, now)).toMatchObject({
      prochaine_revision: '2026-10-25T10:00:00.000Z', repetitions: 1,
      seen_count: 1, success_count: 1, almost_count: 0, fail_count: 0, level: 1, status: 'learning',
    });
  });

  it.each<[ReviewGrade, number, number]>([
    ['again', 1, 0], ['hard', 2, 2], ['good', 3, 2], ['easy', 5, 2],
  ])('applique la note %s à un mot déjà revu', (grade, intervalle, repetitions) => {
    expect(buildReviewedWord({ repetitions: 1, intervalle: 1, facilite: 2.5 }, grade, {}, now))
      .toMatchObject({ intervalle, repetitions });
  });

  it('conserve les compteurs et l’historique sans modifier le mot source', () => {
    const word: Partial<SrsWord> = {
      repetitions: 2, intervalle: 3, facilite: 2.5, level: 3, seen_count: 5, success_count: 3,
      review_history: Array.from({ length: 20 }, () => ({ result: 'success' })),
    };
    const updated = buildReviewedWord(word, 'good', { sourceModule: 'lingvist' }, now);
    expect(updated).toMatchObject({ intervalle: 8, level: 4, status: 'known', seen_count: 6, success_count: 4 });
    expect(updated.review_history).toHaveLength(20);
    expect(updated.review_history.at(-1)).toMatchObject({ result: 'success', sourceModule: 'lingvist' });
    expect(word.success_count).toBe(3);
  });

  it('enregistre un échec et respecte le plancher de facilité', () => {
    expect(buildReviewedWord({ facilite: 1.3, level: 0, fail_count: 2 }, 'again', {}, now))
      .toMatchObject({ facilite: 1.3, level: 0, fail_count: 3, success_count: 0 });
  });
});
