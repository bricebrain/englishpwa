import { MoveHorizontal, Save } from 'lucide-react';
import { motion } from 'motion/react';
import { useCallback, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { PageHeader } from '@/components/common/PageHeader';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input, Slider } from '@/components/ui/form';
import { Pressable } from '@/components/ui/motion';
import { Toast } from '@/components/ui/toast';
import { usePreferences } from '@/hooks/usePreferences';
import { useXp } from '@/hooks/useXp';
import { cn } from '@/lib/utils';
import { feedback } from '@/services/feedbackService';
import { tokens } from '@/theme';
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
  const xp = useXp();
  const [form, setForm] = useState(preferences.profile);
  const [saved, setSaved] = useState(false);
  const closeToast = useCallback(() => setSaved(false), []);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    updateProfile(form);
    feedback('success');
    setSaved(true);
  };

  return (
    <PageLayout reading>
      <PageHeader back title="Profil" />

      <form onSubmit={submit} className="flex flex-col gap-4">
        <Card className="overflow-hidden">
          <div className="h-[72px] bg-violet/12" />
          <CardContent className="relative -mt-10 pt-0">
            <div className="flex items-end justify-between">
              <motion.div
                initial={{ scale: 0.6, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 14 }}
                className="grid size-[84px] place-items-center rounded-full border-4 border-surface bg-ink/12 font-display text-4xl font-semibold"
              >
                {form.name.charAt(0).toUpperCase() || 'A'}
              </motion.div>
              <span className="mb-1 rounded-full bg-violet/12 px-3 py-1 text-[13px] font-semibold tabular-nums text-violet">Niveau {xp.level} · {xp.totalXp} XP</span>
            </div>
            <h2 className="type-h2 mt-3">{form.name || 'Apprenant'}</h2>
            <p className="text-sm text-muted">Niveau {form.level} · {form.dailyGoal} mots par jour</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-bold text-muted">Nom affiché</span>
              <Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
            </label>

            <span className="type-overline mb-2 mt-6 text-muted">Niveau actuel</span>
            <div className="grid grid-cols-4 gap-2">
              {LEVELS.map(({ value, label }) => {
                const selected = form.level === value;
                return (
                  <Pressable key={value} silent onClick={() => { feedback('select'); setForm((current) => ({ ...current, level: value })); }} aria-pressed={selected} aria-label={`${value} ${label}`}>
                    <span
                      className={cn(
                        'block rounded-2xl border py-2.5 text-center transition-all duration-200',
                        selected ? 'border-transparent bg-grad-primary text-white' : 'border-border bg-ink/[0.045]',
                      )}
                      style={selected ? { boxShadow: `0 10px 24px -10px ${tokens.violet}` } : undefined}
                    >
                      <span className="block font-display text-xl font-bold">{value}</span>
                      <span className={cn('block text-[10.5px] font-bold', selected ? 'text-white/85' : 'text-muted')}>{label}</span>
                    </span>
                  </Pressable>
                );
              })}
            </div>

            <div className="mt-6 flex items-baseline justify-between">
              <span className="type-overline text-muted">Objectif quotidien</span>
              <p className="font-bold text-amber">{goalLabel(form.dailyGoal)}</p>
            </div>
            <p className="font-display text-[34px] font-bold">
              {form.dailyGoal} <span className="font-sans text-base font-semibold text-muted">mots / jour</span>
            </p>
            <Slider
              min={5} max={50} step={5} value={[form.dailyGoal]}
              onValueChange={([value]) => { feedback('tap'); setForm((current) => ({ ...current, dailyGoal: value ?? current.dailyGoal })); }}
              aria-label="Objectif quotidien"
              className="mt-1"
            />
          </CardContent>
        </Card>

        <p className="text-center text-[12.5px] text-faint">
          Les préférences sont conservées dans ce navigateur tant que l’API de profil n’est pas configurée.
        </p>
        <Button type="submit" size="lg"><Save />Enregistrer</Button>
        <Button size="lg" variant="outline" onClick={() => navigate('/lingvist-triage')}><MoveHorizontal />Trier les mots faciles</Button>
      </form>
      <Toast open={saved} onClose={closeToast} message="Profil enregistré ✓" />
    </PageLayout>
  );
}
