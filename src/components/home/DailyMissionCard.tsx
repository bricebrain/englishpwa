import AutoStoriesRounded from '@mui/icons-material/AutoStoriesRounded';
import CheckRounded from '@mui/icons-material/CheckRounded';
import ChevronRightRounded from '@mui/icons-material/ChevronRightRounded';
import ConstructionRounded from '@mui/icons-material/ConstructionRounded';
import ForumRounded from '@mui/icons-material/ForumRounded';
import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { MotionBox, Pressable } from '@/components/ui/motion';
import { gradients, tokens } from '@/theme';

interface DailyMissionCardProps {
  reviewedToday: number;
  dueCount: number;
}

const steps = [
  { label: 'Mots à renforcer', path: '/lingvist', icon: AutoStoriesRounded, minutes: 7 },
  { label: 'Construire une phrase utile', path: '/phrases', icon: ConstructionRounded, minutes: 5 },
  { label: 'Préparer une séance Live', path: '/live', icon: ForumRounded, minutes: 3 },
];

/** Parcours du jour façon « chemin » : étapes reliées, l'étape active pulse. */
export function DailyMissionCard({ reviewedToday, dueCount }: DailyMissionCardProps) {
  const navigate = useNavigate();
  const wordsDone = reviewedToday >= 10;

  return (
    <Card>
      <CardContent sx={{ p: { xs: 2.25, sm: 3 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="baseline" mb={2}>
          <Box>
            <Typography variant="overline" color={tokens.violetSoft}>Mission du jour · 15 min</Typography>
            <Typography variant="h2">{wordsDone ? 'Plus que 2 étapes' : '3 étapes aujourd’hui'}</Typography>
          </Box>
        </Stack>

        <Box position="relative">
          <Box sx={{ position: 'absolute', left: 25, top: 30, bottom: 30, width: 3, borderRadius: 3, background: 'rgba(255,255,255,0.08)' }} />
          <MotionBox
            initial={{ height: 0 }}
            animate={{ height: wordsDone ? '50%' : '0%' }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
            sx={{ position: 'absolute', left: 25, top: 30, width: 3, borderRadius: 3, background: gradients.mint }}
          />
          <Stack gap={1}>
            {steps.map(({ label, path, icon: Icon, minutes }, index) => {
              const done = index === 0 && wordsDone;
              const active = index === 0 ? !wordsDone : index === 1 && wordsDone;
              return (
                <Pressable key={path} onClick={() => navigate(path)} aria-label={label}>
                  <Stack
                    direction="row" alignItems="center" gap={1.75} p={0.5} pr={1.25} borderRadius={4}
                    sx={{ background: active ? 'rgba(139,108,255,0.1)' : 'transparent', border: `1px solid ${active ? 'rgba(139,108,255,0.3)' : 'transparent'}` }}
                  >
                    <Box position="relative" sx={{ width: 46, height: 46, flexShrink: 0 }}>
                      {active ? (
                        <MotionBox
                          animate={{ scale: [1, 1.35], opacity: [0.6, 0] }}
                          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
                          sx={{ position: 'absolute', inset: 0, borderRadius: '50%', background: tokens.violet }}
                        />
                      ) : null}
                      <Box
                        sx={{
                          position: 'relative', width: 46, height: 46, borderRadius: '50%', display: 'grid', placeItems: 'center',
                          background: done ? gradients.mint : active ? gradients.primary : tokens.surfaceHigh,
                          color: done ? '#06140E' : active ? '#fff' : tokens.textMuted,
                          boxShadow: active ? `0 8px 24px -8px ${tokens.violet}` : 'none',
                          border: done || active ? 0 : `1px solid ${tokens.border}`,
                        }}
                      >
                        {done ? <CheckRounded /> : <Icon sx={{ fontSize: 22 }} />}
                      </Box>
                    </Box>
                    <Box flex={1} minWidth={0}>
                      <Typography fontWeight={750} sx={{ opacity: done ? 0.55 : 1, textDecoration: done ? 'line-through' : 'none' }}>
                        {index === 0 ? `${Math.max(dueCount, 10)} mots à renforcer` : label}
                      </Typography>
                      <Typography fontSize={12} fontWeight={700} color={active ? tokens.amber : 'text.disabled'}>{done ? 'Terminé' : `≈ ${minutes} min`}</Typography>
                    </Box>
                    <ChevronRightRounded sx={{ color: active ? tokens.violetSoft : tokens.textFaint }} />
                  </Stack>
                </Pressable>
              );
            })}
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}
