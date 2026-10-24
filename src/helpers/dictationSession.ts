import { dictationPhrases } from '@/constants/dictationPhrases';
import type { DictationHistory, DictationPhrase } from '@/types/dictation';
import type { AssimilPreparedLesson } from '@/types/learning';

export function dictationKey(text: string): string {
  return text.toLowerCase().replace(/[’‘]/g, "'").replace(/[^a-z0-9']/g, ' ').replace(/\s+/g, ' ').trim();
}

export function buildDictationPool(level: DictationPhrase['level'], lesson?: AssimilPreparedLesson): DictationPhrase[] {
  const source = lesson?.title ?? '';
  const lessonPhrases: DictationPhrase[] = lesson ? [
    ...(lesson.artifact?.sentences.map((sentence) => ({
      id: `${lesson.id}-${sentence.id}`, text: sentence.textEn, translation: sentence.textFr, source, level,
    })) ?? []),
    ...(lesson.audioAnalysis?.dialogue?.map((line, index) => ({
      id: `${lesson.id}-dialogue-${index}`, text: line.text, translation: line.textFr, source, level,
    })) ?? []),
    ...(lesson.artifact?.exercises.filter((exercise) => exercise.type === 'dictation').flatMap((exercise) =>
      exercise.items.map((item, index) => ({
        id: `${lesson.id}-${exercise.id}-${index}`, text: item.answer, source, level,
      }))) ?? []),
  ] : [];
  const seen = new Set<string>();
  return [...lessonPhrases, ...dictationPhrases.filter((phrase) => phrase.level === level)].filter((phrase) => {
    const key = dictationKey(phrase.text);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function selectDictationSeries(
  pool: DictationPhrase[], history: DictationHistory, previous: string[] = [], size = 5,
): DictationPhrase[] {
  const previousKeys = new Set(previous);
  return pool.map((phrase) => ({ phrase, random: Math.random(), key: dictationKey(phrase.text) }))
    .sort((left, right) => {
      const leftSeen = history[left.key] ?? 0;
      const rightSeen = history[right.key] ?? 0;
      return Number(leftSeen > 0) - Number(rightSeen > 0)
        || Number(previousKeys.has(left.key)) - Number(previousKeys.has(right.key))
        || leftSeen - rightSeen || left.random - right.random;
    })
    .slice(0, size).map(({ phrase }) => phrase);
}

export function evaluateDictation(answer: string, expected: string): boolean {
  return dictationKey(answer) === dictationKey(expected);
}
