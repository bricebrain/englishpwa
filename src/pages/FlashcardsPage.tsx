import { Pointer, Shuffle, Volume2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

import { QueryState } from '@/components/common/QueryState';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button, IconButton } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { Input } from '@/components/ui/form';
import { Segmented } from '@/components/ui/segmented';
import { CelebrationCard, SessionHeader } from '@/components/ui/SessionChrome';
import { WordContexts } from '@/components/vocabulary/WordContexts';
import { WordEnrichmentDetails } from '@/components/vocabulary/WordEnrichmentDetails';
import { getVocabularyExamples, getVocabularyPartOfSpeechLabel } from '@/helpers/vocabularyDisplay';
import { useCombo } from '@/hooks/useCombo';
import { useFlashcardSession } from '@/hooks/useFlashcardSession';
import { cn } from '@/lib/utils';
import { feedback } from '@/services/feedbackService';
import { speakEnglish } from '@/services/speechPlaybackService';
import { alpha, tokens } from '@/theme';
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
        action={<IconButton aria-label="Mélanger" onClick={() => { feedback('swipe'); session.shuffle(); }}><Shuffle /></IconButton>}
      />

      {!finished ? (
        <div className="mb-5 flex flex-wrap justify-between gap-2">
          <Segmented
            aria-label="File de cartes"
            size="sm"
            value={mode}
            onChange={(value) => setParams({ mode: value })}
            options={[
              { value: 'due', label: `À réviser · ${session.dueCount}` },
              { value: 'new', label: `Nouveaux · ${session.newCount}` },
              { value: 'mixed', label: 'Mixte' },
            ]}
          />
          <Segmented
            aria-label="Sens de traduction"
            size="sm"
            value={session.direction}
            onChange={session.setDirection}
            options={[{ value: 'en-to-fr', label: 'EN→FR' }, { value: 'fr-to-en', label: 'FR→EN' }]}
          />
        </div>
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
        <div className="py-12 text-center">
          <p className="text-[64px]">🎉</p>
          <h2 className="type-h2 mt-2">Tout est à jour</h2>
          <p className="mt-1 text-muted">Aucune carte dans cette file. Essaie un autre mode.</p>
        </div>
      ) : word ? (
        <div className="flex flex-col gap-4">
          <div style={{ perspective: 1400 }}>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={`${word.id}-${session.done}`}
                initial={{ x: 300, opacity: 0, rotate: 8 }}
                animate={{ x: 0, opacity: 1, rotate: 0 }}
                exit={{ x: -320, opacity: 0, rotate: -10 }}
                transition={{ type: 'spring', stiffness: 260, damping: 26 }}
              >
                <motion.div
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
                  className={cn('relative h-[300px] rounded-[28px] outline-offset-4 sm:h-[340px]', session.result ? 'cursor-default' : 'cursor-pointer')}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <CardFace>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1.5">
                        <Chip size="sm" label={word.niveau} className="bg-grad-primary text-white" />
                        {partOfSpeech ? <Chip size="sm" label={partOfSpeech} /> : null}
                      </div>
                      <span className="text-xs font-bold text-faint">{session.direction === 'en-to-fr' ? 'Anglais' : 'Français'}</span>
                    </div>
                    <div className="grid flex-1 place-items-center">
                      <div className="text-center">
                        <p className="font-display text-[40px] font-extrabold leading-[1.1] tracking-[-0.03em] sm:text-[50px]">
                          {session.frontText}
                        </p>
                        {word.ipa_uk && session.direction === 'en-to-fr' ? <p className="mt-2 text-muted">/{word.ipa_uk}/</p> : null}
                        {session.direction === 'en-to-fr' ? (
                          <IconButton
                            aria-label="Écouter le mot"
                            onClick={(event) => { event.stopPropagation(); speakEnglish(session.spokenWord); }}
                            className="mt-3 size-[52px] bg-violet/15 text-violet-soft hover:bg-violet/20"
                          >
                            <Volume2 />
                          </IconButton>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-1.5 text-faint">
                      <Pointer className="size-[18px]" />
                      <span className="text-[12.5px] font-semibold">Touche pour retourner</span>
                    </div>
                  </CardFace>

                  <CardFace back glow={glow} revealed={showBack}>
                    <div className="flex items-center justify-between">
                      <span className="type-overline" style={{ color: glow ?? tokens.violetSoft }}>
                        {session.result ? RESULT_LABELS[session.result] : 'Réponse'}
                      </span>
                      <span className="text-xs font-bold text-faint">{session.frontText}</span>
                    </div>
                    <div className="grid flex-1 place-items-center">
                      <div className="px-2 text-center">
                        <p
                          className="font-display text-[34px] font-extrabold leading-[1.15] tracking-[-0.02em] sm:text-[42px]"
                          style={{ color: glow ?? tokens.text }}
                        >
                          {session.expected}
                        </p>
                        {session.answer && session.result && session.result !== 'success' ? (
                          <p className="mt-2 text-muted line-through">{session.answer}</p>
                        ) : null}
                        {example ? (
                          <div className="mt-4">
                            <p className="text-[15px] italic">{example.en}</p>
                            {example.fr ? <p className="text-[13px] text-muted">{example.fr}</p> : null}
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <p className="text-center text-[12.5px] font-semibold text-faint">
                      {session.result ? (session.result === 'success' ? 'Elle reviendra plus tard' : 'Elle reviendra bientôt dans la pile') : 'Réponse révélée · le mot reviendra'}
                    </p>
                  </CardFace>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Les autres sens ne sont montrés qu'après la réponse, pour ne pas la souffler. */}
          <AnimatePresence initial={false}>
            {showBack ? (
              <motion.div
                key={`details-${word.id}-${session.done}`}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex flex-col gap-3"
              >
                <WordEnrichmentDetails word={word} skipFirstSense />
                <WordContexts word={session.spokenWord} />
              </motion.div>
            ) : null}
          </AnimatePresence>

          {!session.result && !session.flipped ? (
            <Input
              value={session.answer}
              onChange={(event) => session.setAnswer(event.target.value)}
              placeholder={session.direction === 'en-to-fr' ? 'Traduction française…' : 'Mot anglais…'}
              onKeyDown={(event) => { if (event.key === 'Enter' && session.answer.trim()) session.validate(); }}
              autoCapitalize="none"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              aria-label="Ta réponse"
              className="text-center text-[19px] font-bold"
            />
          ) : null}

          <Button
            size="lg"
            variant={session.result === 'success' ? 'success' : 'primary'}
            disabled={session.isSaving || (!session.flipped && !session.result && !session.answer.trim())}
            onClick={() => {
              if (session.result) { feedback('swipe'); session.next(); } else session.validate();
            }}
            className="min-h-14 w-full text-[17px]"
          >
            {session.result ? 'Carte suivante' : session.flipped ? 'Je ne savais pas' : 'Vérifier'}
          </Button>
        </div>
      ) : null}
    </PageLayout>
  );
}

function CardFace({ children, back = false, glow, revealed = false }: { children: React.ReactNode; back?: boolean; glow?: string | null; revealed?: boolean }) {
  const halo = back ? alpha(glow ?? tokens.violet, glow ? 0.15 : 0.18) : alpha(tokens.violet, 0.16);
  return (
    <div
      className="absolute inset-0 flex flex-col rounded-[28px] p-5 transition-[border-color,box-shadow] duration-300 [backface-visibility:hidden]"
      style={{
        transform: back ? 'rotateY(180deg)' : 'none',
        background: `radial-gradient(120% 80% at 50% 0%, ${halo}, transparent 70%), ${tokens.surface}`,
        border: `1.5px solid ${glow ?? tokens.borderStrong}`,
        boxShadow: glow ? `0 0 40px -8px ${alpha(glow, 0.4)}, var(--card-shadow)` : 'var(--card-shadow)',
      }}
    >
      {!back || revealed ? children : null}
    </div>
  );
}
