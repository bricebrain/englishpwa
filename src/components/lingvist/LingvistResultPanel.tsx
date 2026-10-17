import AutoAwesomeRounded from '@mui/icons-material/AutoAwesomeRounded';
import CheckRounded from '@mui/icons-material/CheckRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';
import ErrorOutlineRounded from '@mui/icons-material/ErrorOutlineRounded';
import ExpandMoreRounded from '@mui/icons-material/ExpandMoreRounded';
import LightbulbRounded from '@mui/icons-material/LightbulbRounded';
import TrendingUpRounded from '@mui/icons-material/TrendingUpRounded';
import { Accordion, AccordionDetails, AccordionSummary, Box, Stack, Typography } from '@mui/material';

import { MotionBox } from '@/components/ui/motion';
import { ResultPanel } from '@/components/ui/SessionChrome';
import { WordContexts } from '@/components/vocabulary/WordContexts';
import { WordEnrichmentDetails } from '@/components/vocabulary/WordEnrichmentDetails';
import { getVocabularyLemma } from '@/helpers/vocabularyDisplay';
import { gradients, tokens } from '@/theme';
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
    <Stack gap={1.5} mt={2}>
      <ResultPanel
        tone={success ? 'success' : almost ? 'almost' : dontKnow ? 'neutral' : 'error'}
        title={success ? `Exact ! ${decision.responseTimeSeconds} s` : almost ? 'Presque !' : dontKnow ? 'À retenir' : 'Pas encore'}
        icon={success || almost ? <CheckRounded /> : dontKnow ? <LightbulbRounded /> : <CloseRounded />}
      >
        {!success && !dontKnow && answer.trim() ? (
          <Typography fontSize={14} color="text.secondary" sx={{ textDecoration: 'line-through' }}>{answer}</Typography>
        ) : null}
        <Typography fontWeight={800} fontSize={18}>
          {expectedDifferent ? `${card.lemma} → ${card.expectedAnswer}` : card.expectedAnswer}
          {card.verbFormLabel ? <Typography component="span" color="text.secondary" fontWeight={600}> · {card.verbFormLabel}</Typography> : null}
        </Typography>
        {card.wordTraductionFr ? <Typography fontSize={14} color={tokens.violetSoft} fontWeight={700}>= {card.wordTraductionFr}</Typography> : null}
        <Typography fontSize={14} fontStyle="italic" color="text.secondary" mt={0.75}>{card.translationFr}</Typography>
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

      <Box sx={{ p: 1.75, borderRadius: 4, background: 'rgba(49,39,78,0.035)', border: `1px solid ${tokens.border}` }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
          <Box>
            <Typography fontWeight={750} fontSize={13.5}>Maîtrise · niveau {mastery}/4</Typography>
            {nextReview ? <Typography color="text.secondary" fontSize={12}>{nextReview}</Typography> : null}
          </Box>
          <Stack direction="row" gap={0.25}>
            {Array.from({ length: 5 }, (_, index) => (
              <MotionBox
                key={index}
                component="span"
                initial={{ scale: 0, rotate: -40 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 14, delay: 0.25 + index * 0.08 }}
                sx={{ fontSize: 18, color: index < decision.stars ? tokens.amber : 'rgba(49,39,78,0.15)', filter: index < decision.stars ? `drop-shadow(0 0 6px ${tokens.amber})` : 'none' }}
              >
                ★
              </MotionBox>
            ))}
          </Stack>
        </Stack>
        <Stack direction="row" gap={0.5}>
          {Array.from({ length: 4 }, (_, index) => (
            <Box key={index} flex={1} height={8} borderRadius={9} sx={{ background: 'rgba(49,39,78,0.08)', overflow: 'hidden' }}>
              <MotionBox
                initial={{ width: 0 }}
                animate={{ width: index < mastery ? '100%' : 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.12 }}
                sx={{ height: '100%', background: gradients.mint }}
              />
            </Box>
          ))}
        </Stack>
      </Box>

      {analysis ? (
        <Accordion defaultExpanded={!success} disableGutters elevation={0} sx={{ border: `1px solid ${tokens.border}`, '&:before': { display: 'none' } }}>
          <AccordionSummary expandIcon={<ExpandMoreRounded />}>
            <Stack direction="row" gap={1} alignItems="center">
              <AutoAwesomeRounded sx={{ color: tokens.violetSoft }} fontSize="small" />
              <Typography fontWeight={800}>Analyse de ta réponse</Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Typography lineHeight={1.7} color="text.secondary">{analysis.explanation}</Typography>
            <Stack gap={1.5} mt={1.75}>
              {analysis.examples[0] ? <AnalysisLine icon={<LightbulbRounded />} label="Exemple" text={analysis.examples[0]} color={tokens.amber} /> : null}
              {analysis.usageCases[0] ? <AnalysisLine icon={<TrendingUpRounded />} label="Usage" text={analysis.usageCases[0]} color={tokens.cyan} /> : null}
              {analysis.commonMistakes[0] ? <AnalysisLine icon={<ErrorOutlineRounded />} label="Erreur fréquente" text={analysis.commonMistakes[0]} color={tokens.pink} /> : null}
            </Stack>
          </AccordionDetails>
        </Accordion>
      ) : null}
    </Stack>
  );
}

function AnalysisLine({ icon, label, text, color }: { icon: React.ReactNode; label: string; text: string; color: string }) {
  return (
    <Stack direction="row" gap={1.25} alignItems="flex-start">
      <Box sx={{ color, mt: 0.1, '& svg': { fontSize: 20 } }}>{icon}</Box>
      <Box>
        <Typography variant="overline" color={color}>{label}</Typography>
        <Typography fontSize={14}>{text}</Typography>
      </Box>
    </Stack>
  );
}
