import { Chip, Paper, Stack, Typography } from '@mui/material';

import { constructions } from '@/constants/pedagogy/constructions';
import type { CompetencyProgress } from '@/types/pedagogy';

const labels = { new: 'À découvrir', learning: 'En apprentissage', consolidating: 'À consolider', mastered: 'Transfert confirmé' };

export function CompetencyOverview({ progress }: { progress: CompetencyProgress[] }) {
  return <Stack spacing={1.5} aria-label="Suivi des constructions">
    {progress.map((item) => {
      const construction = constructions.find((entry) => entry.id === item.constructionId)!;
      return <Paper key={item.constructionId} variant="outlined" sx={{ p: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1} flexWrap="wrap">
          <Typography component="h3" variant="subtitle1">{construction.objective}</Typography>
          <Chip size="small" label={labels[item.status]} color={item.status === 'mastered' ? 'success' : 'default'} />
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {item.delayedTransfers} / {construction.masteryCriteria.delayedTransfers} réutilisations différées validées
          {item.dueAt ? ` · Révision : ${new Date(item.dueAt).toLocaleDateString('fr-FR')}` : ''}
        </Typography>
        {item.pendingCount > 0 && <Typography variant="body2" color="text.secondary">
          {item.pendingCount} réponse(s) à vérifier, sans pénalité.
        </Typography>}
      </Paper>;
    })}
  </Stack>;
}
