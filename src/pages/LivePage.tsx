import CheckRounded from '@mui/icons-material/CheckRounded';
import ContentCopyRounded from '@mui/icons-material/ContentCopyRounded';
import GraphicEqRounded from '@mui/icons-material/GraphicEqRounded';
import OpenInNewRounded from '@mui/icons-material/OpenInNewRounded';
import { Box, Button, Card, CardContent, Grid, Snackbar, Stack, TextField, Typography } from '@mui/material';
import { AnimatePresence } from 'framer-motion';
import { useState } from 'react';

import { PageHeader } from '@/components/common/PageHeader';
import { PageLayout } from '@/components/layout/PageLayout';
import { LiveAnalysisPanel } from '@/components/live/LiveAnalysisPanel';
import { MotionBox } from '@/components/ui/motion';
import { feedback } from '@/services/feedbackService';
import { awardXp } from '@/services/xpService';
import { displayFont, gradients, tokens } from '@/theme';

const COACH_PROMPT = `Tu es mon coach d'anglais. Lance une séance de 10 minutes niveau B1-B2 sur le thème du travail et des décisions. Pose une question à la fois, corrige brièvement mes erreurs et termine par un bilan structuré : points forts, erreurs récurrentes, expressions à revoir.`;

function StepBadge({ step, gradient }: { step: number; gradient: string }) {
  return (
    <Box sx={{ width: 34, height: 34, borderRadius: '11px', display: 'grid', placeItems: 'center', background: gradient, fontFamily: displayFont, fontWeight: 800, color: '#fff' }}>
      {step}
    </Box>
  );
}

export function LivePage() {
  const [report, setReport] = useState(() => localStorage.getItem('english-fluency:last-live-report') ?? '');
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const copyPrompt = async () => {
    await navigator.clipboard.writeText(COACH_PROMPT);
    feedback('success');
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  };

  const saveReport = () => {
    const previous = localStorage.getItem('english-fluency:last-live-report');
    localStorage.setItem('english-fluency:last-live-report', report.trim());
    feedback('complete');
    if (previous !== report.trim()) awardXp(30, 'Séance Live');
    setSaved(true);
  };

  return (
    <PageLayout>
      <PageHeader eyebrow="Conversation" title="Séance Live" subtitle="Prépare ChatGPT Live, parle, puis garde ton bilan." />

      <Box sx={{ position: 'relative', mb: 2.5, p: 2.5, borderRadius: 6, overflow: 'hidden', background: 'linear-gradient(135deg, rgba(255,181,71,0.16), rgba(255,93,162,0.14))', border: '1px solid rgba(255,122,89,0.3)' }}>
        <Stack direction="row" alignItems="center" gap={2}>
          <Box position="relative" sx={{ width: 64, height: 64, flexShrink: 0 }}>
            {[0, 1].map((ring) => (
              <MotionBox
                key={ring}
                animate={{ scale: [1, 1.7], opacity: [0.5, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, delay: ring * 1.1, ease: 'easeOut' }}
                sx={{ position: 'absolute', inset: 0, borderRadius: '50%', background: tokens.coral }}
              />
            ))}
            <Box sx={{ position: 'relative', width: 64, height: 64, borderRadius: '50%', display: 'grid', placeItems: 'center', background: gradients.sunrise, color: '#fff' }}>
              <GraphicEqRounded sx={{ fontSize: 32 }} />
            </Box>
          </Box>
          <Box>
            <Typography fontFamily={displayFont} fontWeight={800} fontSize={20}>10 minutes pour parler</Typography>
            <Typography color="text.secondary" fontSize={14}>Vise la fluidité, pas la perfection. +30 XP au bilan.</Typography>
          </Box>
        </Stack>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: { xs: 2.25, sm: 3 } }}>
              <Stack direction="row" alignItems="center" gap={1.25}>
                <StepBadge step={1} gradient={gradients.primary} />
                <Typography variant="h2">Copier la mission</Typography>
              </Stack>
              <Box
                sx={{
                  mt: 2, p: 2, borderRadius: 4, position: 'relative', fontSize: 14.5, lineHeight: 1.7, color: 'text.secondary',
                  background: 'rgba(49,39,78,0.035)', borderLeft: `3px solid ${tokens.violet}`,
                }}
              >
                {COACH_PROMPT}
              </Box>
              <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.25} mt={2}>
                <Button
                  variant="contained"
                  color={copied ? 'success' : 'primary'}
                  onClick={copyPrompt}
                  sx={{ flex: 1 }}
                  startIcon={(
                    <AnimatePresence mode="wait" initial={false}>
                      <MotionBox key={copied ? 'ok' : 'copy'} initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }} sx={{ display: 'grid' }}>
                        {copied ? <CheckRounded /> : <ContentCopyRounded />}
                      </MotionBox>
                    </AnimatePresence>
                  )}
                >
                  {copied ? 'Copiée !' : 'Copier la consigne'}
                </Button>
                <Button variant="outlined" component="a" href="https://chatgpt.com" target="_blank" rel="noreferrer" startIcon={<OpenInNewRounded />} sx={{ flex: 1 }}>
                  Ouvrir ChatGPT
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: { xs: 2.25, sm: 3 } }}>
              <Stack direction="row" alignItems="center" gap={1.25}>
                <StepBadge step={2} gradient={gradients.sunrise} />
                <Typography variant="h2">Importer le bilan</Typography>
              </Stack>
              <Typography color="text.secondary" mt={1} mb={2} fontSize={14} lineHeight={1.6}>
                Colle le bilan de fin de conversation pour le retrouver ici.
              </Typography>
              <TextField
                fullWidth multiline minRows={7} value={report}
                onChange={(event) => setReport(event.target.value)}
                placeholder="Points forts, erreurs récurrentes, expressions à revoir…"
              />
              <Button fullWidth size="large" variant="contained" color="secondary" startIcon={<CheckRounded />} disabled={!report.trim()} onClick={saveReport} sx={{ mt: 2 }}>
                Enregistrer le bilan
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <LiveAnalysisPanel report={report} />
      <Snackbar open={saved} autoHideDuration={2500} onClose={() => setSaved(false)} message="Bilan enregistré sur cet appareil ✓" />
    </PageLayout>
  );
}
