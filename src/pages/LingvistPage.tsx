import { Lightbulb, MoveHorizontal, RefreshCw, Volume2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { QueryState } from '@/components/common/QueryState';
import { PageLayout } from '@/components/layout/PageLayout';
import { LingvistResultPanel } from '@/components/lingvist/LingvistResultPanel';
import { Alert } from '@/components/ui/alert';
import { Button, IconButton } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { Input } from '@/components/ui/form';
import { SectionHeader } from '@/components/ui/list';
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
    : tokens.violet;
  const shown = decision && decision.resultKind !== 'success' ? expected : typed;

  return (
    <p className="text-[26px] font-semibold leading-[1.4] tracking-[-0.02em] sm:text-[30px]">
      {parts[0]}
      <span
        className="mx-0.5 inline-block min-w-[110px] rounded-t-md border-b-2 px-2 text-center transition-[color,border-color,background] duration-300"
        style={{
          color: tone,
          borderColor: tone,
          background: decision ? alpha(tone, 0.1) : 'transparent',
        }}
      >
        {shown ? (
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span key={shown} initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="inline-block">
              {shown}
            </motion.span>
          </AnimatePresence>
        ) : (
          <span className="text-[0.72em] font-medium text-muted">{cue || '• • •'}</span>
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
    <PageLayout reading>
      {session.completed ? (
        <CelebrationCard
          title="Session terminée"
          subtitle="Chaque mot rappelé s’ancre un peu plus."
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
            title="Lingvist"
            progress={progress}
            combo={combo.combo}
            label={total ? `${session.safeIndex + 1} sur ${total}` : undefined}
            onClose={() => navigate('/')}
            action={(
              <IconButton aria-label="Trier les mots faciles" onClick={() => navigate('/lingvist-triage')}>
                <MoveHorizontal />
              </IconButton>
            )}
          />
          <QueryState loading={session.isLoading} error={session.isError} offline={!online} onRetry={() => session.refetch()} />

          {card ? (
            <form onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, x: 32 }}
                  animate={wrong ? { opacity: 1, x: [0, -10, 10, -6, 6, -3, 0] } : { opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -32 }}
                  transition={wrong ? { duration: 0.45 } : { type: 'spring', stiffness: 360, damping: 34 }}
                  className="flex flex-col gap-4 rounded-2xl bg-surface p-5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="type-overline text-muted">Complète la phrase</span>
                    <span className="flex items-center gap-1.5">
                      {card.qualityStatus === 'rebuilt' ? <Chip size="sm" label="Reconstruite" /> : null}
                      <span className="text-[13px] font-semibold text-muted">{card.level}</span>
                    </span>
                  </div>

                  <ClozeSentence
                    sentence={card.sentenceWithGap}
                    typed={session.answer}
                    cue={card.wordTraductionFr ? `${card.wordTraductionFr}…` : undefined}
                    decision={session.decision}
                    expected={card.expectedAnswer}
                  />

                  {card.sourceLesson ? <p className="-mt-2 text-[13px] text-muted">Entendu dans {card.sourceLesson.lessonCode}</p> : null}

                  {!session.decision ? (
                    <div className="flex flex-wrap gap-2">
                      <ToolChip icon={<Volume2 />} label="Écouter" onClick={() => speakEnglish(card.sentenceFull)} />
                      {!session.hintShown ? <ToolChip icon={<Lightbulb />} label="Indice" onClick={session.requestHint} /> : null}
                      <ToolChip icon={<RefreshCw />} label="Autre phrase" onClick={session.refreshVariant} />
                    </div>
                  ) : null}

                  <AnimatePresence>
                    {session.hintShown && !session.decision ? (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden text-[15px] text-muted"
                      >
                        Commence par <strong className="font-semibold text-fg">« {card.expectedAnswer.charAt(0)} »</strong> · {card.expectedAnswer.length} lettres
                      </motion.p>
                    ) : null}
                  </AnimatePresence>
                </motion.div>
              </AnimatePresence>

              <label htmlFor="lingvist-answer" className="mb-[7px] mt-6 block px-4 type-overline text-muted">Ta réponse</label>
              <Input
                id="lingvist-answer"
                ref={inputRef}
                placeholder={card.inputPlaceholder ?? 'Mot manquant'}
                value={session.answer}
                disabled={Boolean(session.decision) || session.isAnalyzing}
                onChange={(event) => session.setAnswer(event.target.value)}
                autoCapitalize="none"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                enterKeyHint={session.decision ? 'next' : 'done'}
                className="text-xl"
              />

              {session.attemptError ? <Alert severity="error" className="mt-3">La réponse n’a pas pu être enregistrée. Réessaie.</Alert> : null}
              {session.decision ? <LingvistResultPanel card={card} answer={session.answer} decision={session.decision} /> : null}

              {!session.decision && card.grammarHint ? (
                <>
                  <SectionHeader>Indice grammatical</SectionHeader>
                  <p className="rounded-xl bg-surface px-4 py-3.5 text-[15px] leading-snug">{card.grammarHint}</p>
                </>
              ) : null}

              <div className="sticky bottom-0 z-[2] -mx-4 mt-4 bg-bg/90 px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl">
                <Button
                  type="submit"
                  variant={session.decision?.resultKind === 'success' ? 'success' : 'primary'}
                  disabled={(!session.answer.trim() && !session.decision) || session.isAnalyzing}
                  className="w-full"
                >
                  {session.isAnalyzing ? (
                    <>
                      <RefreshCw className="animate-spin" />
                      Analyse…
                    </>
                  ) : session.decision ? 'Continuer' : 'Valider'}
                </Button>
                {!session.decision ? (
                  <div className="mt-1 flex">
                    <Button variant="ghost" onClick={session.reveal} disabled={session.isAnalyzing} className="flex-1">
                      Je ne sais pas
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => { feedback('swipe'); session.markAlreadyKnown(); }}
                      disabled={session.isMarkingKnown || session.isAnalyzing}
                      className="flex-1"
                    >
                      Je connais déjà
                    </Button>
                  </div>
                ) : (
                  <Button variant="ghost" onClick={() => speakEnglish(card.sentenceFull)} className="mt-1 w-full">
                    <Volume2 />Réécouter la phrase
                  </Button>
                )}
                <p className="mt-1 text-center text-[13px] tabular-nums text-muted">
                  {session.correctCount} exacte{session.correctCount > 1 ? 's' : ''} · {Math.max(0, total - completedCards)} restante{total - completedCards > 1 ? 's' : ''}
                </p>
              </div>
            </form>
          ) : null}
        </>
      )}
    </PageLayout>
  );
}

function ToolChip({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <Pressable onClick={onClick} aria-label={label} className="w-auto">
      <span className="flex h-9 items-center gap-1.5 rounded-full bg-ink/[0.08] px-3.5 text-[15px] text-fg [&_svg]:size-[17px] [&_svg]:text-violet">
        {icon}{label}
      </span>
    </Pressable>
  );
}
