import CheckRounded from '@mui/icons-material/CheckRounded';
import FlagRounded from '@mui/icons-material/FlagRounded';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import VisibilityRounded from '@mui/icons-material/VisibilityRounded';
import { Alert, Box, Button, Chip, IconButton, Stack, Typography } from '@mui/material';
import { AnimatePresence, animate, useMotionValue, useTransform, type PanInfo } from 'framer-motion';
import { useState } from 'react';

import { QueryState } from '@/components/common/QueryState';
import { PageLayout } from '@/components/layout/PageLayout';
import { AnimatedNumber, MotionBox, Pressable } from '@/components/ui/motion';
import { SessionHeader } from '@/components/ui/SessionChrome';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useTriageSession, type TriageAction } from '@/hooks/useTriageSession';
import { celebrate, feedback } from '@/services/feedbackService';
import { awardXp } from '@/services/xpService';
import { speakEnglish } from '@/services/speechPlaybackService';
import { displayFont, gradients, tokens } from '@/theme';
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
    <MotionBox
      drag="x"
      dragElastic={0.9}
      dragConstraints={{ left: 0, right: 0 }}
      onDragStart={() => setDragging(true)}
      onDragEnd={handleDragEnd}
      onTap={() => { if (!dragging) { feedback('tap'); onToggle(); } }}
      style={{ x, rotate }}
      initial={{ scale: 0.92, y: 18, opacity: 0 }}
      animate={{ scale: 1, y: 0, opacity: 1 }}
      exit={{ x: exitDirection * 520, rotate: exitDirection * 24, opacity: 0, transition: { duration: 0.35 } }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      whileTap={{ cursor: 'grabbing' }}
      sx={{
        position: 'absolute', inset: 0, zIndex: 3, borderRadius: 7, p: 3, cursor: 'grab', touchAction: 'pan-y',
        display: 'flex', flexDirection: 'column',
        background: `radial-gradient(120% 70% at 50% 0%, rgba(139,108,255,0.2), transparent 70%), ${tokens.surfaceRaised}`,
        border: `1.5px solid ${tokens.borderStrong}`, boxShadow: '0 40px 80px -36px rgba(49,39,78,0.5)',
        userSelect: 'none',
      }}
    >
      <MotionBox style={{ opacity: knownOpacity }} sx={stampSx(tokens.mint, -12, 'left')}>CONNU</MotionBox>
      <MotionBox style={{ opacity: focusOpacity }} sx={stampSx(tokens.amber, 12, 'right')}>À APPRENDRE</MotionBox>

      <Stack direction="row" gap={0.75} justifyContent="center">
        <Chip label={candidate.niveau} size="small" sx={{ background: gradients.primary, color: '#fff' }} />
        {candidate.type ? <Chip label={candidate.type} size="small" /> : null}
      </Stack>

      <Box flex={1} display="grid" sx={{ placeItems: 'center' }}>
        <Box textAlign="center">
          <Typography fontFamily={displayFont} fontSize={{ xs: 44, sm: 54 }} fontWeight={800} letterSpacing="-0.03em" lineHeight={1.05}>
            {candidate.mot}
          </Typography>
          <Stack direction="row" gap={0.4} justifyContent="center" mt={1.5} aria-label={`Fréquence ${candidate.frequence} sur 5`}>
            {Array.from({ length: 5 }, (_, index) => (
              <Box key={index} sx={{ width: 18, height: 5, borderRadius: 9, background: index < candidate.frequence ? tokens.cyan : 'rgba(49,39,78,0.1)' }} />
            ))}
          </Stack>
          <Box minHeight={64} mt={2.5}>
            <AnimatePresence mode="wait">
              {showTranslation ? (
                <MotionBox key="fr" initial={{ opacity: 0, y: 10, filter: 'blur(6px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0 }}>
                  <Typography fontSize={22} fontWeight={700} color={tokens.violetSoft}>{candidate.traduction ?? 'Traduction indisponible'}</Typography>
                </MotionBox>
              ) : (
                <MotionBox key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Typography fontSize={13.5} color="text.disabled" fontWeight={600}>Touche la carte pour voir la traduction</Typography>
                </MotionBox>
              )}
            </AnimatePresence>
          </Box>
        </Box>
      </Box>

      <Stack direction="row" justifyContent="space-between" color="text.disabled">
        <Typography fontSize={12} fontWeight={700}>← À apprendre</Typography>
        <Typography fontSize={12} fontWeight={700}>Je connais →</Typography>
      </Stack>
    </MotionBox>
  );
}

function stampSx(color: string, rotate: number, side: 'left' | 'right') {
  return {
    position: 'absolute', top: 28, [side]: 22, zIndex: 2, px: 1.5, py: 0.5, borderRadius: 2,
    border: `3px solid ${color}`, color, fontFamily: displayFont, fontWeight: 800, fontSize: 22, letterSpacing: '0.04em',
    transform: `rotate(${rotate}deg)`, background: `${color}1F`, pointerEvents: 'none',
  } as const;
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
        action={<IconButton aria-label="Rafraîchir la liste" onClick={() => void triage.refresh()} sx={{ color: 'text.secondary' }}><RefreshRounded /></IconButton>}
      />

      <Stack direction="row" gap={1.25} mb={2.5}>
        <Counter label="Connus" value={triage.knownCount} color={tokens.mint} />
        <Counter label="À apprendre" value={triage.focusCount} color={tokens.amber} />
        <Counter label="Restants" value={triage.candidates.length} />
      </Stack>

      <QueryState loading={triage.isLoading} error={triage.isError} offline={!online} onRetry={() => triage.refetch()} skeletons={1} />
      {triage.saveError ? <Alert severity="error" sx={{ mb: 2 }}>La dernière décision n’a pas pu être enregistrée, le mot est revenu dans la pile.</Alert> : null}

      {!triage.isLoading && !triage.isError && triage.candidates.length === 0 ? (
        <MotionBox initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} sx={{ textAlign: 'center', py: 6 }}>
          <Typography fontSize={64}>🧹</Typography>
          <Typography variant="h2" mt={1}>Pile vidée !</Typography>
          <Typography color="text.secondary" mt={0.5} mb={3}>Tous les mots chargés ont été classés.</Typography>
          <Button variant="contained" startIcon={<RefreshRounded />} onClick={() => void triage.refresh()}>Charger d’autres mots</Button>
        </MotionBox>
      ) : top ? (
        <>
          <Box position="relative" height={{ xs: 380, sm: 420 }} mx={0.5}>
            {deck.slice(1).reverse().map((candidate, reverseIndex) => {
              const depth = deck.length - 1 - reverseIndex; // 2 puis 1
              return (
                <MotionBox
                  key={candidate.id}
                  animate={{ scale: 1 - depth * 0.05, y: depth * 26, opacity: 1 - depth * 0.3 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                  sx={{ position: 'absolute', inset: 0, zIndex: 3 - depth, borderRadius: 7, background: tokens.surface, border: `1px solid ${tokens.border}` }}
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
          </Box>

          <Stack direction="row" justifyContent="center" alignItems="center" gap={3} mt={4}>
            <RoundAction label="À apprendre" color={tokens.amber} size={68} onClick={() => decide(top, 'focus')}><FlagRounded /></RoundAction>
            <RoundAction label="Écouter et voir la traduction" color={tokens.violetSoft} size={52} onClick={() => { speakEnglish(top.mot); if (!triage.visibleTranslations.has(top.id)) triage.toggleTranslation(top.id); }}>
              <VisibilityRounded />
            </RoundAction>
            <RoundAction label="Je connais" color={tokens.mint} size={68} onClick={() => decide(top, 'known')}><CheckRounded /></RoundAction>
          </Stack>
          <Typography textAlign="center" color="text.disabled" fontSize={12.5} mt={2}>
            « Je connais » retire le mot des révisions · « À apprendre » le garde en priorité
          </Typography>
        </>
      ) : null}
    </PageLayout>
  );
}

function Counter({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <Box flex={1} textAlign="center" py={1.25} borderRadius={4} sx={{ background: 'rgba(49,39,78,0.035)', border: `1px solid ${tokens.border}` }}>
      <Typography fontFamily={displayFont} fontWeight={800} fontSize={22} color={color}><AnimatedNumber value={value} duration={0.4} /></Typography>
      <Typography fontSize={11.5} color="text.secondary" fontWeight={700}>{label}</Typography>
    </Box>
  );
}

function RoundAction({ children, label, color, size, onClick }: { children: React.ReactNode; label: string; color: string; size: number; onClick: () => void }) {
  return (
    <Pressable onClick={onClick} aria-label={label} silent sx={{ width: size, height: size, borderRadius: '50%' }}>
      <Box
        sx={{
          width: size, height: size, borderRadius: '50%', display: 'grid', placeItems: 'center', color,
          background: `${color}1A`, border: `2px solid ${color}55`, boxShadow: `0 12px 30px -12px ${color}`,
          '& svg': { fontSize: size * 0.45 },
        }}
      >
        {children}
      </Box>
    </Pressable>
  );
}
