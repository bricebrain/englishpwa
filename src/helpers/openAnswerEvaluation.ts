import { normalizeLabAnswer } from '@/helpers/pedagogyEvaluation';
import type { Evaluation } from '@/types/pedagogy';

/** Une liste de modèles n’est pas un correcteur exhaustif de réponses libres. */
export function evaluateOpenAnswer(answer: string, accepted: string[]): Evaluation {
  if (accepted.some((item) => normalizeLabAnswer(item) === normalizeLabAnswer(answer))) {
    return { outcome: 'correct', explanation: 'Ta réponse correspond à une formulation de référence.' };
  }
  return { outcome: 'uncertain', explanation: 'Cette formulation est à vérifier : elle peut être correcte. Elle n’est pas comptée comme une erreur.' };
}
