import { describe, expect, it } from 'vitest';
import { buildDictationPool, dictationKey, evaluateDictation, selectDictationSeries } from '@/helpers/dictationSession';
import { getAssimilPreparedMock } from '@/mocks/assimilData';

describe('sélection des dictées', () => {
  const pool = buildDictationPool('B1');

  it('fournit une banque par niveau suffisante pour deux séries inédites', () => {
    for (const level of ['A1', 'A2', 'B1', 'B2'] as const) {
      const phrases = buildDictationPool(level);
      expect(phrases.length).toBeGreaterThanOrEqual(10);
      expect(phrases.every((phrase) => phrase.level === level)).toBe(true);
    }
  });

  it('ne répète pas les phrases travaillées tant que cinq inédites restent', () => {
    const first = selectDictationSeries(pool, {});
    const history = Object.fromEntries(first.map((phrase, index) => [dictationKey(phrase.text), index + 1]));
    const second = selectDictationSeries(pool, history);
    expect(second).toHaveLength(5);
    expect(second.every((phrase) => !history[dictationKey(phrase.text)])).toBe(true);
  });

  it('évite aussi la série abandonnée quand une autre série est disponible', () => {
    const keys = selectDictationSeries(pool, {}).map((phrase) => dictationKey(phrase.text));
    expect(selectDictationSeries(pool, {}, keys).every((phrase) => !keys.includes(dictationKey(phrase.text)))).toBe(true);
  });

  it('termine les inédites avant de réviser les phrases les plus anciennes', () => {
    const history = Object.fromEntries(pool.slice(1).map((phrase, index) => [dictationKey(phrase.text), index + 1]));
    expect(selectDictationSeries(pool, history)).toEqual(pool.slice(0, 5));
    history[dictationKey(pool[0]!.text)] = 100;
    expect(selectDictationSeries(pool, history)).toEqual(pool.slice(1, 6));
  });

  it('déduplique les phrases issues de sources différentes', () => {
    const lesson = getAssimilPreparedMock(40);
    const text = lesson.artifact!.sentences[0]!.textEn;
    lesson.artifact!.exercises.push({ id: 'dictation', type: 'dictation', instructionFr: '', items: [{ prompt: 'Écouter', answer: text }] });
    const phrases = buildDictationPool('B1', lesson);
    expect(phrases.filter((phrase) => dictationKey(phrase.text) === dictationKey(text))).toHaveLength(1);
    expect(phrases.some((phrase) => phrase.source === lesson.title)).toBe(true);
  });

  it('gère une banque vide ou courte sans doublons', () => {
    expect(selectDictationSeries([], {})).toEqual([]);
    expect(selectDictationSeries(pool.slice(0, 2), {})).toHaveLength(2);
  });

  it('ignore casse et ponctuation, mais détecte un mot incorrect', () => {
    expect(evaluateDictation('  IT’S raining, today! ', "It's raining today.")).toBe(true);
    expect(evaluateDictation('It is raining tomorrow', 'It is raining today')).toBe(false);
  });
});
