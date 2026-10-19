import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { rangeEnrichmentMock } from '@/mocks/srsData';
import { FlashcardsPage } from '@/pages/FlashcardsPage';

const { useSession } = vi.hoisted(() => ({ useSession: vi.fn() }));
vi.mock('@/hooks/useFlashcardSession', () => ({ useFlashcardSession: useSession }));
vi.mock('@/components/vocabulary/WordContexts', () => ({ WordContexts: () => null }));

function session(revealed: boolean) {
  return {
    currentWord: { id: 'range_1879', mot: 'range', traduction: 'intervalle', enrichment: rangeEnrichmentMock },
    direction: 'en-to-fr', frontText: 'to range', expected: 'aller de… à…', spokenWord: 'range',
    answer: '', flipped: revealed, result: null, total: 1, done: 0, dueCount: 1, newCount: 0,
    isLoading: false, isError: false, isSaving: false,
  };
}

function render() {
  return renderToStaticMarkup(<MemoryRouter><FlashcardsPage /></MemoryRouter>);
}

beforeEach(() => useSession.mockReset());

describe('révélation du vocabulaire dans les flashcards', () => {
  it('ne rend pas les autres sens et expressions avant la réponse', () => {
    useSession.mockReturnValue(session(false));
    const html = render();
    expect(html).toContain('to range');
    expect(html).not.toContain('Autres sens et expressions');
    expect(html).not.toContain('a wide range of');
    expect(html).not.toContain('Prices range from 10 to 20 euros.');
    expect(html).not.toContain('aller de… à…');
  });

  it('rend les sens, expressions et exemple enrichi après révélation', () => {
    useSession.mockReturnValue(session(true));
    const html = render();
    expect(html).toContain('Autres sens et expressions');
    expect(html).toContain('a wide range of');
    expect(html).toContain('Prices range from 10 to 20 euros.');
  });
});
