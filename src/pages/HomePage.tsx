import { BookOpen, ChevronRight, Hammer, Headphones, Layers, BookOpenText, MoveHorizontal, Play, Search, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { QueryState } from '@/components/common/QueryState';
import { DailyMissionCard } from '@/components/home/DailyMissionCard';
import { DailyStoryCard } from '@/components/home/DailyStoryCard';
import { WeekStrip } from '@/components/home/WeekStrip';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent } from '@/components/ui/card';
import { LevelBadge, StreakBadge } from '@/components/ui/Gamification';
import { AnimatedNumber, Pressable, Stagger, StaggerItem } from '@/components/ui/motion';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { learnedRatio } from '@/helpers/progressRatio';
import { useDashboard } from '@/hooks/useLearningQueries';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { usePreferences } from '@/hooks/usePreferences';
import { useXp } from '@/hooks/useXp';
import { alpha, gradients, tokens } from '@/theme';

const shortcuts = [
  { title: 'Lingvist', subtitle: 'Rappel actif', path: '/lingvist', icon: BookOpen, gradient: gradients.primary },
  { title: 'Flashcards', subtitle: 'Cartes à retourner', path: '/flashcards', icon: Layers, gradient: gradients.ocean },
  { title: 'Phrases', subtitle: 'Construire en anglais', path: '/phrases', icon: Hammer, gradient: gradients.sunrise },
  { title: 'Tri éclair', subtitle: 'Swipe tes mots', path: '/lingvist-triage', icon: MoveHorizontal, gradient: gradients.mint },
  { title: 'Écouter', subtitle: 'Assimil & audios', path: '/ecouter', icon: Headphones, gradient: 'linear-gradient(135deg, #168CA8, #16875D)' },
  { title: 'Lire', subtitle: 'Articles guidés', path: '/lire', icon: BookOpenText, gradient: 'linear-gradient(135deg, #D83E88, #7055E8)' },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 5) return 'Encore debout';
  if (hour < 12) return 'Bonjour';
  if (hour < 18) return 'Bon après-midi';
  return 'Bonsoir';
}

function motivation(ratio: number) {
  if (ratio >= 1) return 'Objectif atteint. Tu es en feu !';
  if (ratio >= 0.6) return 'Tu y es presque, finis en beauté.';
  if (ratio > 0) return 'Bien lancé, garde le rythme.';
  return 'Quelques minutes suffisent pour démarrer.';
}

export function HomePage() {
  const navigate = useNavigate();
  const online = useNetworkStatus();
  const { preferences } = usePreferences();
  const dashboard = useDashboard();
  const xp = useXp();
  const firstName = useMemo(() => preferences.profile.name.split(' ')[0] || 'Apprenant', [preferences.profile.name]);
  const data = dashboard.data;
  const goal = preferences.profile.dailyGoal;
  const ratio = data ? Math.min(1, data.reviewedToday / goal) : 0;
  const nextPath = data && data.reviewedToday >= 10 ? '/phrases' : '/lingvist';

  return (
    <PageLayout>
      <div className="mb-6 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <Pressable onClick={() => navigate('/profile')} aria-label="Ouvrir le profil" className="w-auto rounded-full">
            <span className="block rounded-full bg-grad-primary p-[2.5px]">
              <span className="grid size-[42px] place-items-center rounded-full bg-surface font-display text-lg font-extrabold">
                {firstName.charAt(0).toUpperCase()}
              </span>
            </span>
          </Pressable>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-muted">{getGreeting()},</p>
            <h1 className="truncate font-display text-[22px] font-extrabold leading-[1.1]">{firstName} 👋</h1>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {data ? <StreakBadge days={data.streak} /> : null}
          <Pressable onClick={() => navigate('/statistics')} aria-label="Voir la progression" className="w-auto">
            <LevelBadge compact />
          </Pressable>
          <Pressable onClick={() => navigate('/recherche')} aria-label="Rechercher dans tes contenus" className="w-auto rounded-full">
            <span className="grid size-[38px] place-items-center rounded-full border border-border bg-surface text-muted">
              <Search className="size-5" />
            </span>
          </Pressable>
        </div>
      </div>

      <QueryState loading={dashboard.isLoading} error={dashboard.isError} offline={!online} onRetry={() => dashboard.refetch()} />

      {data ? (
        <Stagger gap={0.08} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StaggerItem className="h-full">
            <Card className="h-full overflow-hidden">
              <div
                className="pointer-events-none absolute -right-[60px] -top-20 size-[220px] rounded-full"
                style={{ background: `radial-gradient(circle, ${alpha(tokens.violet, 0.35)}, transparent 70%)` }}
              />
              <CardContent className="relative p-5 sm:p-6">
                <span className="type-overline text-violet-soft">Objectif du jour</span>
                <div className="mt-2 flex items-center gap-5">
                  <ProgressRing value={ratio} size={128} stroke={13}>
                    <div className="text-center">
                      <p className="font-display text-4xl font-extrabold leading-none">
                        <AnimatedNumber value={data.reviewedToday} />
                      </p>
                      <p className="text-xs font-bold text-muted">/ {goal} mots</p>
                    </div>
                  </ProgressRing>
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-[19px] font-bold leading-tight">{motivation(ratio)}</p>
                    <div className="mt-2.5 flex items-center gap-1">
                      <Zap className="size-[18px] fill-current text-amber" />
                      <p className="font-extrabold text-amber"><AnimatedNumber value={xp.todayXp} /> XP</p>
                      <p className="text-[13px] text-muted">aujourd’hui</p>
                    </div>
                    <p className="mt-0.5 text-[13px] text-muted">{data.dueCount} mots t’attendent</p>
                  </div>
                </div>

                <motion.div
                  className="mt-5 rounded-2xl"
                  animate={{ boxShadow: [`0 0 0 0 ${alpha(tokens.violet, 0.55)}`, `0 0 0 14px ${alpha(tokens.violet, 0)}`] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                >
                  <Pressable onClick={() => navigate(nextPath)} aria-label="Lancer la session">
                    <span
                      className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-grad-primary text-[17px] font-extrabold text-white"
                      style={{ boxShadow: `0 14px 30px -12px ${tokens.violet}` }}
                    >
                      <Play className="size-6 fill-current" />
                      {ratio > 0 ? 'Continuer ma session' : 'Commencer ma session'}
                    </span>
                  </Pressable>
                </motion.div>
              </CardContent>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <DailyMissionCard reviewedToday={data.reviewedToday} dueCount={data.dueCount} />
          </StaggerItem>

          <StaggerItem className="sm:col-span-2">
            <DailyStoryCard />
          </StaggerItem>

          <StaggerItem className="sm:col-span-2">
            <Card>
              <CardContent>
                <div className="mb-3.5 flex items-baseline justify-between">
                  <h3 className="type-h3">Ta semaine</h3>
                  <p className="text-[13px] font-bold text-amber">{data.streak} jour{data.streak > 1 ? 's' : ''} de suite</p>
                </div>
                <WeekStrip activeDays={data.activeDays} />
              </CardContent>
            </Card>
          </StaggerItem>

          <StaggerItem className="sm:col-span-2">
            <h3 className="type-h3 mb-2.5 mt-1">Explorer</h3>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {shortcuts.map(({ title, subtitle, path, icon: Icon, gradient }, index) => (
                <motion.div
                  key={path}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 24, delay: 0.25 + index * 0.05 }}
                >
                  <Pressable onClick={() => navigate(path)} aria-label={title}>
                    <span className="relative block min-h-[118px] overflow-hidden rounded-[20px] border border-border bg-surface p-3.5">
                      <span className="absolute -right-[30px] -top-[30px] size-[110px] rounded-full opacity-20 blur-[18px]" style={{ background: gradient }} />
                      <span
                        className="relative grid size-[42px] place-items-center rounded-[14px] text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.35)]"
                        style={{ background: gradient }}
                      >
                        <Icon className="size-[22px]" />
                      </span>
                      <span className="relative mt-3 block font-extrabold">{title}</span>
                      <span className="relative block text-xs text-muted">{subtitle}</span>
                    </span>
                  </Pressable>
                </motion.div>
              ))}
            </div>
          </StaggerItem>

          <StaggerItem className="sm:col-span-2">
            <Pressable onClick={() => navigate('/statistics')} aria-label="Voir la progression">
              <Card>
                <CardContent>
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <h3 className="type-h3">Vocabulaire maîtrisé</h3>
                      <p className="text-[13px] text-muted">
                        <AnimatedNumber value={data.learnedCount} /> / {(data.totalCount ?? 0).toLocaleString('fr-FR')} mots
                      </p>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gradient font-display text-2xl font-extrabold">
                        <AnimatedNumber value={Math.round(learnedRatio(data.learnedCount, data.totalCount) * 100)} suffix="%" />
                      </span>
                      <ChevronRight className="size-6 text-faint" />
                    </div>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-ink/8">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${learnedRatio(data.learnedCount, data.totalCount) * 100}%` }}
                      transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
                      className="h-full rounded-full bg-grad-primary"
                    />
                  </div>
                </CardContent>
              </Card>
            </Pressable>
          </StaggerItem>
        </Stagger>
      ) : null}
    </PageLayout>
  );
}
