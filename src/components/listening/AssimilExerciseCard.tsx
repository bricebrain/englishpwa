import CheckRounded from '@mui/icons-material/CheckRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';
import { Box, Button, Card, CardContent, Chip, InputBase, Stack, Typography } from '@mui/material';
import { useState } from 'react';

import { ComboBadge } from '@/components/ui/Gamification';
import { MotionBox } from '@/components/ui/motion';
import { ResultPanel } from '@/components/ui/SessionChrome';
import { useCombo } from '@/hooks/useCombo';
import { evaluateSentence } from '@/helpers/sentenceEvaluation';
import { celebrate } from '@/services/feedbackService';
import { gradients, tokens } from '@/theme';
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
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5} gap={1}>
          <Chip label={TYPE_LABELS[exercise.type] ?? exercise.type} size="small" sx={{ background: gradients.sunrise, color: '#fff' }} />
          <Stack direction="row" alignItems="center" gap={1}>
            <ComboBadge combo={combo.combo} />
            <Stack direction="row" gap={0.5}>
              {exercise.items.map((_, index) => (
                <Box key={index} sx={{ width: 18, height: 6, borderRadius: 9, background: index < itemIndex ? tokens.mint : index === itemIndex && !completed ? tokens.violet : 'rgba(255,255,255,0.1)', transition: 'background .3s' }} />
              ))}
            </Stack>
          </Stack>
        </Stack>
        <Typography fontWeight={750} color="text.secondary" fontSize={14.5}>{exercise.instructionFr}</Typography>
        {completed ? (
          <MotionBox initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} mt={2}>
            <ResultPanel tone={score === exercise.items.length ? 'success' : 'neutral'} title={`Terminé : ${score}/${exercise.items.length}`} icon={<CheckRounded />} />
          </MotionBox>
        ) : item ? (
          <MotionBox key={itemIndex} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}>
            <Stack gap={1.5} mt={2}>
              <Typography fontSize={19} fontWeight={750} lineHeight={1.45}>{item.prompt}</Typography>
              <InputBase
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                onKeyDown={(event) => { if (event.key === 'Enter') { if (result === null) validate(); else next(); } }}
                disabled={result !== null}
                placeholder="Ta réponse…"
                inputProps={{ autoCapitalize: 'none', autoComplete: 'off', 'aria-label': 'Ta réponse' }}
                sx={{
                  px: 2, py: 1, borderRadius: 4, fontSize: 17, fontWeight: 650,
                  background: 'rgba(255,255,255,0.05)', border: `2px solid ${tokens.border}`,
                  '&.Mui-focused': { borderColor: tokens.violet, boxShadow: '0 0 0 4px rgba(139,108,255,0.18)' },
                }}
              />
              {result !== null ? (
                <ResultPanel tone={result ? 'success' : 'error'} title={result ? 'Bonne réponse !' : 'Réponse attendue'} icon={result ? <CheckRounded /> : <CloseRounded />}>
                  {!result ? <Typography fontWeight={750}>{item.answer}</Typography> : null}
                  {!result && item.hintFr ? <Typography fontSize={13} color="text.secondary" mt={0.5}>{item.hintFr}</Typography> : null}
                </ResultPanel>
              ) : null}
              <Button variant="contained" color={result ? 'success' : 'primary'} disabled={!answer.trim()} onClick={result === null ? validate : next}>
                {result === null ? 'Vérifier' : 'Suivant'}
              </Button>
            </Stack>
          </MotionBox>
        ) : null}
      </CardContent>
    </Card>
  );
}
