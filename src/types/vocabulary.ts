/**
 * Enrichissement publié par l'atelier Vocabulaire et joint par le Worker aux mots
 * renvoyés par les routes d'apprentissage. Facultatif : un mot non encore traité
 * n'en a pas, et la PWA retombe alors sur les champs historiques de `words`.
 */

export type VocabularyPartOfSpeech = string;

export type VocabularyCollocationKind =
  | 'collocation'
  | 'grammar_pattern'
  | 'phrasal_verb'
  | 'idiom'
  | 'expression';

export interface VocabularySenseDto {
  senseKey: string;
  partOfSpeech: VocabularyPartOfSpeech;
  translation: string;
  exampleEn: string;
  exampleFr: string;
}

export interface VocabularyCollocationDto {
  en: string;
  fr: string;
  kind: VocabularyCollocationKind;
  senseKey: string;
}

export interface VocabularyEnrichmentDto {
  schemaVersion: 1;
  version: number;
  publishedAt: string;
  lemma: string;
  displayForm: string;
  partOfSpeech: VocabularyPartOfSpeech;
  primaryTranslation: string;
  translationStatus:
    | 'correct'
    | 'incomplete'
    | 'incorrect_as_standalone'
    | 'incorrect'
    | 'ambiguous';
  senses: VocabularySenseDto[];
  collocations: VocabularyCollocationDto[];
}
