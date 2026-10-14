import type { SrsSession, SrsTriageCandidate, SrsWord } from '@/types/learning';

const today = new Date().toISOString().slice(0, 10);

function word(
  id: string,
  mot: string,
  traduction: string,
  niveau: string,
  status: SrsWord['status'],
  example: [string, string],
): SrsWord {
  return {
    id,
    mot,
    traduction,
    niveau,
    type: 'word',
    ipa_uk: null,
    ipa_us: null,
    exemple_en: example[0],
    exemple_fr: example[1],
    examples: [{ en: example[0], fr: example[1] }],
    audio_uk: null,
    audio_us: null,
    prochaine_revision: status === 'new' ? today : '2026-10-01',
    intervalle: status === 'new' ? 0 : 3,
    facilite: 2.5,
    repetitions: status === 'new' ? 0 : 2,
    derniere_revision: status === 'new' ? null : '2026-10-12',
    seen_count: status === 'new' ? 0 : 3,
    success_count: status === 'new' ? 0 : 2,
    almost_count: 0,
    fail_count: status === 'new' ? 0 : 1,
    level: status === 'known' ? 4 : status === 'learning' ? 2 : 0,
    status,
  };
}

export const srsWordsMock: SrsWord[] = [
  word('w-withstand', 'withstand', 'résister à', 'B2', 'learning', ['This bridge can withstand strong winds.', 'Ce pont peut résister à des vents forts.']),
  word('w-reliable', 'reliable', 'fiable', 'B1', 'learning', ['She is a reliable colleague.', 'C’est une collègue fiable.']),
  word('w-outcome', 'outcome', 'résultat', 'B2', 'learning', ['The outcome was better than expected.', 'Le résultat était meilleur que prévu.']),
  word('w-improve', 'improve', 'améliorer', 'A2', 'new', ['Practice will improve your fluency.', 'La pratique améliorera ton aisance.']),
  word('w-awareness', 'awareness', 'prise de conscience', 'B2', 'new', ['The campaign raised public awareness.', 'La campagne a sensibilisé le public.']),
  word('w-nevertheless', 'nevertheless', 'néanmoins', 'B2', 'learning', ['It was difficult; nevertheless, we continued.', 'C’était difficile ; néanmoins, nous avons continué.']),
  word('w-achieve', 'achieve', 'atteindre', 'B1', 'new', ['You can achieve your goal.', 'Tu peux atteindre ton objectif.']),
  word('w-enhance', 'enhance', 'renforcer', 'B2', 'learning', ['This feature enhances the experience.', 'Cette fonction renforce l’expérience.']),
];

export const srsSessionMock: SrsSession = {
  words: srsWordsMock,
  reviewHistory: { '2026-10-09': 12, '2026-10-10': 18, '2026-10-12': 20, '2026-10-13': 14, '2026-10-14': 8 },
  dueCount: srsWordsMock.filter((item) => item.status === 'learning').length,
  newCount: srsWordsMock.filter((item) => item.status === 'new').length,
};

export const triageCandidatesMock: SrsTriageCandidate[] = [
  { id: 't-house', mot: 'house', traduction: 'maison', niveau: 'A1', type: 'nom', frequence: 5 },
  { id: 't-water', mot: 'water', traduction: 'eau', niveau: 'A1', type: 'nom', frequence: 5 },
  { id: 't-happy', mot: 'happy', traduction: 'heureux', niveau: 'A1', type: 'adjectif', frequence: 5 },
  { id: 't-carry', mot: 'carry', traduction: 'porter', niveau: 'A2', type: 'verbe', frequence: 4 },
  { id: 't-quiet', mot: 'quiet', traduction: 'calme', niveau: 'A2', type: 'adjectif', frequence: 4 },
  { id: 't-allow', mot: 'allow', traduction: 'permettre', niveau: 'A2', type: 'verbe', frequence: 5 },
  { id: 't-instead', mot: 'instead', traduction: 'à la place', niveau: 'A2', type: 'adverbe', frequence: 4 },
  { id: 't-forward', mot: 'forward', traduction: 'en avant', niveau: 'A2', type: 'adverbe', frequence: 4 },
];
