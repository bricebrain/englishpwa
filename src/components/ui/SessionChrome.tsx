import CloseRounded from '@mui/icons-material/CloseRounded';
import ReplayRounded from '@mui/icons-material/ReplayRounded';
import { Box, Button, IconButton, Stack, Typography } from '@mui/material';
import { useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

import { ComboBadge } from '@/components/ui/Gamification';
import { AnimatedNumber, MotionBox } from '@/components/ui/motion';
import { softSpring } from '@/components/ui/springs';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { celebrate, feedback } from '@/services/feedbackService';
import { displayFont, gradients, tokens } from '@/theme';

/** Barre supérieure des sessions d'entraînement : fermer, progression animée, combo. */
export function SessionHeader({ progress, combo = 0, label, onClose, action }: {
  progress: number;
  combo?: number;
  label?: string;
  onClose?: () => void;
  action?: ReactNode;
}) {
  const navigate = useNavigate();
  return (
    <Stack direction="row" alignItems="center" gap={1.25} mb={2.5}>
      <IconButton aria-label="Quitter la session" onClick={onClose ?? (() => navigate(-1))} sx={{ ml: -1, color: 'text.secondary' }}>
        <CloseRounded />
      </IconButton>
      <Box flex={1} position="relative" height={14} borderRadius={99} sx={{ background: 'rgba(49,39,78,0.08)', overflow: 'hidden' }}>
        <MotionBox
          initial={false}
          animate={{ width: `${Math.max(4, Math.min(100, progress * 100))}%` }}
          transition={softSpring}
          sx={{ position: 'absolute', inset: 0, right: 'auto', borderRadius: 99, background: gradients.mint, boxShadow: `0 0 16px ${tokens.mint}` }}
        >
          <Box sx={{ position: 'absolute', top: 3, left: 8, right: 8, height: 3, borderRadius: 9, background: 'rgba(255,255,255,0.45)' }} />
        </MotionBox>
      </Box>
      {label ? <Typography fontSize={13} fontWeight={800} color="text.secondary" sx={{ fontVariantNumeric: 'tabular-nums' }}>{label}</Typography> : null}
      <ComboBadge combo={combo} />
      {action}
    </Stack>
  );
}

export type ResultTone = 'success' | 'almost' | 'error' | 'neutral';

const RESULT_STYLES: Record<ResultTone, { color: string; background: string; border: string }> = {
  success: { color: tokens.mint, background: 'rgba(52,229,160,0.1)', border: 'rgba(52,229,160,0.35)' },
  almost: { color: tokens.amber, background: 'rgba(255,181,71,0.1)', border: 'rgba(255,181,71,0.35)' },
  error: { color: tokens.red, background: 'rgba(255,84,112,0.1)', border: 'rgba(255,84,112,0.35)' },
  neutral: { color: tokens.violetSoft, background: 'rgba(139,108,255,0.1)', border: 'rgba(139,108,255,0.35)' },
};

/** Panneau de résultat qui « monte » avec un petit rebond, coloré selon la réussite. */
export function ResultPanel({ tone, title, icon, children }: { tone: ResultTone; title: string; icon?: ReactNode; children?: ReactNode }) {
  const style = RESULT_STYLES[tone];
  return (
    <MotionBox
      initial={{ y: 30, opacity: 0, scale: 0.97 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 380, damping: 24 }}
      sx={{ borderRadius: 5, p: 2, background: style.background, border: `1.5px solid ${style.border}` }}
    >
      <Stack direction="row" alignItems="center" gap={1.25}>
        {icon ? (
          <MotionBox
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 15, delay: 0.08 }}
            sx={{ width: 38, height: 38, borderRadius: '50%', display: 'grid', placeItems: 'center', background: style.color, color: '#0B0A12', flexShrink: 0 }}
          >
            {icon}
          </MotionBox>
        ) : null}
        <Typography fontFamily={displayFont} fontWeight={800} fontSize={21} color={style.color}>{title}</Typography>
      </Stack>
      {children ? <Box mt={1.25}>{children}</Box> : null}
    </MotionBox>
  );
}

/** Écran de fin de session : anneau de score, compteurs animés, confettis. */
export function CelebrationCard({ title, subtitle, score, stats, onRestart, restartLabel = 'Nouvelle session' }: {
  title: string;
  subtitle?: string;
  score: number; // 0 → 1
  stats: { label: string; value: number; suffix?: string; color?: string }[];
  onRestart?: () => void;
  restartLabel?: string;
}) {
  const navigate = useNavigate();

  useEffect(() => {
    feedback('complete');
    void celebrate(score >= 0.6 ? 'big' : 'small');
  }, [score]);

  return (
    <MotionBox
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={softSpring}
      sx={{ maxWidth: 560, mx: 'auto', textAlign: 'center', pt: { xs: 3, sm: 6 } }}
    >
      <Box display="flex" justifyContent="center">
        <ProgressRing value={score} size={168} stroke={14} colors={[tokens.lime, tokens.mint]}>
          <Box>
            <Typography fontFamily={displayFont} fontWeight={800} fontSize={44} lineHeight={1}>
              <AnimatedNumber value={Math.round(score * 100)} suffix="%" />
            </Typography>
            <Typography fontSize={12} color="text.secondary" fontWeight={700}>réussite</Typography>
          </Box>
        </ProgressRing>
      </Box>
      <Typography variant="h1" mt={3}>{title}</Typography>
      {subtitle ? <Typography color="text.secondary" mt={1}>{subtitle}</Typography> : null}

      <Stack direction="row" gap={1.25} mt={3.5} justifyContent="center">
        {stats.map((stat, index) => (
          <MotionBox
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...softSpring, delay: 0.35 + index * 0.08 }}
            sx={{ flex: 1, maxWidth: 160, py: 2, borderRadius: 4, background: 'rgba(49,39,78,0.045)', border: `1px solid ${tokens.border}` }}
          >
            <Typography fontFamily={displayFont} fontWeight={800} fontSize={28} color={stat.color ?? 'text.primary'}>
              <AnimatedNumber value={stat.value} suffix={stat.suffix} />
            </Typography>
            <Typography fontSize={12} color="text.secondary" fontWeight={700}>{stat.label}</Typography>
          </MotionBox>
        ))}
      </Stack>

      <Stack gap={1.25} mt={4}>
        {onRestart ? (
          <Button size="large" variant="contained" startIcon={<ReplayRounded />} onClick={onRestart}>{restartLabel}</Button>
        ) : null}
        <Button size="large" variant="outlined" onClick={() => navigate('/')}>Retour à l’accueil</Button>
      </Stack>
    </MotionBox>
  );
}

/** Pastille d'icône colorée en dégradé. */
export function IconTile({ icon, gradient = gradients.primary, size = 44, radius = 14 }: { icon: ReactNode; gradient?: string; size?: number; radius?: number }) {
  return (
    <Box
      sx={{
        width: size, height: size, borderRadius: `${radius}px`, display: 'grid', placeItems: 'center', flexShrink: 0,
        background: gradient, color: '#fff', boxShadow: '0 8px 20px -10px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.3)',
        '& svg': { fontSize: size * 0.5 },
      }}
    >
      {icon}
    </Box>
  );
}
