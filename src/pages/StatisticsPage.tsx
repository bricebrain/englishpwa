import { Alert, Box, Button, CircularProgress, Grid, LinearProgress, Paper, Stack, Typography } from '@mui/material';

import { PageHeader } from '@/components/common/PageHeader';
import { PageLayout } from '@/components/layout/PageLayout';
import { CompetencyOverview } from '@/components/pedagogy/CompetencyOverview';
import { PedagogyTheme } from '@/components/pedagogy/PedagogyTheme';
import { LearningSummary } from '@/components/pedagogy/LearningSummary';
import { getPedagogyProgress } from '@/helpers/pedagogyProgress';
import { useLearningTracking } from '@/hooks/useLearningTracking';
import { useStatistics } from '@/hooks/useLearningQueries';
import { usePreferences } from '@/hooks/usePreferences';
import { useXp } from '@/hooks/useXp';

export function StatisticsPage() {
  const { preferences } = usePreferences();
  const query = useStatistics();
  const tracking = useLearningTracking(preferences.profile.id);
  const stats = query.data;
  const xp = useXp();
  return <PedagogyTheme><PageLayout>
    <PageHeader back eyebrow="Ton parcours" title="Progression" subtitle="Activité, observations et réutilisations différées" />
    <Stack spacing={2.5} sx={{ mt: 2 }}>
      {query.isPending && <Box role="status" aria-label="Chargement des compteurs"><CircularProgress size={28} /></Box>}
      {query.isError && <Alert severity="error" action={<Button onClick={() => query.refetch()}>Réessayer</Button>}>Les compteurs serveur sont indisponibles.</Alert>}
      {stats && <>
        {stats.demo && <Alert severity="info">Mode démonstration : les compteurs ci-dessous sont des exemples. Le suivi local reste distinct.</Alert>}
        <Typography variant="h6" component="h2">{stats.demo ? 'Exemples de compteurs' : 'Compteurs transmis par le serveur'}</Typography>
        <Grid container spacing={2}>
          {[
            ['Révisions aujourd’hui', stats.reviewedToday], ['Mots classés connus', stats.learnedCount],
            ['Mots dans le catalogue', stats.totalCount], ['Révisions en attente', stats.dueCount],
          ].map(([label, value]) => <Grid item xs={6} md={3} key={label}>
            <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
              <Typography variant="h5">{value}</Typography><Typography variant="body2">{label}</Typography>
            </Paper>
          </Grid>)}
        </Grid>
        <Typography variant="caption" color="text.secondary">Le statut historique « connu » peut venir d’une déclaration ou d’une révision. Il ne certifie pas la production autonome. Les compteurs absents de l’API valent zéro.</Typography>
      </>}
      {tracking.query.isPending && <CircularProgress size={28} aria-label="Chargement du suivi pédagogique" />}
      {tracking.query.isError && <Alert severity="error" action={<Button onClick={() => tracking.query.refetch()}>Réessayer</Button>}>Le suivi local est illisible ou indisponible. Les données existantes ont été conservées.</Alert>}
      {tracking.query.data && <>
        <LearningSummary profile={tracking.query.data} />
        <Typography variant="h6" component="h2">Constructions et transferts différés</Typography>
        <CompetencyOverview progress={getPedagogyProgress(tracking.query.data)} />
      </>}
      <Paper variant="outlined" sx={{ p: 2.5 }}>
        <Stack spacing={1.5}>
          <Typography variant="h6" component="h2">Motivation · niveau {xp.level}</Typography>
          <Typography>{xp.totalXp} XP · {xp.todayXp} XP aujourd’hui · meilleur combo ×{xp.bestCombo}</Typography>
          <LinearProgress aria-label="Progression XP" variant="determinate" value={xp.progress * 100} />
          <Typography variant="caption" color="text.secondary">XP enregistrés sur cet appareil. Ce niveau de jeu ne correspond pas à un niveau CECRL.</Typography>
        </Stack>
      </Paper>
    </Stack>
  </PageLayout></PedagogyTheme>;
}
