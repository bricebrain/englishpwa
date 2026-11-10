import { Alert, Box, Button, CircularProgress, LinearProgress, Paper, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

import { constructions } from '@/constants/pedagogy/constructions';
import { PageHeader } from '@/components/common/PageHeader';
import { PageLayout } from '@/components/layout/PageLayout';
import { CompetencyOverview } from '@/components/pedagogy/CompetencyOverview';
import { LabExerciseCard } from '@/components/pedagogy/LabExerciseCard';
import { PedagogyTheme } from '@/components/pedagogy/PedagogyTheme';
import { usePreferences } from '@/hooks/usePreferences';
import { useSentenceLab } from '@/hooks/useSentenceLab';

function SentenceLabContent({ profileId }: { profileId: string }) {
  const lab = useSentenceLab(profileId);
  const { session, exercise, query } = lab;
  return <PageLayout reading>
    <PageHeader title="Sentence Lab" subtitle="Comprendre, manipuler et réutiliser une construction." back />
    <Stack spacing={2.5} sx={{ mt: 2 }}>
      {query.isPending ? <Box role="status" aria-label="Chargement du suivi"><CircularProgress size={28} /></Box>
        : query.isError ? <Alert severity="error" action={<Button color="inherit" onClick={() => query.refetch()}>Réessayer</Button>}>
          Le suivi pédagogique local est indisponible ou illisible. Les données existantes sont conservées.
        </Alert> : !session ? <>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Typography component="h2" variant="h6">De la lecture à ta propre phrase</Typography>
              <Typography>Un objectif commun, une lecture courte, des transformations et une phrase personnelle. Le parcours choisit une construction à découvrir ou à réviser.</Typography>
              <Typography variant="body2" color="text.secondary">Catalogue A2–B1 indicatif · {constructions.length} constructions · contenus à relire pédagogiquement · environ 8–10 min. La maîtrise demande des réutilisations sans aide après plusieurs jours.</Typography>
              <Button variant="contained" size="large" onClick={() => lab.start()}>Commencer mon parcours</Button>
              <Button variant="outlined" onClick={() => lab.start('mixed')}>Production mélangée sans modèle</Button>
              <Typography variant="body2">Le mode mélangé combine trois objectifs sans annoncer la structure attendue. Il enregistre une production guidée par la consigne, sans certifier à lui seul un transfert différé.</Typography>
            </Stack>
          </Paper>
          <CompetencyOverview progress={lab.progress} />
        </> : lab.completed ? <>
          <Alert severity="success">Parcours terminé. Les preuves de cette séance ont été enregistrées.</Alert>
          <Typography component="h2" variant="h6">{session.mixed ? 'Production mélangée' : session.construction.objective}</Typography>
          <Typography>
            {lab.sessionEvidence.filter((item) => item.evaluation.outcome === 'correct').length} activité(s) validée(s),{' '}
            {lab.sessionEvidence.filter((item) => item.evaluation.outcome === 'uncertain').length} réponse(s) à vérifier.
            Une réussite immédiate ne suffit pas à confirmer l’autonomie.
          </Typography>
          <Typography variant="body2">Les erreurs certaines et les aides utilisées orienteront les prochaines révisions.</Typography>
          <CompetencyOverview progress={lab.progress} />
          <Button variant="contained" onClick={() => lab.start()}>Poursuivre avec un nouveau parcours</Button>
          <Button component={Link} to="/">Retour à l’accueil</Button>
        </> : exercise ? <>
          <Typography variant="subtitle1">{session.mixed ? 'Choisis toi-même la structure adaptée à la situation.' : `Objectif : ${session.construction.objective}`}</Typography>
          <Typography variant="body2" color="text.secondary">Étape {lab.index + 1} / {session.exercises.length}</Typography>
          <LinearProgress variant="determinate" value={100 * lab.index / session.exercises.length} aria-label="Progression du parcours" />
          {exercise.kind === 'comprehension' && <Alert severity="info">
            <Typography fontWeight={600}>{session.construction.pattern}</Typography>
            {session.construction.description}
          </Alert>}
          <LabExerciseCard
            exercise={exercise} context={lab.context!} answer={lab.answer}
            result={lab.result?.evaluation ?? null} hintVisible={lab.hintVisible} canShowHint={lab.canShowHint}
            isSaving={lab.isSaving} saveError={lab.saveError} answerLocked={lab.answerLocked}
            onAnswer={lab.setAnswer} onHint={lab.revealHint} onValidate={() => void lab.validate()} onNext={lab.next}
          />
        </> : null}
      <Typography variant="caption" color="text.secondary">
        Suivi enregistré uniquement dans ce navigateur, pour le profil actif. Les niveaux sont indicatifs.
      </Typography>
      <Button component={Link} to="/phrases" size="small">Ouvrir la construction de phrases existante</Button>
    </Stack>
  </PageLayout>;
}

export function SentenceLabPage() {
  const { preferences } = usePreferences();
  return <PedagogyTheme>
    <SentenceLabContent key={preferences.profile.id} profileId={preferences.profile.id} />
  </PedagogyTheme>;
}
