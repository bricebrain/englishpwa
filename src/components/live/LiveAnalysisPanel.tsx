import AutoAwesomeRounded from '@mui/icons-material/AutoAwesomeRounded';
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded';
import LibraryAddRounded from '@mui/icons-material/LibraryAddRounded';
import ThumbUpRounded from '@mui/icons-material/ThumbUpRounded';
import { Alert, Box, Button, Card, CardContent, Checkbox, Stack, Typography } from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { aiFeaturesApi } from '@/api/aiFeaturesApi';
import { MotionBox } from '@/components/ui/motion';
import { usePreferences } from '@/hooks/usePreferences';
import { celebrate, feedback } from '@/services/feedbackService';
import { speakEnglish } from '@/services/speechPlaybackService';
import { awardXp } from '@/services/xpService';
import { tokens } from '@/theme';

const MIN_REPORT = 40;

/** Analyse d'un bilan Live : erreurs corrigées et expressions à ajouter au SRS. */
export function LiveAnalysisPanel({ report }: { report: string }) {
  const { preferences } = usePreferences();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<Set<string>>(() => new Set());

  const analysis = useMutation({
    mutationFn: () => aiFeaturesApi.analyzeLiveReport(preferences.profile.id, report.trim()),
    onSuccess: (result) => {
      feedback('success');
      setSelected(new Set(result.expressions.map((item) => item.en)));
    },
  });

  const addToSrs = useMutation({
    mutationFn: (expressions: { en: string; fr: string; example: string }[]) => aiFeaturesApi.addExpressionsToSrs(preferences.profile.id, expressions),
    onSuccess: (count) => {
      feedback('complete');
      void celebrate('small');
      awardXp(5 * count, 'Expressions ajoutées');
      void queryClient.invalidateQueries({ queryKey: ['srs-session', preferences.profile.id] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard', preferences.profile.id] });
    },
  });

  // Un nouveau bilan invalide l'analyse précédente.
  useEffect(() => {
    analysis.reset();
    addToSrs.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- on réagit uniquement au texte du bilan
  }, [report]);

  const result = analysis.data;
  const chosen = result?.expressions.filter((item) => selected.has(item.en)) ?? [];

  return (
    <Card sx={{ mt: 2 }}>
      <CardContent sx={{ p: { xs: 2.25, sm: 3 } }}>
        <Stack direction="row" alignItems="center" gap={1}>
          <AutoAwesomeRounded sx={{ color: tokens.violet }} />
          <Typography variant="h2">Analyser le bilan</Typography>
        </Stack>
        <Typography color="text.secondary" mt={1} fontSize={14} lineHeight={1.6}>
          L’IA repère tes erreurs récurrentes et les expressions à revoir, que tu peux ajouter à tes révisions.
        </Typography>

        {!result ? (
          <Button
            fullWidth size="large" variant="contained" startIcon={<AutoAwesomeRounded />} sx={{ mt: 2 }}
            disabled={report.trim().length < MIN_REPORT || analysis.isPending}
            onClick={() => analysis.mutate()}
          >
            {analysis.isPending ? 'Analyse en cours…' : 'Analyser avec l’IA'}
          </Button>
        ) : null}
        {analysis.isError ? <Alert severity="error" sx={{ mt: 2 }}>L’analyse n’a pas pu aboutir. Réessaie dans un instant.</Alert> : null}

        {result ? (
          <MotionBox initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} sx={{ mt: 2 }}>
            <Stack gap={2}>
              {result.summaryFr ? <Typography lineHeight={1.6}>{result.summaryFr}</Typography> : null}

              {result.strengths.length ? (
                <Box>
                  <Typography variant="overline" color={tokens.mint} display="block">Points forts</Typography>
                  {result.strengths.map((item) => (
                    <Stack key={item} direction="row" gap={1} alignItems="flex-start" mt={0.75}>
                      <ThumbUpRounded sx={{ color: tokens.mint, fontSize: 18, mt: 0.3 }} />
                      <Typography fontSize={14.5}>{item}</Typography>
                    </Stack>
                  ))}
                </Box>
              ) : null}

              {result.errors.length ? (
                <Box>
                  <Typography variant="overline" color={tokens.red} display="block">Erreurs récurrentes</Typography>
                  <Stack gap={1} mt={0.75}>
                    {result.errors.map((item) => (
                      <Box key={item.wrong} sx={{ p: 1.5, borderRadius: 3, background: 'rgba(214,63,90,0.06)', border: '1px solid rgba(214,63,90,0.18)' }}>
                        <Typography fontSize={14.5}>
                          <Box component="span" sx={{ textDecoration: 'line-through', color: tokens.red }}>{item.wrong}</Box>
                          {' → '}
                          <Box component="strong" sx={{ color: tokens.mint }}>{item.correct}</Box>
                        </Typography>
                        {item.explanationFr ? <Typography fontSize={13} color="text.secondary" mt={0.25}>{item.explanationFr}</Typography> : null}
                      </Box>
                    ))}
                  </Stack>
                </Box>
              ) : null}

              {result.expressions.length ? (
                <Box>
                  <Typography variant="overline" color={tokens.violetSoft} display="block">Expressions à revoir</Typography>
                  <Stack gap={0.5} mt={0.5}>
                    {result.expressions.map((item) => (
                      <Stack key={item.en} component="label" direction="row" alignItems="flex-start" gap={0.5} sx={{ cursor: 'pointer' }}>
                        <Checkbox
                          size="small"
                          checked={selected.has(item.en)}
                          disabled={addToSrs.isSuccess}
                          onChange={(event) => setSelected((current) => {
                            const next = new Set(current);
                            if (event.target.checked) next.add(item.en); else next.delete(item.en);
                            return next;
                          })}
                        />
                        <Box flex={1} pt={0.75}>
                          <Typography fontWeight={750} fontSize={14.5} onClick={(event) => { event.preventDefault(); speakEnglish(item.en); }}>
                            {item.en} <Typography component="span" color="text.secondary" fontWeight={500}>= {item.fr}</Typography>
                          </Typography>
                          {item.example ? <Typography fontSize={13} fontStyle="italic" color="text.secondary">{item.example}</Typography> : null}
                        </Box>
                      </Stack>
                    ))}
                  </Stack>
                  {addToSrs.isSuccess ? (
                    <Stack direction="row" alignItems="center" gap={1} mt={1.5} sx={{ color: tokens.mint }}>
                      <CheckCircleRounded />
                      <Typography fontWeight={750}>{addToSrs.data} expression{addToSrs.data > 1 ? 's' : ''} ajoutée{addToSrs.data > 1 ? 's' : ''} à tes révisions</Typography>
                    </Stack>
                  ) : (
                    <Button
                      fullWidth variant="contained" color="success" startIcon={<LibraryAddRounded />} sx={{ mt: 1.5 }}
                      disabled={!chosen.length || addToSrs.isPending}
                      onClick={() => addToSrs.mutate(chosen)}
                    >
                      {addToSrs.isPending ? 'Ajout…' : `Ajouter ${chosen.length} expression${chosen.length > 1 ? 's' : ''} au SRS`}
                    </Button>
                  )}
                  {addToSrs.isError ? <Alert severity="error" sx={{ mt: 1.5 }}>L’ajout n’a pas pu être enregistré.</Alert> : null}
                </Box>
              ) : null}
            </Stack>
          </MotionBox>
        ) : null}
      </CardContent>
    </Card>
  );
}
