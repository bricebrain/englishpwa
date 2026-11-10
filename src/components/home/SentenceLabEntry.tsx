import { Button, Paper, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

export function SentenceLabEntry() {
  return <Paper variant="outlined" sx={{ my: 2, p: 2.5, borderRadius: 3, bgcolor: 'var(--surface)', color: 'var(--fg)', borderColor: 'var(--border)' }}>
    <Stack spacing={1.5}>
      <Typography component="h2" variant="h6">Construire tes propres phrases</Typography>
      <Typography variant="body2">Sentence Lab · Un même objectif, de la lecture à la production écrite. Parcours pilote de 8–10 minutes.</Typography>
      <Button component={Link} to="/sentence-lab" variant="contained" sx={{ alignSelf: 'flex-start', bgcolor: '#03915A', '&:hover': { bgcolor: '#027347' } }}>
        Commencer Sentence Lab
      </Button>
    </Stack>
  </Paper>;
}
