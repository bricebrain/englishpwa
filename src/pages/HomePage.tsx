import { BookOpen, BookOpenText, Headphones, Layers, MessageCircle, MoveHorizontal, PenLine, Search } from 'lucide-react';
import { motion } from 'motion/react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { PageHeader } from '@/components/common/PageHeader';
import { QueryState } from '@/components/common/QueryState';
import { DailyStoryCard } from '@/components/home/DailyStoryCard';
import { WeekStrip } from '@/components/home/WeekStrip';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { ListGroup, ListRow, RowIcon, SectionHeader } from '@/components/ui/list';
import { AnimatedNumber, Pressable, Stagger, StaggerItem } from '@/components/ui/motion';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { learnedRatio } from '@/helpers/progressRatio';
import { useDashboard } from '@/hooks/useLearningQueries';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { usePreferences } from '@/hooks/usePreferences';

const EXPLORE = [
  { title: 'Flashcards', subtitle: 'Cartes à retourner', path: '/flashcards', icon: Layers, color: '#007AFF' },
  { title: 'Tri rapide', subtitle: 'Classer les mots connus', path: '/lingvist-triage', icon: MoveHorizontal, color: '#30B0C7' },
  { title: 'Écouter', subtitle: 'Assimil et audios', path: '/ecouter', icon: Headphones, color: '#FF2D55' },
  { title: 'Lire', subtitle: 'Articles guidés', path: '/lire', icon: BookOpenText, color: '#AF52DE' },
];

function todayLabel() {
  return new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
}

export function HomePage() {
  const navigate = useNavigate();
  const online = useNetworkStatus();
  const { preferences } = usePreferences();
  const dashboard = useDashboard();
  const initial = useMemo(() => (preferences.profile.name.trim().charAt(0) || 'A').toUpperCase(), [preferences.profile.name]);
  const data = dashboard.data;
  const goal = preferences.profile.dailyGoal;
  const ratio = data ? Math.min(1, data.reviewedToday / goal) : 0;
  const remaining = data ? Math.max(0, goal - data.reviewedToday) : 0;
  const wordsDone = Boolean(data && data.reviewedToday >= goal);
  const activeCount = data ? data.activeDays.filter(Boolean).length : 0;

  return (
    <PageLayout>
      <PageHeader
        eyebrow={todayLabel()}
        title="Aujourd’hui"
        trailing={(
          <Pressable onClick={() => navigate('/profile')} aria-label="Ouvrir le profil" className="w-auto rounded-full">
            <span className="grid size-9 place-items-center rounded-full bg-ink/12 text-base font-semibold">{initial}</span>
          </Pressable>
        )}
      />

      <QueryState loading={dashboard.isLoading} error={dashboard.isError} offline={!online} onRetry={() => dashboard.refetch()} />

      {data ? (
        <Stagger gap={0.05} className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
          <StaggerItem className="mt-2">
            <div className="flex flex-col gap-4 rounded-2xl bg-surface p-4">
              <div className="flex items-center gap-4">
                <ProgressRing value={ratio} size={84} stroke={8}>
                  <span className="text-[19px] font-bold tabular-nums">
                    <AnimatedNumber value={Math.round(ratio * 100)} suffix=" %" />
                  </span>
                </ProgressRing>
                <div className="min-w-0">
                  <p className="text-[13px] text-muted">Objectif du jour</p>
                  <p className="text-xl font-semibold leading-tight">
                    <AnimatedNumber value={data.reviewedToday} /> mots sur {goal}
                  </p>
                  <p className="mt-0.5 text-[15px] text-muted">
                    {wordsDone ? 'Objectif atteint' : `${data.dueCount} en attente · ≈ ${Math.max(2, Math.round(remaining * 0.35))} min`}
                  </p>
                </div>
              </div>
              <Button onClick={() => navigate('/lingvist')} className="w-full">
                {data.reviewedToday > 0 ? 'Continuer la révision' : 'Commencer la révision'}
              </Button>
            </div>
          </StaggerItem>

          <StaggerItem>
            <SectionHeader className="sm:mt-2">Programme du jour</SectionHeader>
            <ListGroup>
              <ListRow
                icon={<RowIcon color="#5856D6"><BookOpen /></RowIcon>}
                title={`Réviser ${Math.max(remaining, 10)} mots`}
                subtitle="Lingvist · rappel actif"
                detail="7 min"
                chevron
                onClick={() => navigate('/lingvist')}
              />
              <ListRow
                icon={<RowIcon color="#FF9500"><PenLine /></RowIcon>}
                title="Construire des phrases"
                subtitle="Phrases du jour avec tes mots"
                detail="5 min"
                chevron
                onClick={() => navigate('/phrases')}
              />
              <ListRow
                icon={<RowIcon color="#34A853"><MessageCircle /></RowIcon>}
                title="Préparer la séance Live"
                subtitle="Conversation avec le coach"
                detail="3 min"
                chevron
                last
                onClick={() => navigate('/live')}
              />
            </ListGroup>
          </StaggerItem>

          <StaggerItem>
            <DailyStoryCard />
          </StaggerItem>

          <StaggerItem>
            <SectionHeader>Cette semaine</SectionHeader>
            <div className="flex flex-col gap-3 rounded-xl bg-surface px-4 py-3.5">
              <WeekStrip activeDays={data.activeDays} />
              <p className="text-[15px] text-muted">
                {data.streak > 1 ? `${data.streak} jours d’affilée` : `${activeCount} jour${activeCount > 1 ? 's' : ''} de pratique`} · {data.learnedCount.toLocaleString('fr-FR')} mots maîtrisés
              </p>
            </div>
          </StaggerItem>

          <StaggerItem>
            <SectionHeader>Explorer</SectionHeader>
            <ListGroup>
              {EXPLORE.map(({ title, subtitle, path, icon: Icon, color }, index) => (
                <ListRow
                  key={path}
                  icon={<RowIcon color={color}><Icon /></RowIcon>}
                  title={title}
                  subtitle={subtitle}
                  chevron
                  last={index === EXPLORE.length - 1}
                  onClick={() => navigate(path)}
                />
              ))}
            </ListGroup>
          </StaggerItem>

          <StaggerItem>
            <SectionHeader>Progression</SectionHeader>
            <Pressable onClick={() => navigate('/statistics')} aria-label="Voir la progression">
              <span className="flex flex-col gap-3 rounded-xl bg-surface px-4 py-3.5">
                <span className="flex items-baseline justify-between">
                  <span className="text-[17px]">Vocabulaire maîtrisé</span>
                  <span className="text-[15px] tabular-nums text-muted">
                    <AnimatedNumber value={Math.round(learnedRatio(data.learnedCount, data.totalCount) * 100)} suffix=" %" />
                  </span>
                </span>
                <span className="block h-1.5 overflow-hidden rounded-full bg-ink/12">
                  <motion.span
                    initial={{ width: 0 }}
                    animate={{ width: `${learnedRatio(data.learnedCount, data.totalCount) * 100}%` }}
                    transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                    className="block h-full rounded-full bg-violet"
                  />
                </span>
              </span>
            </Pressable>
            <Pressable onClick={() => navigate('/recherche')} aria-label="Rechercher dans tes contenus" className="mt-6">
              <span className="flex h-10 items-center gap-2 rounded-[10px] bg-ink/12 px-3 text-[17px] text-muted">
                <Search className="size-[18px]" /> Rechercher dans tes contenus
              </span>
            </Pressable>
          </StaggerItem>
        </Stagger>
      ) : null}
    </PageLayout>
  );
}
