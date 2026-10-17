import { describe, expect, it } from 'vitest';

import { evaluateRecall } from '@/helpers/flashcardEvaluation';
import {
  getVocabularyAcceptedAnswers,
  getVocabularyCollocations,
  getVocabularyDisplayForm,
  getVocabularyExamples,
  getVocabularyLemma,
  getVocabularyPartOfSpeech,
  getVocabularyPartOfSpeechLabel,
  getVocabularySenses,
  getVocabularyTranslation,
  type VocabularyWordLike,
} from '@/helpers/vocabularyDisplay';
import { rangeEnrichmentMock } from '@/mocks/srsData';
import type { VocabularyEnrichmentDto } from '@/types/vocabulary';

const historique: VocabularyWordLike = {
  mot: 'withstand',
  traduction: 'supporter, résister à',
  type: 'verbe',
  exemple_en: 'This bridge can withstand strong winds.',
  exemple_fr: 'Ce pont peut résister à des vents forts.',
  examples: [{ en: 'Few walls withstand such storms.', fr: 'Peu de murs résistent à de telles tempêtes.' }],
};

const range: VocabularyWordLike = { mot: 'range', traduction: 'intervalle', type: 'word', enrichment: rangeEnrichmentMock };

const modal = (displayForm: string): VocabularyWordLike => ({
  mot: 'can',
  traduction: 'boîte de conserve',
  type: 'word',
  enrichment: {
    ...rangeEnrichmentMock,
    lemma: 'can',
    displayForm,
    partOfSpeech: 'modal_verb',
    primaryTranslation: 'pouvoir',
    senses: [{ senseKey: 'ability', partOfSpeech: 'modal_verb', translation: 'pouvoir', exampleEn: 'I can swim.', exampleFr: 'Je sais nager.' }],
    collocations: [],
  },
});

describe('mot sans enrichissement : comportement historique inchangé', () => {
  it('reprend mot, traduction, type et exemples', () => {
    expect(getVocabularyLemma(historique)).toBe('withstand');
    expect(getVocabularyDisplayForm(historique)).toBe('withstand');
    expect(getVocabularyTranslation(historique)).toBe('supporter, résister à');
    expect(getVocabularyPartOfSpeech(historique)).toBeNull();
    expect(getVocabularyPartOfSpeechLabel(historique)).toBe('verbe');
    expect(getVocabularyExamples(historique)[0]?.en).toBe('Few walls withstand such storms.');
    expect(getVocabularyExamples(historique).map((example) => example.en)).toContain('This bridge can withstand strong winds.');
    expect(getVocabularySenses(historique)).toEqual([]);
    expect(getVocabularyCollocations(historique)).toEqual([]);
  });

  it('accepte encore les synonymes séparés par des virgules', () => {
    expect(getVocabularyAcceptedAnswers(historique, 'en-to-fr')).toEqual(['supporter', 'résister à']);
    expect(getVocabularyAcceptedAnswers(historique, 'fr-to-en')).toEqual(['withstand']);
    expect(evaluateRecall('résister à', getVocabularyAcceptedAnswers(historique, 'en-to-fr'))).toBe('success');
  });

  it('masque un type générique', () => {
    expect(getVocabularyPartOfSpeechLabel({ mot: 'house', type: 'word' })).toBeNull();
  });
});

describe('règle du « to »', () => {
  it('affiche « to range » mais attend « range »', () => {
    expect(getVocabularyDisplayForm(range)).toBe('to range');
    expect(getVocabularyLemma(range)).toBe('range');
  });

  it('accepte « range » et « to range » en FR→EN', () => {
    const accepted = getVocabularyAcceptedAnswers(range, 'fr-to-en');
    expect(accepted).toEqual(['range', 'to range']);
    expect(evaluateRecall('range', accepted)).toBe('success');
    expect(evaluateRecall('to range', accepted)).toBe('success');
  });

  it('un modal ne devient jamais « to can », même si la donnée le contient', () => {
    expect(getVocabularyDisplayForm(modal('can'))).toBe('can');
    expect(getVocabularyDisplayForm(modal('to can'))).toBe('can');
    expect(getVocabularyAcceptedAnswers(modal('to can'), 'fr-to-en')).toEqual(['can']);
    expect(evaluateRecall('to can', getVocabularyAcceptedAnswers(modal('can'), 'fr-to-en'))).toBe('fail');
  });

  it('un lemme publié avec « to » est nettoyé', () => {
    expect(getVocabularyLemma({ mot: 'range', enrichment: { ...rangeEnrichmentMock, lemma: 'to range' } })).toBe('range');
  });
});

describe('traductions enrichies', () => {
  it('remplace la traduction historique', () => {
    expect(getVocabularyTranslation(range)).toBe('aller de… à…');
    expect(getVocabularyPartOfSpeechLabel(range)).toBe('verbe');
  });

  it('accepte plusieurs traductions valides sans découper la principale', () => {
    const accepted = getVocabularyAcceptedAnswers(range, 'en-to-fr');
    expect(accepted).toEqual(['aller de… à…', 's’étendre', 'gamme']);
    expect(accepted).not.toContain('intervalle');
    expect(evaluateRecall('aller de à', accepted)).toBe('success');
    expect(evaluateRecall('gamme', accepted)).toBe('success');
  });

  it('retombe sur la traduction historique si la principale est vide', () => {
    const vide: VocabularyWordLike = { ...range, enrichment: { ...rangeEnrichmentMock, primaryTranslation: '  ' } };
    expect(getVocabularyTranslation(vide)).toBe('intervalle');
  });

  it('place l’exemple du premier sens en tête', () => {
    expect(getVocabularyExamples(range)[0]).toEqual({ en: 'Prices range from 10 to 20 euros.', fr: 'Les prix vont de 10 à 20 euros.' });
  });

  it('met en avant les collocations du sens demandé', () => {
    expect(getVocabularyCollocations(range, { senseKey: 'scope', limit: 2 }).map((item) => item.en)).toEqual(['a wide range of', 'price range']);
    expect(getVocabularyCollocations(range, { limit: 1 })).toHaveLength(1);
  });
});

describe('données mal formées', () => {
  it('ignore les sens et collocations invalides sans planter', () => {
    const casse = {
      ...rangeEnrichmentMock,
      senses: [null, { senseKey: 'x' }, { senseKey: 'ok', partOfSpeech: 'verb', translation: 'aller', exampleEn: '', exampleFr: '' }],
      collocations: [{ en: '' }, 'texte', null],
    } as unknown as VocabularyEnrichmentDto;
    const word: VocabularyWordLike = { mot: 'range', traduction: 'intervalle', enrichment: casse };
    expect(getVocabularySenses(word).map((sense) => sense.senseKey)).toEqual(['ok']);
    expect(getVocabularyCollocations(word)).toEqual([]);
    expect(getVocabularyExamples(word)).toEqual([]);
  });

  it('ignore un enrichissement sans lemme ou non objet', () => {
    const sansLemme = { mot: 'range', traduction: 'intervalle', enrichment: { ...rangeEnrichmentMock, lemma: '' } };
    expect(getVocabularyDisplayForm(sansLemme)).toBe('range');
    expect(getVocabularyTranslation(sansLemme)).toBe('intervalle');
    expect(getVocabularyTranslation({ mot: 'x', traduction: '?', enrichment: 'oops' as unknown as VocabularyEnrichmentDto })).toBeNull();
  });
});
