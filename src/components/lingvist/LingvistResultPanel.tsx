import { Check, CircleAlert, Lightbulb, Sparkles, TrendingUp, X } from 'lucide-react';
import { motion } from 'motion/react';

import { Disclosure } from '@/components/ui/collapse';
import { ResultPanel } from '@/components/ui/SessionChrome';
import { WordContexts } from '@/components/vocabulary/WordContexts';
import { WordEnrichmentDetails } from '@/components/vocabulary/WordEnrichmentDetails';
import { getVocabularyLemma } from '@/helpers/vocabularyDisplay';
import { cn } from '@/lib/utils';
import { tokens } from '@/theme';
import type { LingvistCard, LingvistDecision } from '@/types/learning';

function reviewLabel(value?: string): string | null {
  if (!value) return null;
  const milliseconds = Date.parse(value);
  if (!Number.isFinite(milliseconds)) return null;
  const days = Math.round((milliseconds - Date.now()) / 86_400_000);
  if (days <= 0) return 'Reviendra aujourd’hui';
  if (days === 1) return 'Reviendra demain';
  if (days < 30) return `Reviendra dans ${days} jours`;
  return `Reviendra dans ${Math.round(days / 30)} mois`;
}

export function LingvistResultPanel({ card, answer, decision }: {
  card: LingvistCard;
  answer: string;
  decision: LingvistDecision;
}) {
  const success = decision.resultKind === 'success';
  const almost = decision.resultKind === 'almost';
  const dontKnow = decision.resultKind === 'dont_know';
  const expectedDifferent = card.lemma.toLowerCase() !== card.expectedAnswer.toLowerCase();
  const nextReview = reviewLabel(card.srsWord?.prochaine_revision);
  const mastery = Math.max(0, Math.min(4, card.srsWord?.level ?? 0));
  const analysis = decision.analysis;

  return (
    <div className="mt-4 flex flex-col gap-3">
      <ResultPanel
        tone={success ? 'success' : almost ? 'almost' : dontKnow ? 'neutral' : 'error'}
        title={success ? `Exact ! ${decision.responseTimeSeconds} s` : almost ? 'Presque !' : dontKnow ? 'À retenir' : 'Pas encore'}
        icon={success || almost ? <Check /> : dontKnow ? <Lightbulb /> : <X />}
      >
        {!success && !dontKnow && answer.trim() ? (
          <p className="text-sm text-muted line-through">{answer}</p>
        ) : null}
        <p className="text-lg font-bold">
          {expectedDifferent ? `${card.lemma} → ${card.expectedAnswer}` : card.expectedAnswer}
          {card.verbFormLabel ? <span className="font-semibold text-muted"> · {card.verbFormLabel}</span> : null}
        </p>
        {card.wordTraductionFr ? <p className="text-sm font-bold text-violet-soft">= {card.wordTraductionFr}</p> : null}
        <p className="mt-1.5 text-sm italic text-muted">{card.translationFr}</p>
      </ResultPanel>

      {card.srsWord ? (
        <WordEnrichmentDetails
          word={card.srsWord}
          senseKey={card.senseKey}
          maxSenses={card.senseKey ? 1 : 0}
          maxCollocations={2}
          title={card.senseKey ? 'Le sens dans cette phrase' : 'Expressions utiles'}
        />
      ) : null}

      <WordContexts word={card.srsWord ? getVocabularyLemma(card.srsWord) : card.lemma} />

      <div className="rounded-xl bg-surface p-3.5">
        <div className="mb-2 flex items-center justify-between">
          <div>
            <p className="text-[13.5px] font-bold">Maîtrise · niveau {mastery}/4</p>
            {nextReview ? <p className="text-xs text-muted">{nextReview}</p> : null}
          </div>
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }, (_, index) => (
              <motion.span
                key={index}
                initial={{ scale: 0, rotate: -40 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 14, delay: 0.25 + index * 0.08 }}
                className={cn('text-lg', index < decision.stars ? 'text-amber' : 'text-ink/15')}
                style={index < decision.stars ? { filter: `drop-shadow(0 0 6px ${tokens.amber})` } : undefined}
              >
                ★
              </motion.span>
            ))}
          </div>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="h-2 flex-1 overflow-hidden rounded-full bg-ink/8">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: index < mastery ? '100%' : 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.12 }}
                className="h-full bg-grad-mint"
              />
            </div>
          ))}
        </div>
      </div>

      {analysis ? (
        <Disclosure
          defaultOpen={!success}
          summary={(
            <span className="flex items-center gap-2">
              <Sparkles className="size-5 text-violet-soft" />
              <span className="font-bold">Analyse de ta réponse</span>
            </span>
          )}
        >
          <p className="leading-[1.7] text-muted">{analysis.explanation}</p>
          <div className="mt-3.5 flex flex-col gap-3">
            {analysis.examples[0] ? <AnalysisLine icon={<Lightbulb />} label="Exemple" text={analysis.examples[0]} color={tokens.amber} /> : null}
            {analysis.usageCases[0] ? <AnalysisLine icon={<TrendingUp />} label="Usage" text={analysis.usageCases[0]} color={tokens.cyan} /> : null}
            {analysis.commonMistakes[0] ? <AnalysisLine icon={<CircleAlert />} label="Erreur fréquente" text={analysis.commonMistakes[0]} color={tokens.pink} /> : null}
          </div>
        </Disclosure>
      ) : null}
    </div>
  );
}

function AnalysisLine({ icon, label, text, color }: { icon: React.ReactNode; label: string; text: string; color: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 [&_svg]:size-5" style={{ color }}>{icon}</span>
      <div>
        <span className="type-overline" style={{ color }}>{label}</span>
        <p className="text-sm">{text}</p>
      </div>
    </div>
  );
}
