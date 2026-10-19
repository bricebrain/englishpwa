import { BadgeCheck, CalendarCheck, CalendarDays, ChartLine, Zap } from 'lucide-react';
import { motion } from 'motion/react';

import { PageHeader } from '@/components/common/PageHeader';
import { QueryState } from '@/components/common/QueryState';
import { WeekStrip } from '@/components/home/WeekStrip';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { AnimatedNumber, Stagger, StaggerItem } from '@/components/ui/motion';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { IconTile } from '@/components/ui/SessionChrome';
import { learnedRatio } from '@/helpers/progressRatio';
import { useStatistics } from '@/hooks/useLearningQueries';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useXp } from '@/hooks/useXp';
import { cn } from '@/lib/utils';
import { lastSevenDays } from '@/services/xpService';
import { gradients, tokens } from '@/theme';

const dayLabels = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const shortDay = (date: Date) => ['D', 'L', 'M', 'M', 'J', 'V', 'S'][date.getDay()]!;

function Bars({ values, labels, gradient, highlightLast = true }: { values: number[]; labels: string[]; gradient: string; highlightLast?: boolean }) {
  const max = Math.max(1, ...values);
  return (
    <div className="flex h-[150px] items-end gap-2">
      {values.map((value, index) => {
        const last = highlightLast && index === values.length - 1;
        return (
          <div key={`${labels[index]}-${index}`} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
            <span className={cn('text-[10.5px] font-bold', last ? 'text-fg' : 'text-muted')}>{value}</span>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${Math.max(4, value / max * 78)}%` }}
              transition={{ type: 'spring', stiffness: 120, damping: 16, delay: 0.2 + index * 0.06 }}
              className={cn('w-full max-w-[30px] rounded-[10px_10px_4px_4px]', !last && 'bg-ink/10')}
              style={last ? { background: gradient } : undefined}
            />
            <span className={cn('text-[11px] font-bold', last ? 'text-violet-soft' : 'text-faint')}>{labels[index]}</span>
          </div>
        );
      })}
    </div>
  );
}

export function StatisticsPage() {
  const online = useNetworkStatus();
  const query = useStatistics();
  const stats = query.data;
  const xp = useXp();
  const week = lastSevenDays(xp);

  return (
    <PageLayout>
      <PageHeader back eyebrow="Ton parcours" title="Progression" subtitle="Cadence, rétention et signaux pédagogiques" />

      <Card className="mb-4 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_120%_at_100%_0%,color-mix(in_srgb,var(--pink)_16%,transparent),transparent_60%)]" />
        <CardContent className="relative p-5 sm:p-6">
          <div className="flex items-center gap-5">
            <ProgressRing value={xp.progress} size={112} stroke={11}>
              <div className="text-center">
                <p className="text-[11px] font-bold text-muted">NIVEAU</p>
                <p className="font-display text-[40px] font-bold leading-none">{xp.level}</p>
              </div>
            </ProgressRing>
            <div className="min-w-0 flex-1">
              <p className="text-gradient font-display text-[28px] font-bold">
                <AnimatedNumber value={xp.totalXp} /> XP
              </p>
              <p className="text-[13.5px] text-muted">
                Encore {xp.levelSize - xp.intoLevel} XP avant le niveau {xp.level + 1}
              </p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                <Chip size="sm" icon={<Zap className="fill-current text-amber" />} label={`${xp.todayXp} XP aujourd’hui`} />
                <Chip size="sm" label={`Meilleur combo ×${xp.bestCombo}`} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <QueryState loading={query.isLoading} error={query.isError} offline={!online} onRetry={() => query.refetch()} />
      {stats ? (
        <Stagger gap={0.06} className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { label: 'Jours de suite', value: stats.streak, icon: <CalendarCheck />, gradient: gradients.sunrise, color: tokens.amber },
            { label: 'Aujourd’hui', value: stats.reviewedToday, icon: <CalendarDays />, gradient: gradients.ocean, color: tokens.cyan },
            { label: 'Mots appris', value: stats.learnedCount, icon: <BadgeCheck />, gradient: gradients.mint, color: tokens.mint },
            { label: 'Rétention', value: stats.retentionRate, suffix: '%', icon: <ChartLine />, gradient: gradients.primary, color: tokens.violetSoft },
          ].map(({ label, value, suffix, icon, gradient, color }) => (
            <StaggerItem key={label} className="h-full">
              <Card className="h-full">
                <CardContent>
                  <IconTile icon={icon} gradient={gradient} size={38} radius={12} />
                  <p className="mt-2.5 font-display text-[28px] font-bold leading-[1.1] sm:text-[32px]" style={{ color }}>
                    <AnimatedNumber value={value} suffix={suffix} />
                  </p>
                  <p className="text-[12.5px] font-semibold text-muted">{label}</p>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}

          <StaggerItem className="col-span-2 h-full">
            <Card className="h-full">
              <CardContent>
                <h3 className="type-h3 mb-4">Révisions de la semaine</h3>
                <WeekStrip activeDays={stats.activeDays} />
                <div className="mt-6"><Bars values={stats.weeklyReviews} labels={dayLabels} gradient={gradients.primary} /></div>
              </CardContent>
            </Card>
          </StaggerItem>

          <StaggerItem className="col-span-2 h-full">
            <Card className="h-full">
              <CardContent>
                <div className="mb-4 flex items-baseline justify-between">
                  <h3 className="type-h3">XP sur 7 jours</h3>
                  <p className="text-[13px] text-muted">sur cet appareil</p>
                </div>
                <Bars values={week.map((day) => day.xp)} labels={week.map((day) => shortDay(day.date))} gradient={gradients.sunrise} />
              </CardContent>
            </Card>
          </StaggerItem>

          <StaggerItem className="col-span-2">
            <Card>
              <CardContent>
                <div className="mb-2.5 flex justify-between">
                  <h3 className="type-h3">Vocabulaire maîtrisé</h3>
                  <p className="text-gradient font-bold">{stats.learnedCount}/{stats.totalCount}</p>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-ink/8">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${learnedRatio(stats.learnedCount, stats.totalCount) * 100}%` }}
                    transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                    className="h-full rounded-full bg-grad-primary"
                  />
                </div>
              </CardContent>
            </Card>
          </StaggerItem>

          <StaggerItem className="col-span-2">
            <Card>
              <CardContent>
                <h3 className="type-h3 mb-3">Diagnostic</h3>
                <span className="type-overline mb-1.5 text-mint">Points forts</span>
                <div className="flex flex-wrap gap-2">
                  {stats.strengths.map((item) => <Chip key={item} label={item} className="bg-mint/12 text-mint" />)}
                </div>
                <span className="type-overline mb-1.5 mt-4 text-amber">À renforcer</span>
                <div className="flex flex-wrap gap-2">
                  {stats.focusAreas.map((item) => <Chip key={item} label={item} className="bg-amber/12 text-amber" />)}
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
        </Stagger>
      ) : null}
    </PageLayout>
  );
}
