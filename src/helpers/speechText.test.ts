import { describe, expect, it } from 'vitest';

import { formatTextForSpeech, splitSpeechText } from '@/helpers/speechText';

describe('speechText', () => {
  it('nettoie le markdown et ajoute une ponctuation finale', () => {
    expect(formatTextForSpeech('**Hello**\nworld')).toBe('Hello. world.');
  });

  it('développe les abréviations difficiles à prononcer', () => {
    expect(formatTextForSpeech('React vs. Vue, e.g. for apps.')).toBe(
      'React versus Vue, for example, for apps.',
    );
  });

  it('découpe les textes longs sans perdre le contenu', () => {
    const chunks = splitSpeechText('First sentence. Second sentence. Third sentence.', 25);
    expect(chunks).toEqual(['First sentence.', 'Second sentence.', 'Third sentence.']);
  });
});
