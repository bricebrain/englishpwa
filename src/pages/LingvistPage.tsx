import { CheckCheck, CircleHelp, Lightbulb, MoveHorizontal, RefreshCw, Volume2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { QueryState } from '@/components/common/QueryState';
import { PageLayout } from '@/components/layout/PageLayout';
import { LingvistResultPanel } from '@/components/lingvist/LingvistResultPanel';
import { Alert } from '@/components/ui/alert';
import { Button, IconButton } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { Input } from '@/components/ui/form';
import { Pressable } from '@/components/ui/motion';
import { CelebrationCard, SessionHeader } from '@/components/ui/SessionChrome';
import { useCombo } from '@/hooks/useCombo';
import { useLingvistSession } from '@/hooks/useLingvistSession';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { feedback } from '@/services/feedbackService';
import { speakEnglish } from '@/services/speechPlaybackService';
import { alpha, tokens } from '@/theme';
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
    <p className="font-display text-[26px] font-bold leading-[1.45] tracking-[-0.02em] sm:text-[32px]">
      {parts[0]}
      <span
        className="mx-0.5 inline-block min-w-[90px] rounded-t-lg border-b-[3px] px-2 text-center transition-[color,border-color,background] duration-200"
        style={{
          color: tone,
          borderColor: tone,
          background: decision ? alpha(tone, 0.1) : typed ? alpha(tokens.violet, 0.1) : 'transparent',
        }}
      >
        {shown ? (
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span key={shown} initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="inline-block">
              {shown}
            </motion.span>
          </AnimatePresence>
        ) : (
          <span className="text-[0.7em] font-semibold opacity-55">{cue || '• • •'}</span>
        )}
      </span>
      {parts.slice(1).join('')}
    </p>
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
              <IconButton aria-label="Trier les mots faciles" onClick={() => navigate('/lingvist-triage')}>
                <MoveHorizontal />
              </IconButton>
            )}
          />
          <QueryState loading={session.isLoading} error={session.isError} offline={!online} onRetry={() => session.refetch()} />

          {card ? (
            <div className="grid grid-cols-1 items-start gap-[18px] md:grid-cols-3">
              <div className="md:col-span-2">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, x: 40, rotate: 1.5 }}
                    animate={wrong ? { opacity: 1, x: [0, -12, 12, -8, 8, -4, 0], rotate: 0 } : { opacity: 1, x: 0, rotate: 0 }}
                    exit={{ opacity: 0, x: -60, rotate: -2 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 26 }}
                  >
                    <Card>
                      <CardContent className="p-5 sm:p-7">
                        <div className="mb-5 flex flex-wrap gap-1.5">
                          <Chip size="sm" label={card.level} className="bg-grad-primary text-white" />
                          {card.sourceLesson ? <Chip size="sm" label={`Entendu dans ${card.sourceLesson.lessonCode}`} /> : null}
                          {card.qualityStatus === 'rebuilt' ? <Chip size="sm" variant="outlined" label="Phrase reconstruite" className="border-amber/50 text-amber" /> : null}
                        </div>

                        <ClozeSentence
                          sentence={card.sentenceWithGap}
                          typed={session.answer}
                          cue={card.wordTraductionFr ? `${card.wordTraductionFr}…` : undefined}
                          decision={session.decision}
                          expected={card.expectedAnswer}
                        />

                        {!session.decision ? (
                          <div className="mt-5 flex flex-wrap gap-2">
                            <ToolChip icon={<Volume2 />} label="Écouter" onClick={() => speakEnglish(card.sentenceFull)} />
                            {!session.hintShown ? <ToolChip icon={<Lightbulb />} label="Indice" onClick={session.requestHint} /> : null}
                            <ToolChip icon={<RefreshCw />} label="Autre phrase" onClick={session.refreshVariant} />
                          </div>
                        ) : null}

                        <AnimatePresence>
                          {session.hintShown && !session.decision ? (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                              <div className="mt-3.5 flex items-center gap-2 rounded-2xl border border-amber/25 bg-amber/10 p-3">
                                <Lightbulb className="size-6 shrink-0 text-amber" />
                                <p className="text-sm">
                                  Commence par <strong className="text-amber">« {card.expectedAnswer.charAt(0)} »</strong> · {card.expectedAnswer.length} lettres
                                </p>
                              </div>
                            </motion.div>
                          ) : null}
                        </AnimatePresence>

                        <form onSubmit={handleSubmit} className="mt-5">
                          <Input
                            ref={inputRef}
                            placeholder={card.inputPlaceholder ?? 'Tape le mot manquant'}
                            value={session.answer}
                            disabled={Boolean(session.decision) || session.isAnalyzing}
                            onChange={(event) => session.setAnswer(event.target.value)}
                            autoCapitalize="none"
                            autoComplete="off"
                            autoCorrect="off"
                            spellCheck={false}
                            enterKeyHint={session.decision ? 'next' : 'done'}
                            aria-label="Mot manquant"
                            className="text-xl font-bold"
                          />

                          {session.attemptError ? <Alert severity="error" className="mt-3">La réponse n’a pas pu être enregistrée. Réessaie.</Alert> : null}
                          {session.decision ? <LingvistResultPanel card={card} answer={session.answer} decision={session.decision} /> : null}

                          {!session.decision ? (
                            <div className="mt-4 flex gap-2">
                              <Button variant="outline" onClick={session.reveal} disabled={session.isAnalyzing} className="flex-1">
                                <CircleHelp />Je ne sais pas
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => { feedback('swipe'); session.markAlreadyKnown(); }}
                                disabled={session.isMarkingKnown || session.isAnalyzing}
                                className="flex-1 border-mint/35 text-mint hover:border-mint hover:bg-mint/8"
                              >
                                <CheckCheck />Je connais
                              </Button>
                            </div>
                          ) : (
                            <Button variant="ghost" onClick={() => speakEnglish(card.sentenceFull)} className="mt-3 w-full">
                              <Volume2 />Réécouter la phrase
                            </Button>
                          )}

                          <div
                            className="sticky bottom-[calc(88px+env(safe-area-inset-bottom))] z-[2] -mx-2 mt-1 px-2 pb-2 sm:bottom-3"
                            style={{ background: `linear-gradient(to top, ${tokens.surface} 65%, transparent)` }}
                          >
                            <Button
                              type="submit"
                              size="lg"
                              variant={session.decision?.resultKind === 'success' ? 'success' : 'primary'}
                              disabled={(!session.answer.trim() && !session.decision) || session.isAnalyzing}
                              className="mt-3 min-h-14 w-full text-[17px]"
                            >
                              {session.isAnalyzing ? (
                                <>
                                  <RefreshCw className="animate-spin" />
                                  Analyse…
                                </>
                              ) : session.decision ? 'Continuer' : 'Valider'}
                            </Button>
                          </div>
                        </form>
                      </CardContent>
                    </Card>
                  </motion.div>
                </AnimatePresence>
              </div>

              <Card>
                <CardContent>
                  <div className="mb-2 flex items-center gap-2">
                    <Lightbulb className="size-5 text-cyan" />
                    <span className="type-overline text-cyan">Indice grammatical</span>
                  </div>
                  <p className="text-[15px] leading-relaxed">{card.grammarHint}</p>
                  <div className="mt-5 flex gap-2.5">
                    <MiniStat label="Exactes" value={session.correctCount} color={tokens.mint} />
                    <MiniStat label="Restantes" value={Math.max(0, total - completedCards)} />
                  </div>
                  {card.qualityReasons?.length ? <p className="mt-3 text-xs text-faint">Qualité de carte : {card.qualityReasons.join(', ')}</p> : null}
                </CardContent>
              </Card>
            </div>
          ) : null}
        </>
      )}
    </PageLayout>
  );
}

function ToolChip({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <Pressable onClick={onClick} aria-label={label} className="w-auto">
      <span className="flex h-[38px] items-center gap-1.5 rounded-xl border border-border bg-ink/5 px-3 text-sm font-bold text-muted [&_svg]:size-[18px] [&_svg]:text-violet-soft">
        {icon}{label}
      </span>
    </Pressable>
  );
}

function MiniStat({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="flex-1 rounded-2xl border border-border bg-ink/[0.035] p-3">
      <motion.div key={value} initial={{ scale: 1.4 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 15 }} className="origin-left">
        <p className="font-display text-[26px] font-extrabold" style={{ color }}>{value}</p>
      </motion.div>
      <p className="text-xs font-bold text-muted">{label}</p>
    </div>
  );
}
