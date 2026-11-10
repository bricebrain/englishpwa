import { Alert, Box, Button, Chip, Paper, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useRef } from 'react';

import type { Evaluation, LabContext, LabExercise } from '@/types/pedagogy';

const labels = {
  comprehension: 'Comprendre', transformation: 'Manipuler', error_correction: 'Corriger',
  production: 'Produire sans modèle', transfer: 'Réutiliser avant tout rappel',
};

interface Props {
  exercise: LabExercise;
  context: LabContext;
  answer: string;
  result: Evaluation | null;
  hintVisible: boolean;
  canShowHint: boolean;
  isSaving: boolean;
  saveError: boolean;
  answerLocked: boolean;
  onAnswer: (answer: string) => void;
  onHint: () => void;
  onValidate: () => void;
  onNext: () => void;
}

export function LabExerciseCard(props: Props) {
  const { exercise, result, context } = props;
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, [exercise.id]);
  return <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
    <Stack spacing={2}>
      <Chip label={labels[exercise.kind]} sx={{ alignSelf: 'flex-start' }} color="primary" variant="outlined" />
      <Typography ref={heading} tabIndex={-1} component="h2" variant="h6">{exercise.prompt}</Typography>
      {exercise.kind === 'comprehension' && <Box>
        <Typography component="h3" variant="subtitle1">{context.title}</Typography>
        <Typography lang="en" sx={{ mt: 1, lineHeight: 1.9 }}>{context.text}</Typography>
        <Typography variant="caption" color="text.secondary">
          {context.text.split(/\s+/).length} mots · {context.topic}
        </Typography>
      </Box>}
      {exercise.source && <Typography lang="en" sx={{ fontSize: '1.2rem' }}>{exercise.source}</Typography>}
      {props.hintVisible && <Alert severity="info">{exercise.hint}</Alert>}
      {props.canShowHint && !props.hintVisible && !result && <Button onClick={props.onHint} sx={{ alignSelf: 'flex-start' }}>Afficher un indice</Button>}
      <Box component="form" onSubmit={(event) => { event.preventDefault(); if (result) props.onNext(); else props.onValidate(); }}>
        <Stack spacing={2}>
          <TextField
            label="Ta réponse en anglais" multiline minRows={3} fullWidth
            value={props.answer} onChange={(event) => props.onAnswer(event.target.value)}
            disabled={Boolean(result) || props.isSaving || props.answerLocked}
            inputProps={{ maxLength: 1000, lang: 'en', spellCheck: false, autoComplete: 'off' }}
            helperText="Plusieurs formulations sont possibles. Les réponses non reconnues restent à vérifier."
          />
          {result && <Alert role="status" severity={result.outcome === 'correct' ? 'success' : result.outcome === 'incorrect' ? 'error' : 'info'}>
            <Typography fontWeight={600}>{result.outcome === 'correct' ? 'Construction validée pour cette activité' : result.outcome === 'incorrect' ? 'Un point à corriger' : 'Formulation à vérifier'}</Typography>
            {result.explanation}
            {result.outcome !== 'correct' && <Typography lang="en" sx={{ mt: 1 }}>Exemple de référence (d’autres réponses peuvent convenir) : {exercise.accepted[0]}.</Typography>}
          </Alert>}
          {props.saveError && <Alert severity="error" role="alert">
            La réponse n’a pas pu être enregistrée dans ce navigateur. Autorise le stockage local puis réessaie.
          </Alert>}
          <Button type="submit" variant="contained" size="large" disabled={props.isSaving || (!result && !props.answer.trim())}>
            {props.isSaving ? 'Enregistrement…' : result ? 'Continuer' : props.saveError ? 'Réessayer l’enregistrement' : 'Vérifier et enregistrer'}
          </Button>
        </Stack>
      </Box>
    </Stack>
  </Paper>;
}
