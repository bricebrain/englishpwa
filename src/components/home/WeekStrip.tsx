import { Box, Stack, Typography } from '@mui/material';

import { Flame } from '@/components/ui/Gamification';
import { MotionBox } from '@/components/ui/motion';
import { tokens } from '@/theme';

const LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export function WeekStrip({ activeDays }: { activeDays: boolean[] }) {
  const todayIndex = (new Date().getDay() + 6) % 7;

  return (
    <Stack direction="row" justifyContent="space-between" aria-label="Activité des sept derniers jours">
      {LABELS.map((label, index) => {
        const active = activeDays[index];
        const today = index === todayIndex;
        return (
          <Stack key={`${label}-${index}`} alignItems="center" gap={0.75}>
            <Typography fontSize={11.5} fontWeight={800} color={today ? tokens.violetSoft : 'text.disabled'}>{label}</Typography>
            <MotionBox
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20, delay: 0.1 + index * 0.05 }}
              sx={{
                width: 36, height: 36, borderRadius: '12px', display: 'grid', placeItems: 'center',
                background: active ? 'rgba(255,122,89,0.14)' : 'rgba(255,255,255,0.04)',
                border: today ? `2px solid ${tokens.violet}` : `1px solid ${active ? 'rgba(255,122,89,0.3)' : tokens.border}`,
              }}
            >
              {active ? <Flame size={20} animated={today} /> : <Box sx={{ width: 6, height: 6, borderRadius: 9, background: tokens.textFaint }} />}
            </MotionBox>
          </Stack>
        );
      })}
    </Stack>
  );
}
