import { apiRequest, hasRemoteApi } from '@/api/httpClient';
import { analyzeAnswerLocally } from '@/helpers/lingvistAnalysis';
import type { LingvistAnalysis, LingvistCard, ReviewResult } from '@/types/learning';

interface ChatCompletionResponse {
  choices?: { message?: { content?: string } }[];
}

function extractJson(raw: string): Record<string, unknown> | null {
  const fenced = raw.match(/```json\s*([\s\S]*?)```/i) ?? raw.match(/```\s*([\s\S]*?)```/i);
  const candidate = (fenced?.[1] ?? raw).trim();
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(candidate.slice(start, end + 1)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function strings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string').slice(0, 4) : [];
}

function normalizeAnalysis(raw: Record<string, unknown>, fallback: LingvistAnalysis): LingvistAnalysis {
  const rawResult = typeof raw.result === 'string' ? raw.result.toLowerCase() : '';
  const result: ReviewResult = rawResult === 'success' || rawResult === 'correct' || rawResult === 'correcte'
    ? 'success'
    : rawResult === 'almost' || rawResult === 'partial' || rawResult === 'presque'
      ? 'almost'
      : rawResult === 'fail' || rawResult === 'incorrect' || rawResult === 'faux'
        ? 'fail'
        : fallback.result;
  return {
    result,
    score: typeof raw.score === 'number' ? Math.max(0, Math.min(1, raw.score)) : fallback.score,
    shortFeedback: typeof raw.shortFeedback === 'string' ? raw.shortFeedback : fallback.shortFeedback,
    explanation: typeof raw.explanation === 'string' ? raw.explanation : fallback.explanation,
    examples: strings(raw.examples),
    commonMistakes: strings(raw.commonMistakes),
    usageCases: strings(raw.usageCases),
  };
}

export async function analyzeLingvistAnswer(card: LingvistCard, answer: string): Promise<LingvistAnalysis> {
  const local = analyzeAnswerLocally(card, answer);
  if (!hasRemoteApi || local.result !== 'fail') return local;

  const prompt = [
    'Exercice de vocabulaire anglais : compléter uniquement le mot manquant.',
    `Niveau : ${card.level}`,
    `Mot attendu : "${card.expectedAnswer}"`,
    `Sens français : ${card.wordTraductionFr ?? card.translationFr}`,
    `Phrase complète : "${card.sentenceFull}"`,
    `Réponse saisie : "${answer}"`,
    `Indice grammatical : ${card.grammarHint}`,
    'Accepte un synonyme uniquement s’il fonctionne réellement dans cette phrase.',
    'Retourne seulement ce JSON :',
    '{"result":"success|almost|fail","score":0.0,"shortFeedback":"...","explanation":"...","examples":["..."],"commonMistakes":["..."],"usageCases":["..."]}',
  ].join('\n');

  try {
    const response = await apiRequest<ChatCompletionResponse>('/proxy/deepseek/v1/chat/completions', {
      method: 'POST',
      body: JSON.stringify({
        model: 'deepseek-v4-flash',
        temperature: 0.1,
        messages: [
          { role: 'system', content: 'Tu corriges un mot anglais en contexte. Réponds seulement en JSON valide.' },
          { role: 'user', content: prompt },
        ],
      }),
    });
    const content = response.choices?.[0]?.message?.content;
    const parsed = content ? extractJson(content) : null;
    return parsed ? normalizeAnalysis(parsed, local) : local;
  } catch {
    return local;
  }
}
