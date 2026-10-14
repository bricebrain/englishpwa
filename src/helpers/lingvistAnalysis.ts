import type {
  LingvistAnalysis,
  LingvistCard,
  LingvistDecision,
  ReviewResult,
  SrsWord,
} from '@/types/learning';

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function distance(left: string, right: string): number {
  const row = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let i = 1; i <= left.length; i += 1) {
    let previous = row[0]!;
    row[0] = i;
    for (let j = 1; j <= right.length; j += 1) {
      const current = row[j]!;
      row[j] = Math.min(row[j]! + 1, row[j - 1]! + 1, previous + (left[i - 1] === right[j - 1] ? 0 : 1));
      previous = current;
    }
  }
  return row[right.length]!;
}

function stripVerbSuffix(value: string): string {
  return value.replace(/(ing|ed|es|s)$/i, '');
}

function isVerbFormConfusion(answer: string, expected: string, card: LingvistCard): boolean {
  if (card.targetPos !== 'verb') return false;
  const compactAnswer = normalize(answer).replace(/\s+/g, '');
  const compactExpected = normalize(expected).replace(/\s+/g, '');
  return Boolean(compactAnswer && compactExpected && compactAnswer !== compactExpected
    && stripVerbSuffix(compactAnswer) === stripVerbSuffix(compactExpected));
}

function isFullSentence(answer: string, card: LingvistCard): boolean {
  const value = normalize(answer);
  const sentence = normalize(card.sentenceFull);
  const expected = normalize(card.expectedAnswer);
  return Boolean(value && sentence && (value === sentence || (value.split(/\s+/).length >= 4 && value.includes(expected))));
}

export function analyzeAnswerLocally(card: LingvistCard, userAnswer: string): LingvistAnalysis {
  const expected = normalize(card.expectedAnswer);
  const answer = normalize(userAnswer);
  const fullSentence = isFullSentence(userAnswer, card);
  const verbForm = isVerbFormConfusion(userAnswer, card.expectedAnswer, card);
  const nearPlural = answer.endsWith('s')
    ? answer.slice(0, -1) === expected
    : expected.endsWith('s') && expected.slice(0, -1) === answer;
  const closeSpelling = Boolean(answer && distance(answer.replace(/\s/g, ''), expected.replace(/\s/g, '')) <= 1);

  let result: ReviewResult = 'fail';
  if (answer === expected) result = 'success';
  else if (fullSentence || closeSpelling || nearPlural || verbForm) result = 'almost';

  const shortFeedback = result === 'success'
    ? 'Correct. C’est exactement le mot attendu.'
    : !answer
      ? 'Aucune réponse saisie.'
      : fullSentence
        ? 'Le mot est présent, mais il fallait saisir uniquement l’élément manquant.'
        : verbForm
          ? 'Le bon verbe est reconnu, mais sa forme ne correspond pas au contexte.'
          : result === 'almost'
            ? 'Presque bon : petite erreur de forme ou d’orthographe.'
            : `La réponse ne correspond pas à « ${card.expectedAnswer} » dans ce contexte.`;

  const explanation = result === 'success'
    ? `« ${card.expectedAnswer} » complète naturellement la phrase et respecte l’indice grammatical.`
    : !answer
      ? 'Sans tentative, le mot reste prioritaire et reviendra rapidement dans le SRS.'
      : fullSentence
        ? 'Tu as compris la phrase, mais cet exercice mesure le rappel précis du mot manquant.'
        : verbForm
          ? `Le lemme est correct. La forme attendue est « ${card.expectedAnswer} » : observe les mots placés avant et après le trou.`
          : result === 'almost'
            ? `Le sens semble compris, mais la forme écrite doit être « ${card.expectedAnswer} ».`
            : `Ici, le contexte et le sens « ${card.wordTraductionFr ?? card.translationFr} » conduisent à « ${card.expectedAnswer} ».`;

  const commonMistakes = result === 'success' ? [] : [
    fullSentence
      ? 'Écrire toute la phrase au lieu du seul mot manquant.'
      : verbForm
        ? 'Utiliser le bon verbe avec une conjugaison inadaptée.'
        : 'Confondre un mot proche avec celui exigé par le contexte.',
  ];

  return {
    result,
    score: result === 'success' ? 1 : result === 'almost' ? 0.7 : answer ? 0.2 : 0.05,
    shortFeedback,
    explanation,
    examples: card.sentenceFull ? [`Contexte : ${card.sentenceFull}`] : [],
    commonMistakes,
    usageCases: card.grammarHint ? [card.grammarHint] : [],
  };
}

function timeScore(milliseconds: number): number {
  const seconds = milliseconds / 1000;
  if (seconds <= 4) return 1;
  if (seconds <= 8) return 0.9;
  if (seconds <= 14) return 0.75;
  if (seconds <= 22) return 0.55;
  if (seconds <= 35) return 0.35;
  return 0.2;
}

function historyScore(word?: SrsWord): number {
  if (!word) return 0.5;
  const total = word.success_count + word.almost_count + word.fail_count;
  return total ? Math.min(1, (word.success_count + word.almost_count * 0.5) / total) : 0.5;
}

function correctionMode(card: LingvistCard, answer: string, result: ReviewResult) {
  if (!normalize(answer)) return 'empty';
  if (normalize(answer) === normalize(card.expectedAnswer)) return 'exact';
  if (isFullSentence(answer, card)) return 'full_sentence';
  if (isVerbFormConfusion(answer, card.expectedAnswer, card)) return 'verb_form';
  if (result === 'almost') return 'near_typo';
  return 'wrong_word';
}

export function buildLingvistDecision(params: {
  card: LingvistCard;
  answer: string;
  responseTimeMs: number;
  analysis: LingvistAnalysis;
}): LingvistDecision {
  const { card, answer, responseTimeMs, analysis } = params;
  const word = card.srsWord;
  const quality = analysis.result === 'success'
    ? Math.max(0.78, analysis.score)
    : analysis.result === 'almost'
      ? Math.min(0.82, Math.max(0.52, analysis.score))
      : Math.min(0.45, analysis.score);
  const penalty = word && word.fail_count > word.success_count ? 0.05 : 0;
  const finalScore = Math.max(0, Math.min(1, quality * 0.62 + timeScore(responseTimeMs) * 0.28 + historyScore(word) * 0.1 - penalty));
  const result = analysis.result === 'success' && finalScore < 0.58
    ? 'almost'
    : analysis.result === 'almost' && finalScore >= 0.82
      ? 'success'
      : analysis.result;
  const resultKind = result === 'fail' ? 'error' : result;
  const stars = result === 'fail' ? (finalScore >= 0.45 ? 2 : 1) : Math.max(result === 'success' ? 3 : 2, Math.round(finalScore * 5));
  const responseTimeSeconds = Math.round(Math.max(400, responseTimeMs) / 100) / 10;
  const mode = correctionMode(card, answer, result);

  return {
    resultKind,
    grade: result === 'success' ? 'good' : result === 'almost' ? 'hard' : 'again',
    analysis,
    responseTimeSeconds,
    stars,
    known: result === 'success' && finalScore >= 0.74 && responseTimeSeconds <= 16,
    metadata: {
      userAnswer: answer,
      expectedAnswer: card.expectedAnswer,
      aiFeedback: `${analysis.shortFeedback} | temps: ${responseTimeSeconds}s`,
      explanation: analysis.explanation,
      commonMistakes: analysis.commonMistakes,
      correctionMode: mode,
      errorCategory: mode === 'exact' ? 'none' : mode === 'verb_form' ? 'verb_form' : mode === 'near_typo' ? 'spelling' : 'lexical_choice',
      forcedResult: result,
      grammarTopic: card.grammarHint,
      sentenceShown: card.sentenceFull,
      responseTimeMs,
      qualityScore: quality,
      smartScore: finalScore,
      sessionMode: 'lingvist',
      sourceModule: 'lingvist',
    },
  };
}
