import type { PreparedContent } from '@/types/learning';

const LANGUAGE_KEYS = ['language', 'contentLanguage', 'textLanguage', 'scriptLanguage', 'targetLanguage', 'adaptedLanguage'];
const AUDIO_LANGUAGE_KEYS = ['audioLanguage', 'sourceAudioLanguage', 'originalAudioLanguage', 'originalLanguage', 'sourceLanguage'];
const ENGLISH_SCRIPT_KEYS = [
  'scriptEn', 'englishScript', 'transcriptEn', 'textEn', 'contentEn',
  'adaptedText', 'adaptedScript', 'simplifiedEnglish', 'levelScriptEn',
];
const FRENCH_KEYS = [
  'translationFr', 'frenchTranslation', 'scriptFr', 'transcriptFr',
  'textFr', 'contentFr', 'summaryFr', 'resumeFr', 'originalText', 'originalTranscript',
];

interface StructuredBody {
  titleEn?: unknown;
  titleFr?: unknown;
  taglineFr?: unknown;
  steps?: {
    titleFr?: unknown;
    bodyFr?: unknown;
    formulaExample?: unknown;
    examples?: { en?: unknown; fr?: unknown }[];
    exercise?: { sentence?: unknown; question?: unknown; explanationFr?: unknown };
  }[];
  vocabulary?: { en?: unknown; fr?: unknown; example?: unknown }[];
}

function clean(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function metadataText(item: PreparedContent, keys: string[]): string | null {
  for (const key of keys) {
    const value = clean(item.metadata?.[key]);
    if (value) return value;
  }
  return null;
}

function languageMatches(value: string | null, codes: string[]): boolean {
  const language = value?.toLowerCase();
  return Boolean(language && codes.some((code) => language === code || language.startsWith(`${code}-`) || language.includes(code)));
}

function parseStructured(item: PreparedContent): StructuredBody | null {
  if (!item.body.trim().startsWith('{')) return null;
  try {
    const value = JSON.parse(item.body) as StructuredBody;
    return value && typeof value === 'object' ? value : null;
  } catch {
    return null;
  }
}

function unique(lines: string[]): string {
  const seen = new Set<string>();
  return lines.filter((line) => {
    const key = line.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).join('\n');
}

function structuredEnglish(item: PreparedContent): string | null {
  const body = parseStructured(item);
  if (!body) return null;
  const lines: string[] = [];
  const title = clean(body.titleEn);
  if (title) lines.push(title);
  for (const step of body.steps ?? []) {
    const formula = clean(step.formulaExample);
    if (formula) lines.push(formula);
    for (const example of step.examples ?? []) {
      const english = clean(example.en);
      if (english) lines.push(english);
    }
    const sentence = clean(step.exercise?.sentence);
    if (sentence) lines.push(sentence);
  }
  for (const entry of body.vocabulary ?? []) {
    const word = clean(entry.en);
    const example = clean(entry.example);
    if (word && example) lines.push(`${word}: ${example}`);
    else if (word || example) lines.push((word ?? example)!);
  }
  return unique(lines) || null;
}

function structuredFrench(item: PreparedContent): string | null {
  const body = parseStructured(item);
  if (!body) return null;
  const lines: string[] = [];
  for (const value of [body.titleFr, body.taglineFr]) {
    const text = clean(value);
    if (text) lines.push(text);
  }
  for (const step of body.steps ?? []) {
    for (const value of [step.titleFr, step.bodyFr, step.exercise?.question, step.exercise?.explanationFr]) {
      const text = clean(value);
      if (text) lines.push(text);
    }
    for (const example of step.examples ?? []) {
      const english = clean(example.en);
      const french = clean(example.fr);
      if (english && french) lines.push(`${english} = ${french}`);
      else if (french) lines.push(french);
    }
  }
  for (const entry of body.vocabulary ?? []) {
    const english = clean(entry.en);
    const french = clean(entry.fr);
    if (english && french) lines.push(`${english} = ${french}`);
  }
  return unique(lines) || null;
}

export function getContentLanguage(item: PreparedContent): string | null {
  return metadataText(item, LANGUAGE_KEYS) ?? item.language ?? null;
}

export function getContentAudioLanguage(item: PreparedContent): string | null {
  return metadataText(item, AUDIO_LANGUAGE_KEYS);
}

export function isEnglishContent(item: PreparedContent): boolean {
  return languageMatches(getContentLanguage(item), ['en', 'english', 'anglais']);
}

export function hasContentAudio(item: PreparedContent): boolean {
  return Boolean(item.audioUrl || item.audioR2Key?.trim());
}

function isFrenchSource(item: PreparedContent): boolean {
  const transcriptLanguage = metadataText(item, ['transcriptLanguage', 'transcriptionLanguage']);
  return languageMatches(getContentAudioLanguage(item), ['fr', 'french', 'français', 'francais'])
    || languageMatches(transcriptLanguage, ['fr', 'french', 'français', 'francais']);
}

export function getEnglishScript(item: PreparedContent): string {
  const metadataScript = metadataText(item, ENGLISH_SCRIPT_KEYS);
  if (metadataScript) return metadataScript;
  const structured = structuredEnglish(item);
  if (structured) return structured;
  const body = item.body.trim();
  if (!body || body.startsWith('{')) return '';
  if (isFrenchSource(item) || isEnglishContent(item) || !getContentLanguage(item)) return body;
  return '';
}

export function getFrenchTranslation(item: PreparedContent): string | null {
  const metadataTranslation = metadataText(item, FRENCH_KEYS);
  if (metadataTranslation) return metadataTranslation;
  const transcript = metadataText(item, ['transcriptText']);
  if (transcript && isFrenchSource(item)) return transcript;
  const structured = structuredFrench(item);
  if (structured) return structured;
  if (languageMatches(getContentLanguage(item), ['fr', 'french', 'français', 'francais'])) return item.body.trim() || null;
  return null;
}

export function getContentSummary(item: PreparedContent, maxLength = 220): string {
  const summary = metadataText(item, ['summaryFr', 'summary', 'resume', 'description'])
    ?? getFrenchTranslation(item)
    ?? getEnglishScript(item)
    ?? item.body;
  const compact = summary.replace(/\s+/g, ' ').trim();
  return compact.length > maxLength ? `${compact.slice(0, maxLength).trim()}…` : compact;
}
