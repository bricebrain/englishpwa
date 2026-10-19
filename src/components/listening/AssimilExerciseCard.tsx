import { Check, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { Input } from '@/components/ui/form';
import { ComboBadge } from '@/components/ui/Gamification';
import { ResultPanel } from '@/components/ui/SessionChrome';
import { useCombo } from '@/hooks/useCombo';
import { evaluateSentence } from '@/helpers/sentenceEvaluation';
import { cn } from '@/lib/utils';
import { celebrate } from '@/services/feedbackService';
import type { AssimilArtifact } from '@/types/learning';

type Exercise = AssimilArtifact['exercises'][number];

const TYPE_LABELS: Record<Exercise['type'], string> = {
  dictation: 'Dictée',
  fill_blank: 'Texte à trous',
  translation: 'Traduction',
  shadowing: 'Shadowing',
};

export function AssimilExerciseCard({ exercise }: { exercise: Exercise }) {
  const [itemIndex, setItemIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const combo = useCombo(8);
  const completed = itemIndex >= exercise.items.length;
  const item = exercise.items[Math.min(itemIndex, exercise.items.length - 1)];

  const validate = () => {
    if (!item || !answer.trim()) return;
    const correct = evaluateSentence(answer, item.answer);
    setResult(correct);
    if (correct) { setScore((value) => value + 1); combo.hit(); } else combo.miss();
  };

  const next = () => {
    const nextIndex = itemIndex + 1;
    setItemIndex(nextIndex);
    setAnswer('');
    setResult(null);
    if (nextIndex >= exercise.items.length) void celebrate('small');
  };

  return (
    <Card>
      <CardContent>
        <div className="mb-3 flex items-center justify-between gap-2">
          <Chip size="sm" label={TYPE_LABELS[exercise.type] ?? exercise.type} className="bg-violet/12 text-violet" />
          <div className="flex items-center gap-2">
            <ComboBadge combo={combo.combo} />
            <div className="flex gap-1">
              {exercise.items.map((_, index) => (
                <span
                  key={index}
                  className={cn(
                    'h-1.5 w-[18px] rounded-full transition-colors duration-300',
                    index < itemIndex ? 'bg-mint' : index === itemIndex && !completed ? 'bg-violet' : 'bg-ink/10',
                  )}
                />
              ))}
            </div>
          </div>
        </div>
        <p className="text-[14.5px] font-bold text-muted">{exercise.instructionFr}</p>
        {completed ? (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mt-4">
            <ResultPanel tone={score === exercise.items.length ? 'success' : 'neutral'} title={`Terminé : ${score}/${exercise.items.length}`} icon={<Check />} />
          </motion.div>
        ) : item ? (
          <motion.div key={itemIndex} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}>
            <div className="mt-4 flex flex-col gap-3">
              <p className="text-[19px] font-bold leading-[1.45]">{item.prompt}</p>
              <Input
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                onKeyDown={(event) => { if (event.key === 'Enter') { if (result === null) validate(); else next(); } }}
                disabled={result !== null}
                placeholder="Ta réponse…"
                autoCapitalize="none"
                autoComplete="off"
                aria-label="Ta réponse"
                className="text-[17px] font-semibold"
              />
              {result !== null ? (
                <ResultPanel tone={result ? 'success' : 'error'} title={result ? 'Bonne réponse !' : 'Réponse attendue'} icon={result ? <Check /> : <X />}>
                  {!result ? <p className="font-bold">{item.answer}</p> : null}
                  {!result && item.hintFr ? <p className="mt-1 text-[13px] text-muted">{item.hintFr}</p> : null}
                </ResultPanel>
              ) : null}
              <Button variant={result ? 'success' : 'primary'} disabled={!answer.trim()} onClick={result === null ? validate : next}>
                {result === null ? 'Vérifier' : 'Suivant'}
              </Button>
            </div>
          </motion.div>
        ) : null}
      </CardContent>
    </Card>
  );
}
