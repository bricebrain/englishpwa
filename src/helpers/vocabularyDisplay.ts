import type { WordExample } from '@/types/learning';
import type {
  VocabularyCollocationDto,
  VocabularyCollocationKind,
  VocabularyEnrichmentDto,
  VocabularyPartOfSpeech,
  VocabularySenseDto,
} from '@/types/vocabulary';

/**
 * Sélecteurs purs qui concentrent tous les replis entre l'enrichissement publié
 * par l'atelier Vocabulaire et les champs historiques de `words`. Les écrans et
 * hooks ne choisissent jamais eux-mêmes entre `mot`, `traduction` et `enrichment`.
 */

export interface VocabularyWordLike {
  mot: string;
  traduction?: string | null;
  type?: string | null;
  exemple_en?: string | null;
  exemple_fr?: string | null;
  examples?: WordExample[];
  enrichment?: VocabularyEnrichmentDto | null;
}

export type VocabularyDirection = 'en-to-fr' | 'fr-to-en';

const PARTS_OF_SPEECH: VocabularyPartOfSpeech[] = [
  'noun', 'verb', 'adjective', 'adverb', 'preposition', 'phrasal_verb', 'modal_verb', 'expression', 'other',
];

const PART_OF_SPEECH_LABELS: Record<VocabularyPartOfSpeech, string> = {
  noun: 'nom',
  verb: 'verbe',
  adjective: 'adjectif',
  adverb: 'adverbe',
  preposition: 'préposition',
  phrasal_verb: 'phrasal verb',
  modal_verb: 'modal',
  expression: 'expression',
  other: 'autre',
};

const COLLOCATION_KIND_LABELS: Record<VocabularyCollocationKind, string> = {
  collocation: 'Collocation',
  grammar_pattern: 'Structure',
  phrasal_verb: 'Phrasal verb',
  idiom: 'Idiome',
  expression: 'Expression',
};

/** Valeurs vides ou génériques à ne jamais présenter. */
const GENERIC_VALUES = new Set(['', '?', '-', '—', '…', '...', 'n/a', 'na', 'null', 'undefined', 'word', 'other', 'autre']);

/** Texte nettoyé, ou `null` s'il est vide ou générique. */
export function cleanVocabularyText(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.replace(/\s+/g, ' ').trim();
  return GENERIC_VALUES.has(trimmed.toLocaleLowerCase('fr')) ? null : trimmed;
}

function stripInfinitiveTo(value: string) {
  return value.replace(/^to\s+/i, '').trim();
}

function isPartOfSpeech(value: unknown): value is VocabularyPartOfSpeech {
  return typeof value === 'string' && (PARTS_OF_SPEECH as string[]).includes(value);
}

/** Enrichissement exploitable, ou `null` s'il est absent ou mal formé. */
function enrichmentOf(word: VocabularyWordLike | null | undefined): VocabularyEnrichmentDto | null {
  const enrichment = word?.enrichment;
  if (!enrichment || typeof enrichment !== 'object') return null;
  return cleanVocabularyText(enrichment.lemma) ? enrichment : null;
}

function isModal(enrichment: VocabularyEnrichmentDto) {
  return enrichment.partOfSpeech === 'modal_verb';
}

function unique(values: (string | null)[]) {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    if (!value) continue;
    const key = value.toLocaleLowerCase('fr');
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(value);
  }
  return result;
}

/** Lemme anglais (jamais précédé de `to`) : réponse attendue, recherche, synthèse vocale. */
export function getVocabularyLemma(word: VocabularyWordLike): string {
  const enrichment = enrichmentOf(word);
  const lemma = enrichment ? cleanVocabularyText(enrichment.lemma) : null;
  return lemma ? stripInfinitiveTo(lemma) : word.mot;
}

/** Forme affichée dans une fiche (`to range`) ; un modal n'a jamais de `to`. */
export function getVocabularyDisplayForm(word: VocabularyWordLike): string {
  const enrichment = enrichmentOf(word);
  if (!enrichment) return word.mot;
  const displayForm = cleanVocabularyText(enrichment.displayForm);
  if (!displayForm) return getVocabularyLemma(word);
  return isModal(enrichment) ? stripInfinitiveTo(displayForm) : displayForm;
}

/** Traduction française principale, corrigée si l'atelier l'a publiée. */
export function getVocabularyTranslation(word: VocabularyWordLike | null | undefined): string | null {
  if (!word) return null;
  const enrichment = enrichmentOf(word);
  return (enrichment ? cleanVocabularyText(enrichment.primaryTranslation) : null) ?? cleanVocabularyText(word.traduction);
}

/** Catégorie grammaticale normalisée (clé) si connue. */
export function getVocabularyPartOfSpeech(word: VocabularyWordLike): VocabularyPartOfSpeech | null {
  const enrichment = enrichmentOf(word);
  return enrichment && isPartOfSpeech(enrichment.partOfSpeech) ? enrichment.partOfSpeech : null;
}

/** Libellé français de la catégorie, avec repli sur le `type` historique. */
export function getVocabularyPartOfSpeechLabel(word: VocabularyWordLike): string | null {
  const partOfSpeech = getVocabularyPartOfSpeech(word);
  if (partOfSpeech) return partOfSpeech === 'other' ? null : PART_OF_SPEECH_LABELS[partOfSpeech];
  const published = enrichmentOf(word)?.partOfSpeech;
  if (typeof published === 'string' && cleanVocabularyText(published)) return partOfSpeechLabel(published);
  return cleanVocabularyText(word.type);
}

/** Libellé d'une catégorie ; une catégorie inconnue publiée par l'atelier reste lisible. */
export function partOfSpeechLabel(partOfSpeech: string): string {
  if (isPartOfSpeech(partOfSpeech)) return PART_OF_SPEECH_LABELS[partOfSpeech];
  return cleanVocabularyText(partOfSpeech?.replace(/_/g, ' ')) ?? PART_OF_SPEECH_LABELS.other;
}

export function collocationKindLabel(kind: VocabularyCollocationKind): string {
  return COLLOCATION_KIND_LABELS[kind] ?? COLLOCATION_KIND_LABELS.collocation;
}

/** Sens bien formés uniquement (traduction présente). */
export function getVocabularySenses(word: VocabularyWordLike): VocabularySenseDto[] {
  const senses = enrichmentOf(word)?.senses;
  if (!Array.isArray(senses)) return [];
  return senses.filter((sense): sense is VocabularySenseDto =>
    Boolean(sense) && typeof sense === 'object' && Boolean(cleanVocabularyText(sense.translation)));
}

/** Collocations bien formées, éventuellement filtrées par sens et limitées. */
export function getVocabularyCollocations(
  word: VocabularyWordLike,
  options: { senseKey?: string; limit?: number } = {},
): VocabularyCollocationDto[] {
  const collocations = enrichmentOf(word)?.collocations;
  if (!Array.isArray(collocations)) return [];
  const valid = collocations.filter((item): item is VocabularyCollocationDto =>
    Boolean(item) && typeof item === 'object' && Boolean(cleanVocabularyText(item.en)));
  const matching = options.senseKey ? valid.filter((item) => item.senseKey === options.senseKey) : [];
  const ordered = matching.length ? [...matching, ...valid.filter((item) => item.senseKey !== options.senseKey)] : valid;
  return options.limit === undefined ? ordered : ordered.slice(0, options.limit);
}

/**
 * Exemples anglais/français : ceux des sens enrichis d'abord, puis les exemples
 * historiques en complément (sans doublon).
 */
export function getVocabularyExamples(word: VocabularyWordLike | null | undefined): WordExample[] {
  if (!word) return [];
  const candidates: { en: string | null; fr: string | null }[] = [
    ...getVocabularySenses(word).map((sense) => ({ en: cleanVocabularyText(sense.exampleEn), fr: cleanVocabularyText(sense.exampleFr) })),
    ...(Array.isArray(word.examples) ? word.examples : []).map((example) => ({ en: cleanVocabularyText(example?.en), fr: cleanVocabularyText(example?.fr) })),
    { en: cleanVocabularyText(word.exemple_en), fr: cleanVocabularyText(word.exemple_fr) },
  ];
  const seen = new Set<string>();
  const examples: WordExample[] = [];
  for (const candidate of candidates) {
    if (!candidate.en) continue;
    const key = candidate.en.toLocaleLowerCase('en');
    if (seen.has(key)) continue;
    seen.add(key);
    examples.push({ en: candidate.en, fr: candidate.fr ?? '' });
  }
  return examples;
}

/** Découpe une traduction historique du type « supporter, résister à ». */
function splitTranslation(value: string | null) {
  if (!value) return [];
  return value.split(/[,;/]|\bou\b/i).map(cleanVocabularyText);
}

/**
 * Réponses acceptables pour un rappel.
 * - `en-to-fr` (réponse en français) : traduction principale, puis traductions des sens ;
 * - `fr-to-en` (réponse en anglais) : le lemme, et la forme `to + verbe` d'un verbe lexical.
 */
export function getVocabularyAcceptedAnswers(word: VocabularyWordLike, direction: VocabularyDirection): string[] {
  const enrichment = enrichmentOf(word);

  if (direction === 'en-to-fr') {
    if (!enrichment) return unique(splitTranslation(cleanVocabularyText(word.traduction)));
    return unique([
      cleanVocabularyText(enrichment.primaryTranslation),
      ...getVocabularySenses(word).map((sense) => cleanVocabularyText(sense.translation)),
    ]);
  }

  const lemma = getVocabularyLemma(word);
  if (!enrichment) return unique([cleanVocabularyText(lemma)]);
  const displayForm = getVocabularyDisplayForm(word);
  const acceptsInfinitive = !isModal(enrichment) && /^to\s+/i.test(displayForm) && stripInfinitiveTo(displayForm).toLocaleLowerCase('en') === lemma.toLocaleLowerCase('en');
  return unique([lemma, acceptsInfinitive ? displayForm : null]);
}
