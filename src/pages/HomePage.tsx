import AutoStoriesRounded from '@mui/icons-material/AutoStoriesRounded';
import BoltRounded from '@mui/icons-material/BoltRounded';
import ChevronRightRounded from '@mui/icons-material/ChevronRightRounded';
import ConstructionRounded from '@mui/icons-material/ConstructionRounded';
import HeadphonesRounded from '@mui/icons-material/HeadphonesRounded';
import LayersRounded from '@mui/icons-material/LayersRounded';
import MenuBookRounded from '@mui/icons-material/MenuBookRounded';
import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded';
import SwipeRounded from '@mui/icons-material/SwipeRounded';
import { Box, Card, CardContent, Grid, Stack, Typography } from '@mui/material';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { QueryState } from '@/components/common/QueryState';
import { DailyMissionCard } from '@/components/home/DailyMissionCard';
import { WeekStrip } from '@/components/home/WeekStrip';
import { PageLayout } from '@/components/layout/PageLayout';
import { LevelBadge, StreakBadge } from '@/components/ui/Gamification';
import { AnimatedNumber, MotionBox, Pressable, Stagger, StaggerItem } from '@/components/ui/motion';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { useDashboard } from '@/hooks/useLearningQueries';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { usePreferences } from '@/hooks/usePreferences';
import { useXp } from '@/hooks/useXp';
import { displayFont, gradients, tokens } from '@/theme';

const shortcuts = [
  { title: 'Lingvist', subtitle: 'Rappel actif', path: '/lingvist', icon: AutoStoriesRounded, gradient: gradients.primary },
  { title: 'Flashcards', subtitle: 'Cartes à retourner', path: '/flashcards', icon: LayersRounded, gradient: gradients.ocean },
  { title: 'Phrases', subtitle: 'Construire en anglais', path: '/phrases', icon: ConstructionRounded, gradient: gradients.sunrise },
  { title: 'Tri éclair', subtitle: 'Swipe tes mots', path: '/lingvist-triage', icon: SwipeRounded, gradient: gradients.mint },
  { title: 'Écouter', subtitle: 'Assimil & audios', path: '/ecouter', icon: HeadphonesRounded, gradient: `linear-gradient(135deg, ${tokens.cyan}, ${tokens.mint})` },
  { title: 'Lire', subtitle: 'Articles & séries', path: '/lire', icon: MenuBookRounded, gradient: `linear-gradient(135deg, ${tokens.pink}, ${tokens.violet})` },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 5) return 'Encore debout';
  if (hour < 12) return 'Bonjour';
  if (hour < 18) return 'Bon après-midi';
  return 'Bonsoir';
}

function motivation(ratio: number) {
  if (ratio >= 1) return 'Objectif atteint. Tu es en feu !';
  if (ratio >= 0.6) return 'Tu y es presque, finis en beauté.';
  if (ratio > 0) return 'Bien lancé, garde le rythme.';
  return 'Quelques minutes suffisent pour démarrer.';
}

export function HomePage() {
  const navigate = useNavigate();
  const online = useNetworkStatus();
  const { preferences } = usePreferences();
  const dashboard = useDashboard();
  const xp = useXp();
  const firstName = useMemo(() => preferences.profile.name.split(' ')[0] || 'Apprenant', [preferences.profile.name]);
  const data = dashboard.data;
  const goal = preferences.profile.dailyGoal;
  const ratio = data ? Math.min(1, data.reviewedToday / goal) : 0;
  const nextPath = data && data.reviewedToday >= 10 ? '/phrases' : '/lingvist';

  return (
    <PageLayout>
      <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1} mb={3}>
        <Stack direction="row" alignItems="center" gap={1.5} minWidth={0}>
          <Pressable onClick={() => navigate('/profile')} aria-label="Ouvrir le profil" sx={{ width: 'auto', borderRadius: '50%' }}>
            <Box sx={{ p: '2.5px', borderRadius: '50%', background: gradients.primary }}>
              <Box sx={{ width: 42, height: 42, borderRadius: '50%', display: 'grid', placeItems: 'center', background: tokens.surface, fontFamily: displayFont, fontWeight: 800, fontSize: 18 }}>
                {firstName.charAt(0).toUpperCase()}
              </Box>
            </Box>
          </Pressable>
          <Box minWidth={0}>
            <Typography fontSize={13} color="text.secondary" fontWeight={600}>{getGreeting()},</Typography>
            <Typography component="h1" fontFamily={displayFont} fontWeight={800} fontSize={22} lineHeight={1.1} noWrap>{firstName} 👋</Typography>
          </Box>
        </Stack>
        <Stack direction="row" alignItems="center" gap={0.75}>
          {data ? <StreakBadge days={data.streak} /> : null}
          <Pressable onClick={() => navigate('/statistics')} aria-label="Voir la progression" sx={{ width: 'auto' }}>
            <LevelBadge compact />
          </Pressable>
        </Stack>
      </Stack>

      <QueryState loading={dashboard.isLoading} error={dashboard.isError} offline={!online} onRetry={() => dashboard.refetch()} />

      {data ? (
        <Stagger gap={0.08}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <StaggerItem sx={{ height: '100%' }}>
                <Card sx={{ height: '100%', overflow: 'hidden' }}>
                  <Box sx={{ position: 'absolute', top: -80, right: -60, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,108,255,0.35), transparent 70%)', pointerEvents: 'none' }} />
                  <CardContent sx={{ p: { xs: 2.5, sm: 3 }, position: 'relative' }}>
                    <Typography variant="overline" color={tokens.violetSoft}>Objectif du jour</Typography>
                    <Stack direction="row" alignItems="center" gap={2.5} mt={1}>
                      <ProgressRing value={ratio} size={128} stroke={13}>
                        <Box textAlign="center">
                          <Typography fontFamily={displayFont} fontWeight={800} fontSize={36} lineHeight={1}>
                            <AnimatedNumber value={data.reviewedToday} />
                          </Typography>
                          <Typography fontSize={12} color="text.secondary" fontWeight={700}>/ {goal} mots</Typography>
                        </Box>
                      </ProgressRing>
                      <Box flex={1} minWidth={0}>
                        <Typography fontFamily={displayFont} fontWeight={750} fontSize={19} lineHeight={1.25}>{motivation(ratio)}</Typography>
                        <Stack direction="row" alignItems="center" gap={0.5} mt={1.25}>
                          <BoltRounded sx={{ fontSize: 18, color: tokens.amber }} />
                          <Typography fontWeight={800} color={tokens.amber}><AnimatedNumber value={xp.todayXp} /> XP</Typography>
                          <Typography color="text.secondary" fontSize={13}>aujourd’hui</Typography>
                        </Stack>
                        <Typography color="text.secondary" fontSize={13} mt={0.25}>{data.dueCount} mots t’attendent</Typography>
                      </Box>
                    </Stack>

                    <MotionBox
                      mt={2.5}
                      animate={{ boxShadow: [`0 0 0 0 rgba(139,108,255,0.55)`, `0 0 0 14px rgba(139,108,255,0)`] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                      sx={{ borderRadius: 4 }}
                    >
                      <Pressable onClick={() => navigate(nextPath)} aria-label="Lancer la session">
                        <Stack
                          direction="row" alignItems="center" justifyContent="center" gap={1}
                          sx={{ height: 56, borderRadius: 4, background: gradients.primary, color: '#fff', fontWeight: 800, fontSize: 17, boxShadow: `0 14px 30px -12px ${tokens.violet}` }}
                        >
                          <PlayArrowRounded />
                          {ratio > 0 ? 'Continuer ma session' : 'Commencer ma session'}
                        </Stack>
                      </Pressable>
                    </MotionBox>
                  </CardContent>
                </Card>
              </StaggerItem>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Stack gap={2} height="100%">
                <StaggerItem>
                  <DailyMissionCard reviewedToday={data.reviewedToday} dueCount={data.dueCount} />
                </StaggerItem>
              </Stack>
            </Grid>

            <Grid item xs={12}>
              <StaggerItem>
                <Card>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="baseline" mb={1.75}>
                      <Typography variant="h3">Ta semaine</Typography>
                      <Typography fontSize={13} fontWeight={700} color={tokens.amber}>{data.streak} jour{data.streak > 1 ? 's' : ''} de suite</Typography>
                    </Stack>
                    <WeekStrip activeDays={data.activeDays} />
                  </CardContent>
                </Card>
              </StaggerItem>
            </Grid>

            <Grid item xs={12}>
              <StaggerItem>
                <Typography variant="h3" mb={1.25} mt={0.5}>Explorer</Typography>
                <Grid container spacing={1.25}>
                  {shortcuts.map(({ title, subtitle, path, icon: Icon, gradient }, index) => (
                    <Grid item xs={6} sm={4} key={path}>
                      <MotionBox
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 24, delay: 0.25 + index * 0.05 }}
                      >
                        <Pressable onClick={() => navigate(path)} aria-label={title}>
                          <Box
                            sx={{
                              position: 'relative', overflow: 'hidden', minHeight: 118, p: 1.75, borderRadius: 5,
                              background: tokens.surface, border: `1px solid ${tokens.border}`,
                            }}
                          >
                            <Box sx={{ position: 'absolute', top: -30, right: -30, width: 110, height: 110, borderRadius: '50%', background: gradient, opacity: 0.22, filter: 'blur(18px)' }} />
                            <Box sx={{ position: 'relative', width: 42, height: 42, borderRadius: '14px', display: 'grid', placeItems: 'center', background: gradient, color: '#fff', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35)' }}>
                              <Icon sx={{ fontSize: 22 }} />
                            </Box>
                            <Typography position="relative" fontWeight={800} mt={1.5}>{title}</Typography>
                            <Typography position="relative" color="text.secondary" fontSize={12}>{subtitle}</Typography>
                          </Box>
                        </Pressable>
                      </MotionBox>
                    </Grid>
                  ))}
                </Grid>
              </StaggerItem>
            </Grid>

            <Grid item xs={12}>
              <StaggerItem>
                <Pressable onClick={() => navigate('/statistics')} aria-label="Voir la progression">
                  <Card>
                    <CardContent>
                      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
                        <Box>
                          <Typography variant="h3">Vocabulaire maîtrisé</Typography>
                          <Typography color="text.secondary" fontSize={13}>
                            <AnimatedNumber value={data.learnedCount} /> / {(data.totalCount ?? 0).toLocaleString('fr-FR')} mots
                          </Typography>
                        </Box>
                        <Stack direction="row" alignItems="center">
                          <Typography fontFamily={displayFont} fontWeight={800} fontSize={24} className="text-gradient">
                            <AnimatedNumber value={Math.round(data.learnedCount / Math.max(1, data.totalCount) * 100)} suffix="%" />
                          </Typography>
                          <ChevronRightRounded sx={{ color: tokens.textFaint }} />
                        </Stack>
                      </Stack>
                      <Box sx={{ height: 10, borderRadius: 9, background: 'rgba(49,39,78,0.08)', overflow: 'hidden' }}>
                        <MotionBox
                          initial={{ width: 0 }}
                          animate={{ width: `${data.learnedCount / Math.max(1, data.totalCount) * 100}%` }}
                          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
                          sx={{ height: '100%', borderRadius: 9, background: gradients.primary }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Pressable>
              </StaggerItem>
            </Grid>
          </Grid>
        </Stagger>
      ) : null}
    </PageLayout>
  );
}
