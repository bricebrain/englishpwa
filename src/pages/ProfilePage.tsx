import SaveRounded from '@mui/icons-material/SaveRounded';
import SwipeRounded from '@mui/icons-material/SwipeRounded';
import { Box, Button, Card, CardContent, Slider, Snackbar, Stack, TextField, Typography } from '@mui/material';
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { PageHeader } from '@/components/common/PageHeader';
import { PageLayout } from '@/components/layout/PageLayout';
import { LevelBadge } from '@/components/ui/Gamification';
import { MotionBox, Pressable } from '@/components/ui/motion';
import { usePreferences } from '@/hooks/usePreferences';
import { feedback } from '@/services/feedbackService';
import { displayFont, gradients, tokens } from '@/theme';
import type { LearningProfile } from '@/types/learning';

const LEVELS: { value: LearningProfile['level']; label: string }[] = [
  { value: 'A2', label: 'Élémentaire' },
  { value: 'B1', label: 'Intermédiaire' },
  { value: 'B2', label: 'Avancé' },
  { value: 'C1', label: 'Autonome' },
];

function goalLabel(goal: number) {
  if (goal <= 10) return 'Tranquille';
  if (goal <= 20) return 'Régulier';
  if (goal <= 35) return 'Ambitieux';
  return 'Intensif';
}

export function ProfilePage() {
  const navigate = useNavigate();
  const { preferences, updateProfile } = usePreferences();
  const [form, setForm] = useState(preferences.profile);
  const [saved, setSaved] = useState(false);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    updateProfile(form);
    feedback('success');
    setSaved(true);
  };

  return (
    <PageLayout reading>
      <PageHeader back title="Profil" subtitle="Niveau et rythme d’apprentissage" />

      <Stack component="form" onSubmit={submit} gap={2}>
        <Card sx={{ overflow: 'hidden' }}>
          <Box sx={{ height: 84, background: gradients.primary, opacity: 0.85 }} />
          <CardContent sx={{ pt: 0, mt: -5, position: 'relative' }}>
            <Stack direction="row" alignItems="flex-end" justifyContent="space-between">
              <MotionBox
                initial={{ scale: 0.6, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 14 }}
                sx={{ width: 84, height: 84, borderRadius: '30%', display: 'grid', placeItems: 'center', background: tokens.surfaceRaised, border: `4px solid ${tokens.surface}`, fontFamily: displayFont, fontWeight: 800, fontSize: 36 }}
              >
                {form.name.charAt(0).toUpperCase() || 'A'}
              </MotionBox>
              <LevelBadge />
            </Stack>
            <Typography variant="h2" mt={1.5}>{form.name || 'Apprenant'}</Typography>
            <Typography color="text.secondary" fontSize={14}>Niveau {form.level} · {form.dailyGoal} mots par jour</Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <TextField fullWidth label="Nom affiché" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />

            <Typography variant="overline" color="text.secondary" display="block" mt={3} mb={1}>Niveau actuel</Typography>
            <Box display="grid" gridTemplateColumns="repeat(4, 1fr)" gap={1}>
              {LEVELS.map(({ value, label }) => {
                const selected = form.level === value;
                return (
                  <Pressable key={value} silent onClick={() => { feedback('select'); setForm((current) => ({ ...current, level: value })); }} aria-pressed={selected} aria-label={`${value} ${label}`}>
                    <Box
                      sx={{
                        py: 1.25, borderRadius: 4, textAlign: 'center',
                        background: selected ? gradients.primary : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${selected ? 'transparent' : tokens.border}`,
                        boxShadow: selected ? `0 10px 24px -10px ${tokens.violet}` : 'none',
                        transition: 'all .25s',
                      }}
                    >
                      <Typography fontFamily={displayFont} fontWeight={800} fontSize={20}>{value}</Typography>
                      <Typography fontSize={10.5} fontWeight={700} color={selected ? 'rgba(255,255,255,0.85)' : 'text.secondary'}>{label}</Typography>
                    </Box>
                  </Pressable>
                );
              })}
            </Box>

            <Stack direction="row" justifyContent="space-between" alignItems="baseline" mt={3}>
              <Typography variant="overline" color="text.secondary">Objectif quotidien</Typography>
              <Typography fontWeight={800} color={tokens.amber}>{goalLabel(form.dailyGoal)}</Typography>
            </Stack>
            <Typography fontFamily={displayFont} fontWeight={800} fontSize={34}>{form.dailyGoal} <Typography component="span" color="text.secondary" fontWeight={600}>mots / jour</Typography></Typography>
            <Slider
              min={5} max={50} step={5} value={form.dailyGoal}
              onChange={(_, value) => { feedback('tap'); setForm((current) => ({ ...current, dailyGoal: value as number })); }}
              aria-label="Objectif quotidien"
            />
          </CardContent>
        </Card>

        <Typography color="text.disabled" fontSize={12.5} textAlign="center">
          Les préférences sont conservées dans ce navigateur tant que l’API de profil n’est pas configurée.
        </Typography>
        <Button type="submit" size="large" variant="contained" startIcon={<SaveRounded />}>Enregistrer</Button>
        <Button size="large" variant="outlined" startIcon={<SwipeRounded />} onClick={() => navigate('/lingvist-triage')}>Trier les mots faciles</Button>
      </Stack>
      <Snackbar open={saved} autoHideDuration={2500} onClose={() => setSaved(false)} message="Profil enregistré ✓" />
    </PageLayout>
  );
}
