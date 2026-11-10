import { Alert, Button, Paper, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

import { summarizeLearning } from '@/helpers/learningObservation';
import type { PedagogyProfile } from '@/types/pedagogy';

const errorLabels = { missing_word: 'Mot manquant', subject_agreement: 'Accord sujet-verbe', auxiliary: 'Auxiliaire ou forme verbale' };

export function LearningSummary({ profile }: { profile: PedagogyProfile }) {
  const summary = summarizeLearning(profile);
  const counts = new Map<string, number>();
  for (const item of summary.errors) {
    const category = item.evaluation.errorCategory!;
    counts.set(category, (counts.get(category) ?? 0) + 1);
  }
  return <Paper variant="outlined" sx={{ p: 2.5 }}>
    <Stack spacing={2}>
      <Typography variant="h6" component="h2">Observations pédagogiques</Typography>
      <Typography variant="body2" color="text.secondary">Depuis l’activation du suivi, pour ce profil et ce navigateur. Les anciennes révisions ne sont pas reconstruites.</Typography>
      {!summary.total ? <Alert severity="info">Aucune activité enregistrée pour le moment. Commence une séance pour alimenter ce suivi.</Alert> : <>
        <Typography>{summary.declared} mot(s) déclaré(s) reconnu(s) · {summary.recall} mot(s) rappelé(s) en traduction vers l’anglais sans révéler la carte.</Typography>
        <Typography>{summary.guided} mot(s) utilisé(s) dans une phrase à trou sans indice affiché.</Typography>
        <Typography>{summary.listening} dictée(s) exacte(s) · {summary.productions} production(s) reconnue(s) sans aide dans Sentence Lab.</Typography>
        <Typography>{summary.writing} phrase(s) reconnue(s) en construction guidée. Les indices et tuiles de cette activité ne constituent pas une production sans aide.</Typography>
        <Typography>{summary.pending} réponse(s) à vérifier, exclue(s) des verdicts de maîtrise.</Typography>
        <Alert severity="info">Une reconnaissance ou une traduction réussie ne prouve pas la capacité à employer spontanément un mot. La production autonome du vocabulaire n’est pas encore évaluée.</Alert>
      </>}
      {counts.size > 0 && <>
        <Typography variant="subtitle1" component="h3">Erreurs identifiées dans Sentence Lab</Typography>
        {[...counts].map(([category, count]) => <Typography key={category} variant="body2">{errorLabels[category as keyof typeof errorLabels]} : {count} occurrence(s) observée(s).</Typography>)}
        <Typography variant="caption">Historique des erreurs certaines, sans prétendre mesurer leur persistance actuelle.</Typography>
      </>}
      <Button component={Link} to="/sentence-lab" variant="outlined">Travailler les constructions</Button>
    </Stack>
  </Paper>;
}
