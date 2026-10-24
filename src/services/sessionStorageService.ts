import type { LingvistCard } from '@/types/learning';

export interface LingvistProgress {
  cardIndex: number;
  correctCount: number;
  answer: string;
  cards?: LingvistCard[];
}

const KEY = 'english-fluency:lingvist-progress:v3';

export function loadLingvistProgress(profileId: string): LingvistProgress {
  try {
    const value = sessionStorage.getItem(`${KEY}:${profileId}`);
    const progress: LingvistProgress | null = value ? JSON.parse(value) : null;
    if (progress && Array.isArray(progress.cards) && progress.cards.length > 0
      && progress.cards.every((card) => card && typeof card.id === 'string' && typeof card.sentenceWithGap === 'string')
      && Number.isInteger(progress.cardIndex) && progress.cardIndex >= 0 && progress.cardIndex <= progress.cards.length
      && Number.isInteger(progress.correctCount) && progress.correctCount >= 0 && progress.correctCount <= progress.cards.length
      && typeof progress.answer === 'string') {
      return progress;
    }
  } catch {
    // Un stockage indisponible ou une ancienne session ne bloque pas la révision.
  }
  return { cardIndex: 0, correctCount: 0, answer: '' };
}

export function saveLingvistProgress(profileId: string, progress: LingvistProgress): void {
  try {
    sessionStorage.setItem(`${KEY}:${profileId}`, JSON.stringify(progress));
  } catch { /* La session reste utilisable sans persistance. */ }
}

export function clearLingvistProgress(profileId: string): void {
  try {
    sessionStorage.removeItem(`${KEY}:${profileId}`);
  } catch { /* La nouvelle session peut démarrer sans accès au stockage. */ }
}
