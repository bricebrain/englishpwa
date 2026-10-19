import { CircleCheck, ListPlus, Sparkles, ThumbsUp } from 'lucide-react';
import { motion } from 'motion/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { aiFeaturesApi } from '@/api/aiFeaturesApi';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/form';
import { usePreferences } from '@/hooks/usePreferences';
import { celebrate, feedback } from '@/services/feedbackService';
import { speakEnglish } from '@/services/speechPlaybackService';
import { awardXp } from '@/services/xpService';

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
    <Card className="mt-4">
      <CardContent className="p-[18px] sm:p-6">
        <div className="flex items-center gap-2">
          <Sparkles className="size-6 text-violet" />
          <h2 className="type-h2">Analyser le bilan</h2>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          L’IA repère tes erreurs récurrentes et les expressions à revoir, que tu peux ajouter à tes révisions.
        </p>

        {!result ? (
          <Button
            size="lg" className="mt-4 w-full"
            disabled={report.trim().length < MIN_REPORT || analysis.isPending}
            onClick={() => analysis.mutate()}
          >
            <Sparkles />{analysis.isPending ? 'Analyse en cours…' : 'Analyser avec l’IA'}
          </Button>
        ) : null}
        {analysis.isError ? <Alert severity="error" className="mt-4">L’analyse n’a pas pu aboutir. Réessaie dans un instant.</Alert> : null}

        {result ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-4 flex flex-col gap-4">
            {result.summaryFr ? <p className="leading-relaxed">{result.summaryFr}</p> : null}

            {result.strengths.length ? (
              <div>
                <span className="type-overline text-mint">Points forts</span>
                {result.strengths.map((item) => (
                  <div key={item} className="mt-1.5 flex items-start gap-2">
                    <ThumbsUp className="mt-0.5 size-[18px] shrink-0 text-mint" />
                    <p className="text-[14.5px]">{item}</p>
                  </div>
                ))}
              </div>
            ) : null}

            {result.errors.length ? (
              <div>
                <span className="type-overline text-red">Erreurs récurrentes</span>
                <div className="mt-1.5 flex flex-col gap-2">
                  {result.errors.map((item) => (
                    <div key={item.wrong} className="rounded-xl border border-red/20 bg-red/6 p-3">
                      <p className="text-[14.5px]">
                        <span className="text-red line-through">{item.wrong}</span>
                        {' → '}
                        <strong className="text-mint">{item.correct}</strong>
                      </p>
                      {item.explanationFr ? <p className="mt-0.5 text-[13px] text-muted">{item.explanationFr}</p> : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {result.expressions.length ? (
              <div>
                <span className="type-overline text-violet-soft">Expressions à revoir</span>
                <div className="mt-1 flex flex-col gap-1">
                  {result.expressions.map((item) => (
                    <label key={item.en} className="flex cursor-pointer items-start gap-3 rounded-xl px-1 py-2">
                      <Checkbox
                        className="mt-0.5"
                        checked={selected.has(item.en)}
                        disabled={addToSrs.isSuccess}
                        onCheckedChange={(checked) => setSelected((current) => {
                          const next = new Set(current);
                          if (checked === true) next.add(item.en); else next.delete(item.en);
                          return next;
                        })}
                      />
                      <span className="flex-1">
                        <span className="block text-[14.5px] font-bold" onClick={(event) => { event.preventDefault(); speakEnglish(item.en); }}>
                          {item.en} <span className="font-medium text-muted">= {item.fr}</span>
                        </span>
                        {item.example ? <span className="block text-[13px] italic text-muted">{item.example}</span> : null}
                      </span>
                    </label>
                  ))}
                </div>
                {addToSrs.isSuccess ? (
                  <div className="mt-3 flex items-center gap-2 text-mint">
                    <CircleCheck className="size-6" />
                    <p className="font-bold">{addToSrs.data} expression{addToSrs.data > 1 ? 's' : ''} ajoutée{addToSrs.data > 1 ? 's' : ''} à tes révisions</p>
                  </div>
                ) : (
                  <Button
                    variant="success" className="mt-3 w-full"
                    disabled={!chosen.length || addToSrs.isPending}
                    onClick={() => addToSrs.mutate(chosen)}
                  >
                    <ListPlus />{addToSrs.isPending ? 'Ajout…' : `Ajouter ${chosen.length} expression${chosen.length > 1 ? 's' : ''} au SRS`}
                  </Button>
                )}
                {addToSrs.isError ? <Alert severity="error" className="mt-3">L’ajout n’a pas pu être enregistré.</Alert> : null}
              </div>
            ) : null}
          </motion.div>
        ) : null}
      </CardContent>
    </Card>
  );
}
