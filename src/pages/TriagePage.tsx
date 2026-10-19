import { Check, Eye, Flag, RefreshCw } from 'lucide-react';
import { AnimatePresence, animate, motion, useMotionValue, useTransform, type MotionValue, type PanInfo } from 'motion/react';
import { useState } from 'react';

import { QueryState } from '@/components/common/QueryState';
import { PageLayout } from '@/components/layout/PageLayout';
import { Alert } from '@/components/ui/alert';
import { Button, IconButton } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { AnimatedNumber, Pressable } from '@/components/ui/motion';
import { SessionHeader } from '@/components/ui/SessionChrome';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import {
  getVocabularyDisplayForm,
  getVocabularyLemma,
  getVocabularyPartOfSpeechLabel,
  getVocabularyTranslation,
} from '@/helpers/vocabularyDisplay';
import { useTriageSession, type TriageAction } from '@/hooks/useTriageSession';
import { cn } from '@/lib/utils';
import { celebrate, feedback } from '@/services/feedbackService';
import { awardXp } from '@/services/xpService';
import { speakEnglish } from '@/services/speechPlaybackService';
import { alpha, tokens } from '@/theme';
import type { SrsTriageCandidate } from '@/types/learning';

const SWIPE_THRESHOLD = 110;

/** Carte du dessus : glisser à droite = « je connais », à gauche = « à apprendre ». */
function SwipeCard({ candidate, showTranslation, onToggle, onDecide, exitDirection }: {
  candidate: SrsTriageCandidate;
  showTranslation: boolean;
  onToggle: () => void;
  onDecide: (action: TriageAction) => void;
  exitDirection: number;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 220], [-16, 16]);
  const partOfSpeech = getVocabularyPartOfSpeechLabel(candidate);
  const knownOpacity = useTransform(x, [20, SWIPE_THRESHOLD], [0, 1]);
  const focusOpacity = useTransform(x, [-SWIPE_THRESHOLD, -20], [1, 0]);
  const [dragging, setDragging] = useState(false);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    setDragging(false);
    const power = info.offset.x + info.velocity.x * 0.2;
    if (power > SWIPE_THRESHOLD) onDecide('known');
    else if (power < -SWIPE_THRESHOLD) onDecide('focus');
    else void animate(x, 0, { type: 'spring', stiffness: 500, damping: 30 });
  };

  return (
    <motion.div
      drag="x"
      dragElastic={0.9}
      dragConstraints={{ left: 0, right: 0 }}
      onDragStart={() => setDragging(true)}
      onDragEnd={handleDragEnd}
      onTap={() => { if (!dragging) { feedback('tap'); onToggle(); } }}
      style={{
        x,
        rotate,
        background: `radial-gradient(120% 70% at 50% 0%, ${alpha(tokens.violet, 0.2)}, transparent 70%), ${tokens.surface}`,
      }}
      initial={{ scale: 0.92, y: 18, opacity: 0 }}
      animate={{ scale: 1, y: 0, opacity: 1 }}
      exit={{ x: exitDirection * 520, rotate: exitDirection * 24, opacity: 0, transition: { duration: 0.35 } }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      whileTap={{ cursor: 'grabbing' }}
      className="absolute inset-0 z-[3] flex cursor-grab touch-pan-y select-none flex-col rounded-[28px] border-[1.5px] border-border-strong p-6 shadow-float"
    >
      <Stamp opacity={knownOpacity} color={tokens.mint} rotate={-12} side="left">CONNU</Stamp>
      <Stamp opacity={focusOpacity} color={tokens.amber} rotate={12} side="right">À APPRENDRE</Stamp>

      <div className="flex justify-center gap-1.5">
        <Chip size="sm" label={candidate.niveau} className="bg-grad-primary text-white" />
        {partOfSpeech ? <Chip size="sm" label={partOfSpeech} /> : null}
      </div>

      <div className="grid flex-1 place-items-center">
        <div className="text-center">
          <p className="font-display text-[44px] font-extrabold leading-[1.05] tracking-[-0.03em] sm:text-[54px]">
            {getVocabularyDisplayForm(candidate)}
          </p>
          <div className="mt-3 flex justify-center gap-[3px]" aria-label={`Fréquence ${candidate.frequence} sur 5`}>
            {Array.from({ length: 5 }, (_, index) => (
              <span key={index} className={cn('h-[5px] w-[18px] rounded-full', index < candidate.frequence ? 'bg-cyan' : 'bg-ink/10')} />
            ))}
          </div>
          <div className="mt-5 min-h-16">
            <AnimatePresence mode="wait">
              {showTranslation ? (
                <motion.p
                  key="fr"
                  initial={{ opacity: 0, y: 10, filter: 'blur(6px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0 }}
                  className="text-[22px] font-bold text-violet-soft"
                >
                  {getVocabularyTranslation(candidate) ?? 'Traduction indisponible'}
                </motion.p>
              ) : (
                <motion.p key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[13.5px] font-semibold text-faint">
                  Touche la carte pour voir la traduction
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="flex justify-between text-xs font-bold text-faint">
        <span>← À apprendre</span>
        <span>Je connais →</span>
      </div>
    </motion.div>
  );
}

function Stamp({ opacity, color, rotate, side, children }: {
  opacity: MotionValue<number>;
  color: string;
  rotate: number;
  side: 'left' | 'right';
  children: React.ReactNode;
}) {
  return (
    <motion.span
      style={{ opacity, color, borderColor: color, background: alpha(color, 0.12), rotate, [side]: 22 }}
      className="pointer-events-none absolute top-7 z-[2] rounded-lg border-[3px] px-3 py-1 font-display text-[22px] font-extrabold tracking-[0.04em]"
    >
      {children}
    </motion.span>
  );
}

export function TriagePage() {
  const online = useNetworkStatus();
  const triage = useTriageSession();
  const [exitDirection, setExitDirection] = useState(1);
  const deck = triage.candidates.slice(0, 3);
  const top = deck[0];
  const sorted = triage.knownCount + triage.focusCount;
  const total = sorted + triage.candidates.length;

  const decide = (candidate: SrsTriageCandidate, action: TriageAction) => {
    setExitDirection(action === 'known' ? 1 : -1);
    feedback(action === 'known' ? 'success' : 'select');
    awardXp(2);
    if ((sorted + 1) % 25 === 0) void celebrate('small');
    triage.applyChoice(candidate, action);
  };

  return (
    <PageLayout reading>
      <SessionHeader
        progress={total ? sorted / total : 0}
        label={`${sorted}/${total}`}
        action={<IconButton aria-label="Rafraîchir la liste" onClick={() => void triage.refresh()}><RefreshCw /></IconButton>}
      />

      <div className="mb-5 flex gap-2.5">
        <Counter label="Connus" value={triage.knownCount} color={tokens.mint} />
        <Counter label="À apprendre" value={triage.focusCount} color={tokens.amber} />
        <Counter label="Restants" value={triage.candidates.length} />
      </div>

      <QueryState loading={triage.isLoading} error={triage.isError} offline={!online} onRetry={() => triage.refetch()} skeletons={1} />
      {triage.saveError ? <Alert severity="error" className="mb-4">La dernière décision n’a pas pu être enregistrée, le mot est revenu dans la pile.</Alert> : null}

      {!triage.isLoading && !triage.isError && triage.candidates.length === 0 ? (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="py-12 text-center">
          <p className="text-[64px]">🧹</p>
          <h2 className="type-h2 mt-2">Pile vidée !</h2>
          <p className="mb-6 mt-1 text-muted">Tous les mots chargés ont été classés.</p>
          <Button onClick={() => void triage.refresh()}><RefreshCw />Charger d’autres mots</Button>
        </motion.div>
      ) : top ? (
        <>
          <div className="relative mx-1 h-[380px] sm:h-[420px]">
            {deck.slice(1).reverse().map((candidate, reverseIndex) => {
              const depth = deck.length - 1 - reverseIndex; // 2 puis 1
              return (
                <motion.div
                  key={candidate.id}
                  animate={{ scale: 1 - depth * 0.05, y: depth * 26, opacity: 1 - depth * 0.3 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                  className="absolute inset-0 rounded-[28px] border border-border bg-surface"
                  style={{ zIndex: 3 - depth }}
                />
              );
            })}
            <AnimatePresence custom={exitDirection}>
              <SwipeCard
                key={top.id}
                candidate={top}
                showTranslation={triage.visibleTranslations.has(top.id)}
                onToggle={() => triage.toggleTranslation(top.id)}
                onDecide={(action) => decide(top, action)}
                exitDirection={exitDirection}
              />
            </AnimatePresence>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6">
            <RoundAction label="À apprendre" color={tokens.amber} size={68} onClick={() => decide(top, 'focus')}><Flag /></RoundAction>
            <RoundAction label="Écouter et voir la traduction" color={tokens.violetSoft} size={52} onClick={() => { speakEnglish(getVocabularyLemma(top)); if (!triage.visibleTranslations.has(top.id)) triage.toggleTranslation(top.id); }}>
              <Eye />
            </RoundAction>
            <RoundAction label="Je connais" color={tokens.mint} size={68} onClick={() => decide(top, 'known')}><Check /></RoundAction>
          </div>
          <p className="mt-4 text-center text-[12.5px] text-faint">
            « Je connais » retire le mot des révisions · « À apprendre » le garde en priorité
          </p>
        </>
      ) : null}
    </PageLayout>
  );
}

function Counter({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="flex-1 rounded-2xl border border-border bg-ink/[0.035] py-2.5 text-center">
      <p className="font-display text-[22px] font-extrabold" style={{ color }}><AnimatedNumber value={value} duration={0.4} /></p>
      <p className="text-[11.5px] font-bold text-muted">{label}</p>
    </div>
  );
}

function RoundAction({ children, label, color, size, onClick }: { children: React.ReactNode; label: string; color: string; size: number; onClick: () => void }) {
  return (
    <Pressable onClick={onClick} aria-label={label} silent className="rounded-full" style={{ width: size, height: size }}>
      <span
        className="grid place-items-center rounded-full border-2 [&_svg]:size-[var(--icon-size)]"
        style={{
          width: size, height: size, color,
          background: alpha(color, 0.1), borderColor: alpha(color, 0.35), boxShadow: `0 12px 30px -12px ${color}`,
          '--icon-size': `${Math.round(size * 0.45)}px`,
        } as React.CSSProperties}
      >
        {children}
      </span>
    </Pressable>
  );
}
