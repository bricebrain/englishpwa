import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { lingvistCardsMock } from '@/mocks/learningData';
import { clearLingvistProgress, loadLingvistProgress, saveLingvistProgress } from '@/services/sessionStorageService';

beforeEach(() => {
  const store = new Map<string, string>();
  vi.stubGlobal('sessionStorage', {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => { store.set(key, value); },
    removeItem: (key: string) => { store.delete(key); },
  });
});
afterEach(() => vi.unstubAllGlobals());

describe('reprise d’une session Lingvist', () => {
  const progress = { cards: lingvistCardsMock, cardIndex: 2, correctCount: 1, answer: 'test' };

  it('restaure la série exacte avec sa progression', () => {
    saveLingvistProgress('default', progress);
    expect(loadLingvistProgress('default')).toEqual(progress);
    expect(loadLingvistProgress('other').cards).toBeUndefined();
  });

  it('efface la série au redémarrage', () => {
    saveLingvistProgress('default', progress);
    clearLingvistProgress('default');
    expect(loadLingvistProgress('default')).toEqual({ cardIndex: 0, correctCount: 0, answer: '' });
  });

  it('ignore les anciennes progressions sans cartes et les données invalides', () => {
    sessionStorage.setItem('english-fluency:lingvist-progress:v2', JSON.stringify(progress));
    expect(loadLingvistProgress('default').cards).toBeUndefined();
    sessionStorage.setItem('english-fluency:lingvist-progress:v3:default', '{');
    expect(loadLingvistProgress('default').cardIndex).toBe(0);
    saveLingvistProgress('default', { ...progress, cardIndex: 1000 });
    expect(loadLingvistProgress('default').cards).toBeUndefined();
  });

  it('reste utilisable lorsque le stockage est bloqué', () => {
    vi.stubGlobal('sessionStorage', {
      getItem: () => { throw new Error('blocked'); },
      setItem: () => { throw new Error('blocked'); },
      removeItem: () => { throw new Error('blocked'); },
    });
    expect(loadLingvistProgress('default').cardIndex).toBe(0);
    expect(() => saveLingvistProgress('default', progress)).not.toThrow();
    expect(() => clearLingvistProgress('default')).not.toThrow();
  });
});
