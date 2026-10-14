export interface LingvistProgress {
  cardIndex: number;
  correctCount: number;
  answer: string;
}

const KEY = 'english-fluency:lingvist-progress:v2';

export function loadLingvistProgress(): LingvistProgress {
  try {
    const value = sessionStorage.getItem(KEY);
    return value ? JSON.parse(value) : { cardIndex: 0, correctCount: 0, answer: '' };
  } catch {
    return { cardIndex: 0, correctCount: 0, answer: '' };
  }
}

export function saveLingvistProgress(progress: LingvistProgress): void {
  sessionStorage.setItem(KEY, JSON.stringify(progress));
}

export function clearLingvistProgress(): void {
  sessionStorage.removeItem(KEY);
}
