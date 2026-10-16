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

/* ---------- Contenus bilingues de l'atelier (metadata.schemaVersion 2) ---------- */

export interface ContentSegment {
  id: string;
  en: string;
  fr: string | null;
  /** Timings propres à l'audio publié (null : pas d'horodatage). */
  startMs: number | null;
  endMs: number | null;
}

export interface ContentChunk {
  id: string;
  expression: string;
  meaningFr: string;
  exampleEn: string | null;
  exampleFr: string | null;
  level: string | null;
  type: string | null;
  context: string | null;
  explanationFr: string | null;
  sourceSegmentId: string | null;
}

export interface ContentGrammarPoint {
  id: string;
  title: string;
  explanationFr: string;
  sourceExcerpt: string | null;
  exampleEn: string | null;
  exampleFr: string | null;
  level: string | null;
  sourceSegmentId: string | null;
}

export const CHUNK_TYPE_LABELS: Record<string, string> = {
  vocabulary: 'Vocabulaire',
  collocation: 'Collocation',
  phrasal_verb: 'Phrasal verb',
  idiom: 'Expression idiomatique',
  useful_expression: 'Expression utile',
  grammar_pattern: 'Structure',
};

type MetadataRecord = Record<string, unknown>;

function metadataList(item: PreparedContent, key: string): MetadataRecord[] {
  const value = item.metadata?.[key];
  return Array.isArray(value)
    ? value.filter((entry): entry is MetadataRecord => Boolean(entry) && typeof entry === 'object')
    : [];
}

function timing(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null;
}

export function getContentSegments(item: PreparedContent): ContentSegment[] {
  return metadataList(item, 'segments').flatMap((entry, index) => {
    const en = clean(entry.en);
    if (!en) return [];
    return [{ id: clean(entry.id) ?? `s${index + 1}`, en, fr: clean(entry.fr), startMs: timing(entry.startMs), endMs: timing(entry.endMs) }];
  });
}

export function getContentChunks(item: PreparedContent): ContentChunk[] {
  return metadataList(item, 'chunks').flatMap((entry, index) => {
    const expression = clean(entry.expression);
    const meaningFr = clean(entry.meaningFr);
    if (!expression || !meaningFr) return [];
    return [{
      id: clean(entry.id) ?? `c${index + 1}`,
      expression,
      meaningFr,
      exampleEn: clean(entry.exampleEn) ?? clean(entry.example),
      exampleFr: clean(entry.exampleFr),
      level: clean(entry.level),
      type: clean(entry.type),
      context: clean(entry.context),
      explanationFr: clean(entry.explanationFr),
      sourceSegmentId: clean(entry.sourceSegmentId),
    }];
  });
}

export function getContentGrammarPoints(item: PreparedContent): ContentGrammarPoint[] {
  return metadataList(item, 'grammarPoints').flatMap((entry, index) => {
    const title = clean(entry.title);
    const explanationFr = clean(entry.explanationFr);
    if (!title || !explanationFr) return [];
    return [{
      id: clean(entry.id) ?? `g${index + 1}`,
      title,
      explanationFr,
      sourceExcerpt: clean(entry.sourceExcerpt),
      exampleEn: clean(entry.exampleEn),
      exampleFr: clean(entry.exampleFr),
      level: clean(entry.level),
      sourceSegmentId: clean(entry.sourceSegmentId),
    }];
  });
}

export function getContentDurationLabel(item: PreparedContent): string | null {
  return metadataText(item, ['durationLabel']);
}

/* ---------- Liste résumée (GET /content?view=summary) ---------- */

/** Vrai si l'élément vient de la liste résumée : segments, chunks et textes
 *  complets doivent être chargés avec GET /content/:id. */
export function isContentSummary(item: PreparedContent): boolean {
  return Boolean(item.summary);
}

/** Nombre de segments, chunks et points de grammaire, que l'élément soit
 *  complet ou résumé. */
export function getContentCounts(item: PreparedContent) {
  if (item.summary) {
    return {
      segments: item.summary.segmentCount,
      chunks: item.summary.chunkCount,
      grammarPoints: item.summary.grammarPointCount,
    };
  }
  return {
    segments: getContentSegments(item).length,
    chunks: getContentChunks(item).length,
    grammarPoints: getContentGrammarPoints(item).length,
  };
}

/* ---------- Source, voix et horodatage (LOT 1) ---------- */

/** Badge de la voix : authentique ou synthèse Kokoro ; null sans audio. */
export function getAudioVoiceLabel(item: PreparedContent): string | null {
  if (!hasContentAudio(item)) return null;
  const origin = item.metadata?.audioOrigin;
  if (origin === 'kokoro_tts') return 'Kokoro — voix de synthèse';
  if (origin === 'original') return 'Voix authentique';
  return null;
}

const SOURCE_KIND_LABELS: Record<string, string> = {
  article: 'Article',
  transcript: 'Transcription',
  personal_output: 'Production personnelle',
  other: 'Texte',
};

/** Nature de la source : vidéo, article, texte, production personnelle. */
export function getSourceKindLabel(item: PreparedContent): string | null {
  const sourceType = clean(item.metadata?.sourceType);
  const contentType = clean(item.metadata?.contentType);
  if (sourceType === 'personal_transcript') return 'Production personnelle';
  if (sourceType === 'article_url' || sourceType === 'pasted_text') return SOURCE_KIND_LABELS[contentType ?? 'other'] ?? 'Texte';
  if (sourceType === 'youtube') return 'Vidéo';
  return null;
}

/** Lien de provenance, seulement s'il est en http(s). */
export function getSourceLink(item: PreparedContent): string | null {
  const url = clean(item.metadata?.sourceUrl);
  return url && /^https?:\/\//i.test(url) ? url : null;
}

/** Contenu lisible sans piste audio (texte importé). */
export function isTextOnlyContent(item: PreparedContent): boolean {
  return !hasContentAudio(item);
}

/** Segment en cours de lecture (timeupdate), ou null hors timings. */
export function findActiveSegmentId(segments: ContentSegment[], currentMs: number): string | null {
  for (const segment of segments) {
    if (segment.startMs === null || segment.endMs === null) continue;
    if (currentMs >= segment.startMs && currentMs < segment.endMs) return segment.id;
  }
  return null;
}
