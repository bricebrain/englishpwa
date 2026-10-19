import { ArrowRight, BookOpen, BookOpenText, Headphones, Layers, MessageCircle, MoveHorizontal, PenLine, Search, type LucideIcon } from 'lucide-react';
import { motion, useScroll, useTransform } from 'motion/react';
import { useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { PageHeader } from '@/components/common/PageHeader';
import { QueryState } from '@/components/common/QueryState';
import { DailyStoryCard } from '@/components/home/DailyStoryCard';
import { WeekStrip } from '@/components/home/WeekStrip';
import { PageLayout } from '@/components/layout/PageLayout';
import { SectionHeader } from '@/components/ui/list';
import { AnimatedNumber, Pressable } from '@/components/ui/motion';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { Aurora } from '@/components/vivid/Aurora';
import { Reveal } from '@/components/vivid/Reveal';
import { ThemeToggle } from '@/components/vivid/ThemeToggle';
import { learnedRatio } from '@/helpers/progressRatio';
import { useDashboard } from '@/hooks/useLearningQueries';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { usePreferences } from '@/hooks/usePreferences';
import { cn } from '@/lib/utils';

const EXPLORE: { title: string; subtitle: string; path: string; icon: LucideIcon; grad: string; tint: string }[] = [
  { title: 'Flashcards', subtitle: 'Cartes à retourner', path: '/flashcards', icon: Layers, grad: 'bg-grad-ocean', tint: '#2f80ff' },
  { title: 'Tri rapide', subtitle: 'Classer les mots', path: '/lingvist-triage', icon: MoveHorizontal, grad: 'bg-grad-mint', tint: '#20b26b' },
  { title: 'Écouter', subtitle: 'Assimil et audios', path: '/ecouter', icon: Headphones, grad: 'bg-grad-sunrise', tint: '#ff5a5f' },
  { title: 'Lire', subtitle: 'Articles guidés', path: '/lire', icon: BookOpenText, grad: 'bg-grad-berry', tint: '#b84cf5' },
];

function todayLabel() {
  return new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
}

function greeting(name: string) {
  const h = new Date().getHours();
  const hello = h < 5 ? 'Bonne nuit' : h < 12 ? 'Bonjour' : h < 18 ? 'Bon après-midi' : 'Bonsoir';
  return name.trim() ? `${hello}, ${name.trim().split(' ')[0]}` : hello;
}

/** Carte d'activité du programme : grand aplat en dégradé, icône dans une bulle, durée. */
function ProgramCard({ title, subtitle, minutes, icon: Icon, grad, onClick, index }: {
  title: string; subtitle: string; minutes: number; icon: LucideIcon; grad: string; onClick: () => void; index: number;
}) {
  return <motion.button type="button" onClick={onClick} whileTap={{ scale: 0.96 }}
    initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 24, delay: 0.15 + index * 0.08 }}
    className={cn('relative flex w-[72%] shrink-0 snap-start flex-col justify-between overflow-hidden rounded-[26px] p-4 text-left text-white sm:w-[46%]', grad)}
    style={{ minHeight: 164, boxShadow: '0 18px 36px -18px rgb(40 20 90 / 0.55)' }}>
    <span aria-hidden className="absolute -right-6 -top-6 size-28 rounded-full bg-white/15" />
    <span aria-hidden className="absolute -bottom-10 right-8 size-24 rounded-full bg-white/10" />
    <span className="relative grid size-11 place-items-center rounded-2xl bg-white/22 backdrop-blur-sm"><Icon className="size-[22px]" /></span>
    <span className="relative mt-6 block">
      <span className="block text-[19px] font-bold leading-tight tracking-tight">{title}</span>
      <span className="mt-0.5 block text-[14px] text-white/80">{subtitle}</span>
    </span>
    <span className="relative mt-3 inline-flex w-fit items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-[13px] font-semibold">{minutes} min <ArrowRight className="size-3.5" /></span>
  </motion.button>;
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

  // Parallaxe : l'aurore de la grande carte glisse moins vite que la page.
  const hero = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: hero, offset: ['start start', 'end start'] });
  const auroraY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.94]);

  return (
    <PageLayout>
      <PageHeader
        eyebrow={todayLabel()}
        title={greeting(preferences.profile.name)}
        trailing={(
          <span className="flex items-center gap-2">
            <ThemeToggle />
            <Pressable onClick={() => navigate('/profile')} aria-label="Ouvrir le profil" className="w-auto rounded-full">
              <span className="grid size-9 place-items-center rounded-full bg-grad-primary text-base font-semibold text-white">{initial}</span>
            </Pressable>
          </span>
        )}
      />

      <QueryState loading={dashboard.isLoading} error={dashboard.isError} offline={!online} onRetry={() => dashboard.refetch()} />

      {data ? (
        <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
          {/* Grande carte : aurore animée, anneau de l'objectif, action principale. */}
          <motion.div ref={hero} style={{ scale: heroScale }} initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 160, damping: 20 }}
            className="relative mt-2 overflow-hidden rounded-[30px] bg-[#1b1340] p-5 text-white sm:col-span-2"
            >
            <motion.span aria-hidden className="absolute inset-0" style={{ y: auroraY }}><Aurora /></motion.span>
            <span aria-hidden className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/5 to-black/30" />
            <div className="relative flex items-center gap-5">
              <ProgressRing value={ratio} size={108} stroke={10} colors={['#ffffff', '#ffe08a']} track="rgb(255 255 255 / 0.22)" glow>
                <span className="text-[26px] font-bold tabular-nums tracking-tight">
                  <AnimatedNumber value={Math.round(ratio * 100)} suffix="%" />
                </span>
              </ProgressRing>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-white/75">Objectif du jour</p>
                <p className="mt-1 text-[26px] font-bold leading-[1.1] tracking-tight">
                  <AnimatedNumber value={data.reviewedToday} /> <span className="text-white/70">/ {goal} mots</span>
                </p>
                <p className="mt-1 text-[15px] text-white/80">
                  {wordsDone ? 'Objectif atteint, bravo !' : `${data.dueCount} en attente · ≈ ${Math.max(2, Math.round(remaining * 0.35))} min`}
                </p>
              </div>
            </div>
            <motion.button type="button" whileTap={{ scale: 0.97 }} onClick={() => navigate('/lingvist')}
              className="relative mt-5 flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-white text-[17px] font-semibold text-[#3b2bd6] shadow-[0_12px_30px_-12px_rgb(0_0_0/0.5)]">
              {data.reviewedToday > 0 ? 'Continuer la révision' : 'Commencer la révision'}<ArrowRight className="size-5" />
            </motion.button>
          </motion.div>

          {/* Programme du jour : cartes colorées qui défilent au doigt. */}
          <div className="sm:col-span-2">
            <SectionHeader>Programme du jour</SectionHeader>
            <div className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-4 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <ProgramCard index={0} title={`Réviser ${Math.max(remaining, 10)} mots`} subtitle="Lingvist · rappel actif" minutes={7} icon={BookOpen} grad="bg-grad-primary" onClick={() => navigate('/lingvist')} />
              <ProgramCard index={1} title="Construire des phrases" subtitle="Avec tes mots du jour" minutes={5} icon={PenLine} grad="bg-grad-sunrise" onClick={() => navigate('/phrases')} />
              <ProgramCard index={2} title="Séance Live" subtitle="Conversation avec le coach" minutes={3} icon={MessageCircle} grad="bg-grad-mint" onClick={() => navigate('/live')} />
            </div>
          </div>

          <Reveal><DailyStoryCard /></Reveal>

          <Reveal>
            <SectionHeader>Cette semaine</SectionHeader>
            <div className="flex flex-col gap-3 rounded-[22px] bg-surface px-4 py-4 shadow-card">
              <WeekStrip activeDays={data.activeDays} />
              <p className="text-[15px] text-muted">
                {data.streak > 1 ? `${data.streak} jours d’affilée` : `${activeCount} jour${activeCount > 1 ? 's' : ''} de pratique`} · {data.learnedCount.toLocaleString('fr-FR')} mots maîtrisés
              </p>
            </div>
          </Reveal>

          {/* Explorer : tuiles teintées, icône en dégradé qui flotte. */}
          <Reveal className="sm:col-span-2">
            <SectionHeader>Explorer</SectionHeader>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {EXPLORE.map(({ title, subtitle, path, icon: Icon, grad, tint }, i) => (
                <motion.button key={path} type="button" whileTap={{ scale: 0.95 }} onClick={() => navigate(path)}
                  className="relative flex flex-col items-start gap-3 overflow-hidden rounded-[22px] p-4 text-left"
                  style={{ background: `color-mix(in srgb, ${tint} 11%, var(--surface))` }}>
                  <span className={cn('float-soft grid size-12 place-items-center rounded-2xl text-white shadow-[0_10px_20px_-10px_rgb(0_0_0/0.45)]', grad)}
                    style={{ animationDelay: `${-i * 1.2}s` }}><Icon className="size-6" /></span>
                  <span>
                    <span className="block text-[17px] font-semibold leading-tight">{title}</span>
                    <span className="block text-[13px] text-muted">{subtitle}</span>
                  </span>
                </motion.button>
              ))}
            </div>
          </Reveal>

          <Reveal className="sm:col-span-2">
            <SectionHeader>Progression</SectionHeader>
            <Pressable onClick={() => navigate('/statistics')} aria-label="Voir la progression">
              <span className="flex flex-col gap-3 rounded-[22px] bg-surface px-4 py-4 shadow-card">
                <span className="flex items-baseline justify-between">
                  <span className="text-[17px] font-semibold">Vocabulaire maîtrisé</span>
                  <span className="text-gradient text-[22px] font-bold tabular-nums">
                    <AnimatedNumber value={Math.round(learnedRatio(data.learnedCount, data.totalCount) * 100)} suffix=" %" />
                  </span>
                </span>
                <span className="block h-2.5 overflow-hidden rounded-full bg-ink/10">
                  <motion.span
                    initial={{ width: 0 }}
                    whileInView={{ width: `${learnedRatio(data.learnedCount, data.totalCount) * 100}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                    className="block h-full rounded-full bg-grad-primary"
                  />
                </span>
              </span>
            </Pressable>
            <Pressable onClick={() => navigate('/recherche')} aria-label="Rechercher dans tes contenus" className="mt-6">
              <span className="flex h-11 items-center gap-2 rounded-2xl bg-ink/8 px-3.5 text-[17px] text-muted">
                <Search className="size-[18px]" /> Rechercher dans tes contenus
              </span>
            </Pressable>
          </Reveal>
        </div>
      ) : null}
    </PageLayout>
  );
}
