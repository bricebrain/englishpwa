import AutoGraphRounded from '@mui/icons-material/AutoGraphRounded';
import BoltRounded from '@mui/icons-material/BoltRounded';
import TodayRounded from '@mui/icons-material/TodayRounded';
import VerifiedRounded from '@mui/icons-material/VerifiedRounded';
import { Box, Card, CardContent, Chip, Grid, Stack, Typography } from '@mui/material';

import { PageHeader } from '@/components/common/PageHeader';
import { QueryState } from '@/components/common/QueryState';
import { WeekStrip } from '@/components/home/WeekStrip';
import { PageLayout } from '@/components/layout/PageLayout';
import { Flame } from '@/components/ui/Gamification';
import { AnimatedNumber, MotionBox, Stagger, StaggerItem } from '@/components/ui/motion';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { IconTile } from '@/components/ui/SessionChrome';
import { useStatistics } from '@/hooks/useLearningQueries';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useXp } from '@/hooks/useXp';
import { lastSevenDays } from '@/services/xpService';
import { displayFont, gradients, tokens } from '@/theme';

const dayLabels = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const shortDay = (date: Date) => ['D', 'L', 'M', 'M', 'J', 'V', 'S'][date.getDay()]!;

function Bars({ values, labels, gradient, highlightLast = true }: { values: number[]; labels: string[]; gradient: string; highlightLast?: boolean }) {
  const max = Math.max(1, ...values);
  return (
    <Stack direction="row" gap={1} alignItems="flex-end" height={150}>
      {values.map((value, index) => {
        const last = highlightLast && index === values.length - 1;
        return (
          <Stack key={`${labels[index]}-${index}`} flex={1} alignItems="center" justifyContent="flex-end" height="100%" gap={0.5}>
            <Typography fontSize={10.5} color={last ? 'text.primary' : 'text.secondary'} fontWeight={700}>{value}</Typography>
            <MotionBox
              initial={{ height: 0 }}
              animate={{ height: `${Math.max(4, value / max * 78)}%` }}
              transition={{ type: 'spring', stiffness: 120, damping: 16, delay: 0.2 + index * 0.06 }}
              sx={{
                width: '100%', maxWidth: 30, borderRadius: '10px 10px 4px 4px',
                background: last ? gradient : 'rgba(49,39,78,0.1)',
                boxShadow: last ? `0 0 20px -4px ${tokens.violet}` : 'none',
              }}
            />
            <Typography fontSize={11} fontWeight={800} color={last ? tokens.violetSoft : 'text.disabled'}>{labels[index]}</Typography>
          </Stack>
        );
      })}
    </Stack>
  );
}

export function StatisticsPage() {
  const online = useNetworkStatus();
  const query = useStatistics();
  const stats = query.data;
  const xp = useXp();
  const week = lastSevenDays(xp);

  return (
    <PageLayout>
      <PageHeader back eyebrow="Ton parcours" title="Progression" subtitle="Cadence, rétention et signaux pédagogiques" />

      <Card sx={{ mb: 2, overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', inset: 0, background: 'radial-gradient(80% 120% at 100% 0%, rgba(255,93,162,0.18), transparent 60%)', pointerEvents: 'none' }} />
        <CardContent sx={{ position: 'relative', p: { xs: 2.5, sm: 3 } }}>
          <Stack direction="row" alignItems="center" gap={2.5}>
            <ProgressRing value={xp.progress} size={112} stroke={11}>
              <Box textAlign="center">
                <Typography fontSize={11} color="text.secondary" fontWeight={800}>NIVEAU</Typography>
                <Typography fontFamily={displayFont} fontWeight={800} fontSize={40} lineHeight={1}>{xp.level}</Typography>
              </Box>
            </ProgressRing>
            <Box flex={1} minWidth={0}>
              <Typography fontFamily={displayFont} fontWeight={800} fontSize={28} className="text-gradient">
                <AnimatedNumber value={xp.totalXp} /> XP
              </Typography>
              <Typography color="text.secondary" fontSize={13.5}>
                Encore {xp.levelSize - xp.intoLevel} XP avant le niveau {xp.level + 1}
              </Typography>
              <Stack direction="row" gap={1} mt={1.25} flexWrap="wrap" useFlexGap>
                <Chip size="small" icon={<BoltRounded sx={{ color: `${tokens.amber} !important` }} />} label={`${xp.todayXp} XP aujourd’hui`} />
                <Chip size="small" label={`Meilleur combo ×${xp.bestCombo}`} />
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <QueryState loading={query.isLoading} error={query.isError} offline={!online} onRetry={() => query.refetch()} />
      {stats ? (
        <Stagger gap={0.06}>
          <Grid container spacing={1.5}>
            {[
              { label: 'Jours de suite', value: stats.streak, icon: <Flame size={22} />, gradient: gradients.sunrise, color: tokens.amber },
              { label: 'Aujourd’hui', value: stats.reviewedToday, icon: <TodayRounded />, gradient: gradients.ocean, color: tokens.cyan },
              { label: 'Mots appris', value: stats.learnedCount, icon: <VerifiedRounded />, gradient: gradients.mint, color: tokens.mint },
              { label: 'Rétention', value: stats.retentionRate, suffix: '%', icon: <AutoGraphRounded />, gradient: gradients.primary, color: tokens.violetSoft },
            ].map(({ label, value, suffix, icon, gradient, color }) => (
              <Grid item xs={6} md={3} key={label}>
                <StaggerItem sx={{ height: '100%' }}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <IconTile icon={icon} gradient={gradient} size={38} radius={12} />
                      <Typography fontFamily={displayFont} fontSize={{ xs: 28, sm: 32 }} fontWeight={800} color={color} mt={1.25} lineHeight={1.1}>
                        <AnimatedNumber value={value} suffix={suffix} />
                      </Typography>
                      <Typography color="text.secondary" fontSize={12.5} fontWeight={600}>{label}</Typography>
                    </CardContent>
                  </Card>
                </StaggerItem>
              </Grid>
            ))}

            <Grid item xs={12} md={6}>
              <StaggerItem sx={{ height: '100%' }}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h3" mb={2}>Révisions de la semaine</Typography>
                    <WeekStrip activeDays={stats.activeDays} />
                    <Box mt={3}><Bars values={stats.weeklyReviews} labels={dayLabels} gradient={gradients.primary} /></Box>
                  </CardContent>
                </Card>
              </StaggerItem>
            </Grid>

            <Grid item xs={12} md={6}>
              <StaggerItem sx={{ height: '100%' }}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="baseline" mb={2}>
                      <Typography variant="h3">XP sur 7 jours</Typography>
                      <Typography fontSize={13} color="text.secondary">sur cet appareil</Typography>
                    </Stack>
                    <Bars values={week.map((day) => day.xp)} labels={week.map((day) => shortDay(day.date))} gradient={gradients.sunrise} />
                  </CardContent>
                </Card>
              </StaggerItem>
            </Grid>

            <Grid item xs={12} md={6}>
              <StaggerItem>
                <Card>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" mb={1.25}>
                      <Typography variant="h3">Vocabulaire maîtrisé</Typography>
                      <Typography fontWeight={800} className="text-gradient">{stats.learnedCount}/{stats.totalCount}</Typography>
                    </Stack>
                    <Box sx={{ height: 12, borderRadius: 9, background: 'rgba(49,39,78,0.08)', overflow: 'hidden' }}>
                      <MotionBox
                        initial={{ width: 0 }}
                        animate={{ width: `${stats.learnedCount / Math.max(1, stats.totalCount) * 100}%` }}
                        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                        sx={{ height: '100%', borderRadius: 9, background: gradients.primary }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </StaggerItem>
            </Grid>

            <Grid item xs={12} md={6}>
              <StaggerItem>
                <Card>
                  <CardContent>
                    <Typography variant="h3" mb={1.5}>Diagnostic</Typography>
                    <Typography variant="overline" color={tokens.mint} display="block" mb={0.75}>Points forts</Typography>
                    <Stack direction="row" gap={1} flexWrap="wrap" useFlexGap>
                      {stats.strengths.map((item) => <Chip key={item} label={item} sx={{ background: 'rgba(52,229,160,0.12)', color: tokens.mint }} />)}
                    </Stack>
                    <Typography variant="overline" color={tokens.amber} display="block" mt={2} mb={0.75}>À renforcer</Typography>
                    <Stack direction="row" gap={1} flexWrap="wrap" useFlexGap>
                      {stats.focusAreas.map((item) => <Chip key={item} label={item} sx={{ background: 'rgba(255,181,71,0.12)', color: tokens.amber }} />)}
                    </Stack>
                  </CardContent>
                </Card>
              </StaggerItem>
            </Grid>
          </Grid>
        </Stagger>
      ) : null}
    </PageLayout>
  );
}
