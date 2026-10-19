import ShuffleRounded from '@mui/icons-material/ShuffleRounded';
import TouchAppRounded from '@mui/icons-material/TouchAppRounded';
import VolumeUpRounded from '@mui/icons-material/VolumeUpRounded';
import { Box, Button, Chip, IconButton, InputBase, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { AnimatePresence } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

import { QueryState } from '@/components/common/QueryState';
import { PageLayout } from '@/components/layout/PageLayout';
import { MotionBox } from '@/components/ui/motion';
import { CelebrationCard, SessionHeader } from '@/components/ui/SessionChrome';
import { WordContexts } from '@/components/vocabulary/WordContexts';
import { WordEnrichmentDetails } from '@/components/vocabulary/WordEnrichmentDetails';
import { getVocabularyExamples, getVocabularyPartOfSpeechLabel } from '@/helpers/vocabularyDisplay';
import { useCombo } from '@/hooks/useCombo';
import { useFlashcardSession } from '@/hooks/useFlashcardSession';
import { feedback } from '@/services/feedbackService';
import { speakEnglish } from '@/services/speechPlaybackService';
import { displayFont, gradients, tokens } from '@/theme';
import type { ReviewMode } from '@/types/learning';

const RESULT_COLORS = { success: tokens.mint, almost: tokens.amber, fail: tokens.red } as const;
const RESULT_LABELS = { success: 'Bonne réponse !', almost: 'Presque !', fail: 'À retravailler' } as const;

export function FlashcardsPage() {
  const [params, setParams] = useSearchParams();
  const rawMode = params.get('mode');
  const mode: ReviewMode = rawMode === 'due' || rawMode === 'new' ? rawMode : 'mixed';
  const session = useFlashcardSession(mode);
  const combo = useCombo(8);
  const handled = useRef<string | null>(null);
  const successCount = useRef(0);
  const progress = session.total ? Math.min(1, session.done / session.total) : 0;
  const word = session.currentWord;
  const showBack = session.flipped || Boolean(session.result);
  const glow = session.result ? RESULT_COLORS[session.result] : null;
  const example = word ? getVocabularyExamples(word)[0] : undefined;
  const partOfSpeech = word ? getVocabularyPartOfSpeechLabel(word) : null;

  useEffect(() => {
    if (!session.result || !word) return;
    const key = `${word.id}-${session.done}`;
    if (handled.current === key) return;
    handled.current = key;
    if (session.result === 'success') { successCount.current += 1; combo.hit(session.spokenWord); }
    else if (session.result === 'almost') combo.almost();
    else combo.miss();
  }, [combo, session.done, session.result, session.spokenWord, word]);

  const finished = !session.isLoading && !word && session.done > 0;

  return (
    <PageLayout reading>
      <SessionHeader
        progress={progress}
        combo={combo.combo}
        label={session.total ? `${Math.min(session.done + 1, session.total)}/${session.total}` : undefined}
        action={<IconButton aria-label="Mélanger" onClick={() => { feedback('swipe'); session.shuffle(); }} sx={{ color: 'text.secondary' }}><ShuffleRounded /></IconButton>}
      />

      {!finished ? (
        <Stack direction="row" gap={1} justifyContent="space-between" flexWrap="wrap" useFlexGap mb={2.5}>
          <ToggleButtonGroup exclusive value={mode} onChange={(_, value: ReviewMode | null) => { if (value) { feedback('select'); setParams({ mode: value }); } }} size="small">
            <ToggleButton value="due">À réviser · {session.dueCount}</ToggleButton>
            <ToggleButton value="new">Nouveaux · {session.newCount}</ToggleButton>
            <ToggleButton value="mixed">Mixte</ToggleButton>
          </ToggleButtonGroup>
          <ToggleButtonGroup exclusive value={session.direction} onChange={(_, value) => { if (value) { feedback('select'); session.setDirection(value); } }} size="small">
            <ToggleButton value="en-to-fr">EN→FR</ToggleButton>
            <ToggleButton value="fr-to-en">FR→EN</ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      ) : null}

      <QueryState loading={session.isLoading} error={session.isError} onRetry={() => session.refetch()} skeletons={1} />

      {finished ? (
        <CelebrationCard
          title="Pile terminée !"
          subtitle="Les cartes fragiles reviendront au bon moment."
          score={session.done ? successCount.current / session.done : 0}
          stats={[
            { label: 'Réussies', value: successCount.current, color: tokens.mint },
            { label: 'Cartes vues', value: session.done },
          ]}
        />
      ) : !session.isLoading && !word ? (
        <Box textAlign="center" py={6}>
          <Typography fontSize={64}>🎉</Typography>
          <Typography variant="h2" mt={1}>Tout est à jour</Typography>
          <Typography color="text.secondary" mt={0.5}>Aucune carte dans cette file. Essaie un autre mode.</Typography>
        </Box>
      ) : word ? (
        <Stack gap={2}>
          <Box sx={{ perspective: 1400 }}>
            <AnimatePresence mode="popLayout" initial={false}>
              <MotionBox
                key={`${word.id}-${session.done}`}
                initial={{ x: 300, opacity: 0, rotate: 8 }}
                animate={{ x: 0, opacity: 1, rotate: 0 }}
                exit={{ x: -320, opacity: 0, rotate: -10 }}
                transition={{ type: 'spring', stiffness: 260, damping: 26 }}
              >
                <MotionBox
                  role="button"
                  tabIndex={0}
                  aria-label={showBack ? 'Carte retournée' : 'Retourner la carte'}
                  onClick={() => {
                    if (session.result) return;
                    feedback('swipe');
                    session.setFlipped(!session.flipped);
                  }}
                  animate={{ rotateY: showBack ? 180 : 0 }}
                  transition={{ type: 'spring', stiffness: 180, damping: 22 }}
                  sx={{ position: 'relative', borderRadius: 7, outlineOffset: 4, height: { xs: 300, sm: 340 }, transformStyle: 'preserve-3d', cursor: session.result ? 'default' : 'pointer' }}
                >
                  <CardFace>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" gap={0.75}>
                        <Chip label={word.niveau} size="small" sx={{ background: gradients.primary, color: '#fff' }} />
                        {partOfSpeech ? <Chip label={partOfSpeech} size="small" /> : null}
                      </Stack>
                      <Typography color="text.disabled" fontSize={12} fontWeight={700}>{session.direction === 'en-to-fr' ? 'Anglais' : 'Français'}</Typography>
                    </Stack>
                    <Box flex={1} display="grid" sx={{ placeItems: 'center' }}>
                      <Box textAlign="center">
                        <Typography fontFamily={displayFont} fontSize={{ xs: 40, sm: 50 }} fontWeight={800} letterSpacing="-0.03em" lineHeight={1.1}>
                          {session.frontText}
                        </Typography>
                        {word.ipa_uk && session.direction === 'en-to-fr' ? <Typography color="text.secondary" mt={1}>/{word.ipa_uk}/</Typography> : null}
                        {session.direction === 'en-to-fr' ? (
                          <IconButton
                            aria-label="Écouter le mot"
                            onClick={(event) => { event.stopPropagation(); speakEnglish(session.spokenWord); }}
                            sx={{ mt: 1.5, background: 'rgba(139,108,255,0.15)', color: tokens.violetSoft, width: 52, height: 52 }}
                          >
                            <VolumeUpRounded />
                          </IconButton>
                        ) : null}
                      </Box>
                    </Box>
                    <Stack direction="row" alignItems="center" justifyContent="center" gap={0.75} color="text.disabled">
                      <TouchAppRounded sx={{ fontSize: 18 }} />
                      <Typography fontSize={12.5} fontWeight={600}>Touche pour retourner</Typography>
                    </Stack>
                  </CardFace>

                  <CardFace back glow={glow} revealed={showBack}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="overline" color={glow ?? tokens.violetSoft}>
                        {session.result ? RESULT_LABELS[session.result] : 'Réponse'}
                      </Typography>
                      <Typography color="text.disabled" fontSize={12} fontWeight={700}>{session.frontText}</Typography>
                    </Stack>
                    <Box flex={1} display="grid" sx={{ placeItems: 'center' }}>
                      <Box textAlign="center" px={1}>
                        <Typography fontFamily={displayFont} fontSize={{ xs: 34, sm: 42 }} fontWeight={800} letterSpacing="-0.02em" lineHeight={1.15} color={glow ?? 'text.primary'}>
                          {session.expected}
                        </Typography>
                        {session.answer && session.result && session.result !== 'success' ? (
                          <Typography color="text.secondary" mt={1} sx={{ textDecoration: 'line-through' }}>{session.answer}</Typography>
                        ) : null}
                        {example ? (
                          <Box mt={2}>
                            <Typography fontSize={15} fontStyle="italic">{example.en}</Typography>
                            {example.fr ? <Typography fontSize={13} color="text.secondary">{example.fr}</Typography> : null}
                          </Box>
                        ) : null}
                      </Box>
                    </Box>
                    <Typography textAlign="center" fontSize={12.5} color="text.disabled" fontWeight={600}>
                      {session.result ? (session.result === 'success' ? 'Elle reviendra plus tard' : 'Elle reviendra bientôt dans la pile') : 'Réponse révélée · le mot reviendra'}
                    </Typography>
                  </CardFace>
                </MotionBox>
              </MotionBox>
            </AnimatePresence>
          </Box>

          {/* Les autres sens ne sont montrés qu'après la réponse, pour ne pas la souffler. */}
          <AnimatePresence initial={false}>
            {showBack ? (
              <MotionBox key={`details-${word.id}-${session.done}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <Stack gap={1.5}>
                  <WordEnrichmentDetails word={word} skipFirstSense />
                  <WordContexts word={session.spokenWord} />
                </Stack>
              </MotionBox>
            ) : null}
          </AnimatePresence>

          {!session.result && !session.flipped ? (
            <InputBase
              fullWidth
              value={session.answer}
              onChange={(event) => session.setAnswer(event.target.value)}
              placeholder={session.direction === 'en-to-fr' ? 'Traduction française…' : 'Mot anglais…'}
              onKeyDown={(event) => { if (event.key === 'Enter' && session.answer.trim()) session.validate(); }}
              inputProps={{ autoCapitalize: 'none', autoComplete: 'off', autoCorrect: 'off', spellCheck: false, 'aria-label': 'Ta réponse' }}
              sx={{
                px: 2.25, py: 1.25, borderRadius: 4, fontSize: 19, fontWeight: 700, '& input': { textAlign: 'center' },
                background: 'rgba(49,39,78,0.05)', border: `2px solid ${tokens.border}`,
                '&.Mui-focused': { borderColor: tokens.violet, boxShadow: '0 0 0 5px rgba(139,108,255,0.18)' },
              }}
            />
          ) : null}

          <Button
            size="large"
            variant="contained"
            color={session.result === 'success' ? 'success' : 'primary'}
            fullWidth
            disabled={session.isSaving || (!session.flipped && !session.result && !session.answer.trim())}
            onClick={() => {
              if (session.result) { feedback('swipe'); session.next(); } else session.validate();
            }}
            sx={{ minHeight: 56, fontSize: 17 }}
          >
            {session.result ? 'Carte suivante' : session.flipped ? 'Je ne savais pas' : 'Vérifier'}
          </Button>
        </Stack>
      ) : null}
    </PageLayout>
  );
}

function CardFace({ children, back = false, glow, revealed = false }: { children: React.ReactNode; back?: boolean; glow?: string | null; revealed?: boolean }) {
  return (
    <Box
      sx={{
        position: 'absolute', inset: 0, p: 2.5, borderRadius: 7, display: 'flex', flexDirection: 'column',
        backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
        transform: back ? 'rotateY(180deg)' : 'none',
        background: back
          ? `radial-gradient(120% 80% at 50% 0%, ${glow ? `${glow}26` : 'rgba(139,108,255,0.18)'}, transparent 70%), ${tokens.surfaceRaised}`
          : `radial-gradient(120% 80% at 50% 0%, rgba(139,108,255,0.16), transparent 70%), ${tokens.surface}`,
        border: `1.5px solid ${glow ?? tokens.borderStrong}`,
        boxShadow: glow ? `0 0 40px -8px ${glow}66, 0 30px 60px -34px rgba(49,39,78,0.48)` : '0 30px 60px -34px rgba(49,39,78,0.48)',
        transition: 'border-color .3s, box-shadow .3s',
      }}
    >
      {!back || revealed ? children : null}
    </Box>
  );
}
