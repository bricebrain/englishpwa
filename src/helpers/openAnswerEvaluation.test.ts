import { describe, expect, it } from 'vitest';
import { evaluateOpenAnswer } from '@/helpers/openAnswerEvaluation';

describe('réponses ouvertes', () => {
  it('accepte les contractions non ambiguës sans imposer la ponctuation du modèle', () => {
    expect(evaluateOpenAnswer("I’ve visited London!", ['I have visited London']).outcome).toBe('correct');
    expect(evaluateOpenAnswer("If it rains, I’ll stay home.", ['If it rains I will stay home']).outcome).toBe('correct');
  });
  it('ne certifie ni ne pénalise une réponse hors des variantes connues', () => {
    expect(evaluateOpenAnswer('I have been to London', ['I have visited London']).outcome).toBe('uncertain');
    expect(evaluateOpenAnswer('banana', ['I have visited London']).outcome).toBe('uncertain');
  });
  it('ne confond pas has et is dans une contraction ambiguë', () => {
    expect(evaluateOpenAnswer("She’s visited Paris", ['She has visited Paris']).outcome).toBe('uncertain');
  });
});
