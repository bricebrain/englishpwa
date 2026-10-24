import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { loadDictationHistory, saveDictationAttempt } from '@/services/dictationHistoryService';

beforeEach(() => {
  const storage = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => { storage.set(key, value); },
  });
});
afterEach(() => vi.unstubAllGlobals());

describe('historique des dictées', () => {
  it('persiste les phrases par profil et conserve l’ordre des tentatives', () => {
    saveDictationAttempt('alice', 'first phrase');
    saveDictationAttempt('alice', 'second phrase');
    const history = loadDictationHistory('alice');
    expect(history['second phrase']).toBeGreaterThan(history['first phrase']!);
    expect(loadDictationHistory('bob')).toEqual({});
    saveDictationAttempt('alice', 'first phrase');
    expect(loadDictationHistory('alice')['first phrase']).toBeGreaterThan(history['second phrase']!);
  });

  it('ignore les données corrompues et dates invalides', () => {
    const key = 'english-fluency:dictation-history:v1:alice';
    for (const value of ['{', 'null', '[]', '42']) {
      localStorage.setItem(key, value);
      expect(loadDictationHistory('alice')).toEqual({});
    }
    localStorage.setItem(key, JSON.stringify({ valid: 123, wrong: '123', negative: -1 }));
    expect(loadDictationHistory('alice')).toEqual({ valid: 123 });
  });

  it('continue à fonctionner si le stockage est bloqué', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => { throw new Error('blocked'); },
      setItem: () => { throw new Error('blocked'); },
    });
    expect(loadDictationHistory('alice')).toEqual({});
    expect(() => saveDictationAttempt('alice', 'hello')).not.toThrow();
  });

  it('borne l’historique en gardant la dernière phrase', () => {
    localStorage.setItem('english-fluency:dictation-history:v1:alice', JSON.stringify(
      Object.fromEntries(Array.from({ length: 1000 }, (_, index) => [`phrase ${index}`, index + 1])),
    ));
    saveDictationAttempt('alice', 'latest');
    const history = loadDictationHistory('alice');
    expect(Object.keys(history)).toHaveLength(1000);
    expect(history.latest).toBeGreaterThan(0);
    expect(history['phrase 0']).toBeUndefined();
  });
});
