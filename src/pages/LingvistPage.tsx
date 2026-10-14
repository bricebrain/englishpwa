import AutorenewRounded from '@mui/icons-material/AutorenewRounded';
import DoneAllRounded from '@mui/icons-material/DoneAllRounded';
import HelpOutlineRounded from '@mui/icons-material/HelpOutlineRounded';
import LightbulbRounded from '@mui/icons-material/LightbulbRounded';
import SwipeRounded from '@mui/icons-material/SwipeRounded';
import TipsAndUpdatesRounded from '@mui/icons-material/TipsAndUpdatesRounded';
import VolumeUpRounded from '@mui/icons-material/VolumeUpRounded';
import { Alert, Box, Button, Card, CardContent, Chip, Grid, IconButton, InputBase, Stack, Typography } from '@mui/material';
import { AnimatePresence } from 'framer-motion';
import { useEffect, useRef, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { QueryState } from '@/components/common/QueryState';
import { PageLayout } from '@/components/layout/PageLayout';
import { LingvistResultPanel } from '@/components/lingvist/LingvistResultPanel';
import { MotionBox, Pressable } from '@/components/ui/motion';
import { CelebrationCard, SessionHeader } from '@/components/ui/SessionChrome';
import { useCombo } from '@/hooks/useCombo';
import { useLingvistSession } from '@/hooks/useLingvistSession';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { feedback } from '@/services/feedbackService';
import { speakEnglish } from '@/services/speechPlaybackService';
import { displayFont, gradients, tokens } from '@/theme';
import type { LingvistDecision } from '@/types/learning';

/** Phrase à trou : la réponse tapée s'inscrit en direct dans le trou. */
function ClozeSentence({ sentence, typed, cue, decision, expected }: {
  sentence: string;
  typed: string;
  cue?: string;
  decision: LingvistDecision | null;
  expected: string;
}) {
  const parts = sentence.split(/_{3,}/);
  const tone = decision
    ? decision.resultKind === 'success' ? tokens.mint : decision.resultKind === 'almost' ? tokens.amber : tokens.red
    : tokens.violetSoft;
  const shown = decision && decision.resultKind !== 'success' ? expected : typed;

  return (
    <Typography fontFamily={displayFont} fontSize={{ xs: 26, sm: 32 }} lineHeight={1.45} fontWeight={700} letterSpacing="-0.02em">
      {parts[0]}
      <Box
        component="span"
        sx={{
          display: 'inline-block', minWidth: 90, px: 1, mx: 0.25, textAlign: 'center', color: tone,
          borderBottom: `3px solid ${tone}`, borderRadius: '8px 8px 0 0', transition: 'color .25s, border-color .25s, background .25s',
          background: decision ? `${tone}1A` : typed ? 'rgba(139,108,255,0.1)' : 'transparent',
        }}
      >
        {shown ? (
          <AnimatePresence mode="popLayout" initial={false}>
            <MotionBox key={shown} component="span" initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} sx={{ display: 'inline-block' }}>
              {shown}
            </MotionBox>
          </AnimatePresence>
        ) : (
          <Box component="span" sx={{ opacity: 0.55, fontSize: '0.7em', fontWeight: 600 }}>{cue || '• • •'}</Box>
        )}
      </Box>
      {parts.slice(1).join('')}
    </Typography>
  );
}

export function LingvistPage() {
  const navigate = useNavigate();
  const online = useNetworkStatus();
  const session = useLingvistSession();
  const combo = useCombo(10);
  const handled = useRef<LingvistDecision | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const total = session.cards.length;
  const completedCards = session.cardIndex + (session.decision ? 1 : 0);
  const progress = total ? Math.min(1, completedCards / total) : 0;
  const card = session.currentCard;

  // Déclenche son, vibration, XP et combo à chaque nouveau verdict.
  useEffect(() => {
    const decision = session.decision;
    if (!decision || handled.current === decision) return;
    handled.current = decision;
    if (decision.resultKind === 'success') combo.hit(card?.lemma);
    else if (decision.resultKind === 'almost') combo.almost();
    else combo.miss();
  }, [card?.lemma, combo, session.decision]);

  useEffect(() => {
    if (!session.decision) inputRef.current?.focus({ preventScroll: true });
  }, [session.cardIndex, session.decision]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (session.decision) {
      feedback('tap');
      session.next();
    } else session.checkAnswer();
  };

  const wrong = session.decision && session.decision.resultKind === 'error';

  return (
    <PageLayout>
      {session.completed ? (
        <CelebrationCard
          title="Session terminée !"
          subtitle="Chaque mot rappelé s’ancre un peu plus. Bravo."
          score={total ? session.correctCount / total : 0}
          stats={[
            { label: 'Exactes', value: session.correctCount, color: tokens.mint },
            { label: 'Cartes', value: total },
          ]}
          onRestart={() => { combo.reset(); session.restart(); }}
        />
      ) : (
        <>
          <SessionHeader
            progress={progress}
            combo={combo.combo}
            label={total ? `${session.safeIndex + 1}/${total}` : undefined}
            onClose={() => navigate('/')}
            action={(
              <IconButton aria-label="Trier les mots faciles" onClick={() => navigate('/lingvist-triage')} sx={{ color: 'text.secondary' }}>
                <SwipeRounded />
              </IconButton>
            )}
          />
          <QueryState loading={session.isLoading} error={session.isError} offline={!online} onRetry={() => session.refetch()} />

          {card ? (
            <Grid container spacing={2.25} alignItems="flex-start">
              <Grid item xs={12} md={8}>
                <AnimatePresence mode="wait">
                  <MotionBox
                    key={card.id}
                    initial={{ opacity: 0, x: 40, rotate: 1.5 }}
                    animate={wrong ? { opacity: 1, x: [0, -12, 12, -8, 8, -4, 0], rotate: 0 } : { opacity: 1, x: 0, rotate: 0 }}
                    exit={{ opacity: 0, x: -60, rotate: -2 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 26 }}
                  >
                    <Card sx={{ overflow: 'visible' }}>
                      <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
                        <Stack direction="row" gap={0.75} flexWrap="wrap" useFlexGap mb={2.5}>
                          <Chip label={card.level} size="small" sx={{ background: gradients.primary, color: '#fff' }} />
                          {card.sourceLesson ? <Chip label={`Entendu dans ${card.sourceLesson.lessonCode}`} size="small" /> : null}
                          {card.qualityStatus === 'rebuilt' ? <Chip label="Phrase reconstruite" size="small" color="warning" variant="outlined" /> : null}
                        </Stack>

                        <ClozeSentence
                          sentence={card.sentenceWithGap}
                          typed={session.answer}
                          cue={card.wordTraductionFr ? `${card.wordTraductionFr}…` : undefined}
                          decision={session.decision}
                          expected={card.expectedAnswer}
                        />

                        {!session.decision ? (
                          <Stack direction="row" gap={1} flexWrap="wrap" useFlexGap mt={2.5}>
                            <ToolChip icon={<VolumeUpRounded />} label="Écouter" onClick={() => speakEnglish(card.sentenceFull)} />
                            {!session.hintShown ? <ToolChip icon={<LightbulbRounded />} label="Indice" onClick={session.requestHint} /> : null}
                            <ToolChip icon={<AutorenewRounded />} label="Autre phrase" onClick={session.refreshVariant} />
                          </Stack>
                        ) : null}

                        <AnimatePresence>
                          {session.hintShown && !session.decision ? (
                            <MotionBox initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                              <Stack direction="row" alignItems="center" gap={1} mt={1.75} p={1.5} borderRadius={4} sx={{ background: 'rgba(255,181,71,0.1)', border: '1px solid rgba(255,181,71,0.25)' }}>
                                <LightbulbRounded sx={{ color: tokens.amber }} />
                                <Typography fontSize={14}>
                                  Commence par <strong style={{ color: tokens.amber }}>« {card.expectedAnswer.charAt(0)} »</strong> · {card.expectedAnswer.length} lettres
                                </Typography>
                              </Stack>
                            </MotionBox>
                          ) : null}
                        </AnimatePresence>

                        <Box component="form" onSubmit={handleSubmit} mt={2.5}>
                          <InputBase
                            inputRef={inputRef}
                            fullWidth
                            placeholder={card.inputPlaceholder ?? 'Tape le mot manquant'}
                            value={session.answer}
                            disabled={Boolean(session.decision) || session.isAnalyzing}
                            onChange={(event) => session.setAnswer(event.target.value)}
                            inputProps={{ autoCapitalize: 'none', autoComplete: 'off', autoCorrect: 'off', spellCheck: false, enterKeyHint: session.decision ? 'next' : 'done', 'aria-label': 'Mot manquant' }}
                            sx={{
                              px: 2.25, py: 1.25, borderRadius: 4, fontSize: 20, fontWeight: 700,
                              background: 'rgba(255,255,255,0.05)', border: `2px solid ${tokens.border}`,
                              transition: 'border-color .2s, box-shadow .2s',
                              '&.Mui-focused': { borderColor: tokens.violet, boxShadow: `0 0 0 5px rgba(139,108,255,0.18)` },
                            }}
                          />

                          {session.attemptError ? <Alert severity="error" sx={{ mt: 1.5 }}>La réponse n’a pas pu être enregistrée. Réessaie.</Alert> : null}
                          {session.decision ? <LingvistResultPanel card={card} answer={session.answer} decision={session.decision} /> : null}

                          {!session.decision ? (
                            <Stack direction="row" gap={1} mt={2}>
                              <Button variant="outlined" startIcon={<HelpOutlineRounded />} onClick={session.reveal} disabled={session.isAnalyzing} sx={{ flex: 1 }}>
                                Je ne sais pas
                              </Button>
                              <Button
                                variant="outlined"
                                startIcon={<DoneAllRounded />}
                                onClick={() => { feedback('swipe'); session.markAlreadyKnown(); }}
                                disabled={session.isMarkingKnown || session.isAnalyzing}
                                sx={{ flex: 1, color: tokens.mint, borderColor: 'rgba(52,229,160,0.35)' }}
                              >
                                Je connais
                              </Button>
                            </Stack>
                          ) : (
                            <Button fullWidth variant="text" startIcon={<VolumeUpRounded />} onClick={() => speakEnglish(card.sentenceFull)} sx={{ mt: 1.5 }}>
                              Réécouter la phrase
                            </Button>
                          )}

                          <Box
                            sx={{
                              position: 'sticky', zIndex: 2, mx: -1, px: 1, pb: 1, mt: 0.5,
                              bottom: { xs: 'calc(88px + env(safe-area-inset-bottom))', sm: 12 },
                              background: `linear-gradient(to top, ${tokens.surface} 65%, transparent)`,
                            }}
                          >
                          <Button
                            type="submit"
                            fullWidth
                            size="large"
                            variant="contained"
                            color={session.decision?.resultKind === 'success' ? 'success' : 'primary'}
                            disabled={(!session.answer.trim() && !session.decision) || session.isAnalyzing}
                            sx={{ mt: 1.5, minHeight: 56, fontSize: 17 }}
                          >
                            {session.isAnalyzing ? (
                              <Stack direction="row" alignItems="center" gap={1}>
                                <MotionBox animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} sx={{ display: 'grid' }}>
                                  <AutorenewRounded />
                                </MotionBox>
                                Analyse…
                              </Stack>
                            ) : session.decision ? 'Continuer' : 'Valider'}
                          </Button>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </MotionBox>
                </AnimatePresence>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Stack direction="row" alignItems="center" gap={1} mb={1}>
                      <TipsAndUpdatesRounded sx={{ color: tokens.cyan }} />
                      <Typography variant="overline" color={tokens.cyan}>Indice grammatical</Typography>
                    </Stack>
                    <Typography fontSize={15} lineHeight={1.6}>{card.grammarHint}</Typography>
                    <Stack direction="row" gap={1.25} mt={2.5}>
                      <MiniStat label="Exactes" value={session.correctCount} color={tokens.mint} />
                      <MiniStat label="Restantes" value={Math.max(0, total - completedCards)} />
                    </Stack>
                    {card.qualityReasons?.length ? <Typography mt={1.5} color="text.disabled" fontSize={12}>Qualité de carte : {card.qualityReasons.join(', ')}</Typography> : null}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          ) : null}
        </>
      )}
    </PageLayout>
  );
}

function ToolChip({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <Pressable onClick={onClick} aria-label={label} sx={{ width: 'auto' }}>
      <Stack
        direction="row" alignItems="center" gap={0.75} px={1.5} height={38} borderRadius={3}
        sx={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${tokens.border}`, color: 'text.secondary', fontSize: 14, fontWeight: 700, '& svg': { fontSize: 18, color: tokens.violetSoft } }}
      >
        {icon}{label}
      </Stack>
    </Pressable>
  );
}

function MiniStat({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <Box flex={1} p={1.5} borderRadius={4} sx={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${tokens.border}` }}>
      <MotionBox key={value} initial={{ scale: 1.4 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 15 }} sx={{ transformOrigin: 'left center' }}>
        <Typography fontFamily={displayFont} fontWeight={800} fontSize={26} color={color}>{value}</Typography>
      </MotionBox>
      <Typography fontSize={12} color="text.secondary" fontWeight={700}>{label}</Typography>
    </Box>
  );
}
