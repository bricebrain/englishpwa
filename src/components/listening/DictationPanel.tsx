import { useMemo, useState, type FormEvent } from 'react';
import { Alert, Box, Button, Chip, LinearProgress, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { RefreshCw, Volume2 } from 'lucide-react';

import { useTheme } from '@/context/ThemeContext';
import { buildDictationPool } from '@/helpers/dictationSession';
import { useDictationSession } from '@/hooks/useDictationSession';
import { usePreferences } from '@/hooks/usePreferences';
import type { DictationPhrase } from '@/types/dictation';
import type { AssimilPreparedLesson } from '@/types/learning';

interface Props {
  level: DictationPhrase['level'];
  lesson?: AssimilPreparedLesson;
}

export function DictationPanel({ level, lesson }: Props) {
  const [practiceLevel, setPracticeLevel] = useState(level);
  const selectedLevel = lesson ? level : practiceLevel;
  const { preferences } = usePreferences();
  const { resolved } = useTheme();
  const pool = useMemo(() => buildDictationPool(selectedLevel, lesson), [selectedLevel, lesson]);
  const theme = useMemo(() => createTheme({
    palette: { mode: resolved, primary: { main: '#03915A' } },
    typography: { fontFamily: 'var(--font-sans)' },
    shape: { borderRadius: 12 },
  }), [resolved]);

  return (
    <ThemeProvider theme={theme}>
      {!lesson ? (
        <TextField select label="Niveau de dictée" size="small" value={selectedLevel} sx={{ mb: 2, minWidth: 180 }}
          onChange={(event) => setPracticeLevel(event.target.value as DictationPhrase['level'])}>
          {(['A1', 'A2', 'B1', 'B2'] as const).map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
        </TextField>
      ) : null}
      <DictationSession key={`${preferences.profile.id}:${selectedLevel}:${lesson?.id ?? 'practice'}`}
        pool={pool} profileId={preferences.profile.id} level={selectedLevel} />
    </ThemeProvider>
  );
}

function DictationSession({ pool, profileId, level }: { pool: DictationPhrase[]; profileId: string; level: string }) {
  const session = useDictationSession(pool, profileId);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (session.result === null) session.validate();
    else session.next();
  };

  return (
    <Paper component="section" aria-label="Dictées" variant="outlined"
      sx={{ p: { xs: 2, sm: 3 }, mb: 3, bgcolor: 'var(--surface)', color: 'var(--fg)', borderColor: 'var(--border)' }}>
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
          <Typography component="h2" variant="h6" fontWeight={700}>Dictées</Typography>
          <Chip label={level} size="small" color="primary" variant="outlined" />
        </Stack>
        <Typography variant="body2" color="text.secondary">
          Écoute puis écris ce que tu entends. Les phrases inédites passent en premier.
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {session.unseenCount} phrase{session.unseenCount > 1 ? 's' : ''} à découvrir sur {pool.length} · Historique dans ce navigateur
        </Typography>

        {session.trackingError && <Alert severity="warning">Le suivi commun n’a pas pu être enregistré dans ce navigateur.</Alert>}
        {session.completed ? (
          <Box aria-live="polite">
            <Typography variant="h6" component="h3">Série terminée : {session.score}/{session.total}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {session.unseenCount ? 'La prochaine série privilégiera les phrases restantes.' : 'Toutes les phrases ont été travaillées. Les prochaines séries seront des révisions.'}
            </Typography>
          </Box>
        ) : session.phrase ? (
          <>
            <LinearProgress variant="determinate" aria-label="Progression de la dictée"
              value={100 * (session.index + (session.result !== null ? 1 : 0)) / session.total} />
            <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
              <Typography variant="body2">Phrase {session.index + 1}/{session.total}</Typography>
              <Chip size="small" label={session.result !== null ? 'Travaillée' : session.isReview ? 'Révision' : 'À découvrir'} variant="outlined" />
            </Stack>
            <Typography variant="caption" color="text.secondary">Source : {session.phrase.source}</Typography>
            <Button variant="outlined" startIcon={<Volume2 size={18} />} onClick={() => void session.listen()}>
              {session.speaking ? 'Arrêter l’écoute' : 'Écouter la phrase'}
            </Button>
            {session.audioError ? <Alert severity="error">{session.audioError}</Alert> : null}
            <Box component="form" onSubmit={submit}>
              <Stack spacing={2}>
                <TextField label="Ta dictée en anglais" multiline minRows={2} fullWidth value={session.answer}
                  onChange={(event) => session.setAnswer(event.target.value)} disabled={session.result !== null}
                  autoComplete="off" inputProps={{ autoCapitalize: 'none', spellCheck: false }}
                  helperText="La casse et la ponctuation ne sont pas pénalisées." />
                {session.result !== null ? (
                  <Alert severity={session.result ? 'success' : 'info'} aria-live="polite">
                    <Typography fontWeight={700}>{session.result ? 'Bonne réponse !' : 'Phrase attendue'}</Typography>
                    <Typography>{session.phrase.text}</Typography>
                    {session.phrase.translation ? <Typography variant="body2">{session.phrase.translation}</Typography> : null}
                  </Alert>
                ) : null}
                <Button type="submit" variant="contained" disableElevation disabled={!session.answer.trim()}>
                  {session.result === null ? 'Vérifier' : 'Suivant'}
                </Button>
              </Stack>
            </Box>
          </>
        ) : <Alert severity="info">Aucune phrase disponible pour ce niveau.</Alert>}
        <Button variant={session.completed ? 'contained' : 'text'} startIcon={<RefreshCw size={16} />}
          onClick={session.newSeries} disabled={!pool.length}>Nouvelle série</Button>
      </Stack>
    </Paper>
  );
}
