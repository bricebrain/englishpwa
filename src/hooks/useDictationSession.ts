import { useEffect, useRef, useState } from 'react';

import { useLearningTracking } from '@/hooks/useLearningTracking';
import { dictationKey, evaluateDictation, selectDictationSeries } from '@/helpers/dictationSession';
import { loadDictationHistory, saveDictationAttempt } from '@/services/dictationHistoryService';
import { canSpeak, speakEnglish, stopEnglishSpeech } from '@/services/speechPlaybackService';
import type { DictationPhrase } from '@/types/dictation';

export function useDictationSession(pool: DictationPhrase[], profileId: string) {
  const tracking = useLearningTracking(profileId);
  const [series, setSeries] = useState(() => selectDictationSeries(pool, loadDictationHistory(profileId)));
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const [audioError, setAudioError] = useState('');
  const playback = useRef(0);
  const attempted = useRef(false);
  const hasPlayed = useRef(false);
  const phrase = series[index];
  const history = loadDictationHistory(profileId);
  const unseenCount = pool.filter((item) => !history[dictationKey(item.text)]).length;

  useEffect(() => () => {
    playback.current += 1;
    if (hasPlayed.current) stopEnglishSpeech();
  }, []);

  const stop = () => {
    playback.current += 1;
    if (hasPlayed.current) stopEnglishSpeech();
    setSpeaking(false);
  };

  const listen = async () => {
    if (!phrase) return;
    if (speaking) { stop(); return; }
    if (!canSpeak()) {
      setAudioError('La lecture audio est indisponible dans ce navigateur.');
      return;
    }
    const request = ++playback.current;
    hasPlayed.current = true;
    setAudioError('');
    setSpeaking(true);
    try {
      await speakEnglish(phrase.text);
    } catch {
      if (request === playback.current) setAudioError('Lecture impossible. Réessaie en appuyant sur Écouter.');
    } finally {
      if (request === playback.current) setSpeaking(false);
    }
  };

  const validate = () => {
    if (!phrase || !answer.trim() || attempted.current) return;
    attempted.current = true;
    stop();
    const correct = evaluateDictation(answer, phrase.text);
    saveDictationAttempt(profileId, dictationKey(phrase.text));
    tracking.record({ source: 'dictation', skill: 'listening', targetId: dictationKey(phrase.text),
      context: phrase.text, answer, usedHint: false, outcome: correct ? 'correct' : 'incorrect' });
    setResult(correct);
    if (correct) setScore((value) => value + 1);
  };

  const resetAnswer = () => {
    attempted.current = false;
    setAnswer('');
    setResult(null);
    setAudioError('');
  };

  const next = () => {
    if (!attempted.current) return;
    stop();
    setIndex((value) => value + 1);
    resetAnswer();
  };

  const newSeries = () => {
    stop();
    setSeries(selectDictationSeries(pool, loadDictationHistory(profileId), series.map((item) => dictationKey(item.text))));
    setIndex(0);
    setScore(0);
    resetAnswer();
  };

  return {
    trackingError: tracking.saveError,
    phrase, answer, setAnswer, result, score, speaking, audioError, unseenCount,
    index, total: series.length, completed: index >= series.length,
    isReview: Boolean(phrase && history[dictationKey(phrase.text)] && result === null),
    listen, validate, next, newSeries,
  };
}
