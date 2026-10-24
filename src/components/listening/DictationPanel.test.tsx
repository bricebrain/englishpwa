import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DictationPanel } from '@/components/listening/DictationPanel';

const { useSession } = vi.hoisted(() => ({ useSession: vi.fn() }));
vi.mock('@/hooks/useDictationSession', () => ({ useDictationSession: useSession }));
vi.mock('@/hooks/usePreferences', () => ({ usePreferences: () => ({ preferences: { profile: { id: 'test' } } }) }));
vi.mock('@/context/ThemeContext', () => ({ useTheme: () => ({ resolved: 'light' }) }));

beforeEach(() => useSession.mockReturnValue({
  phrase: { text: 'The meeting has been postponed.', translation: 'La réunion a été reportée.', source: 'Leçon' },
  answer: '', result: null, index: 0, total: 5, score: 0, unseenCount: 12, completed: false,
}));

describe('interface de dictée', () => {
  it('cache la phrase et sa traduction avant la correction', () => {
    const html = renderToStaticMarkup(<DictationPanel level="B1" />);
    expect(html).toContain('Écouter la phrase');
    expect(html).not.toContain('The meeting has been postponed.');
    expect(html).not.toContain('La réunion a été reportée.');
  });

  it('révèle la phrase et sa traduction après validation', () => {
    useSession.mockReturnValue({
      ...useSession(), result: false, answer: 'wrong answer', unseenCount: 11,
    });
    const html = renderToStaticMarkup(<DictationPanel level="B1" />);
    expect(html).toContain('Phrase attendue');
    expect(html).toContain('The meeting has been postponed.');
    expect(html).toContain('La réunion a été reportée.');
  });

  it('annonce les révisions lorsque la banque est épuisée', () => {
    useSession.mockReturnValue({ ...useSession(), completed: true, unseenCount: 0, score: 3 });
    const html = renderToStaticMarkup(<DictationPanel level="B1" />);
    expect(html).toContain('Série terminée : 3/5');
    expect(html).toContain('Les prochaines séries seront des révisions.');
    expect(html).toContain('Nouvelle série');
  });
});
