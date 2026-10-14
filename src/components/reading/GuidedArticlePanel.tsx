import AddRounded from '@mui/icons-material/AddRounded';
import CheckRounded from '@mui/icons-material/CheckRounded';
import HelpRounded from '@mui/icons-material/HelpRounded';
import VolumeUpRounded from '@mui/icons-material/VolumeUpRounded';
import { Box, Button, Card, CardContent, Chip, IconButton, Stack, Typography } from '@mui/material';
import { useState } from 'react';

import { QueryState } from '@/components/common/QueryState';
import { MotionBox, Pressable } from '@/components/ui/motion';
import { usePromoteReadingVocabulary, useReadingSegments } from '@/hooks/useReadingLibrary';
import { feedback } from '@/services/feedbackService';
import { speakEnglish } from '@/services/speechPlaybackService';
import { awardXp } from '@/services/xpService';
import { displayFont, gradients, tokens } from '@/theme';
import type { ReadingItem } from '@/types/reading';

export function GuidedArticlePanel({ item }: { item: ReadingItem }) {
  const query = useReadingSegments(item.id);
  const promote = usePromoteReadingVocabulary();
  const [revealed, setRevealed] = useState<Set<string>>(() => new Set());
  const [added, setAdded] = useState<Set<string>>(() => new Set());

  return (
    <Stack gap={2}>
      <Box sx={{ p: 2.5, borderRadius: 6, background: 'linear-gradient(135deg, rgba(255,93,162,0.16), rgba(139,108,255,0.14))', border: '1px solid rgba(255,93,162,0.25)' }}>
        <Stack direction="row" gap={1} mb={1.25}>
          <Chip label={item.level} size="small" sx={{ background: gradients.primary, color: '#fff' }} />
          <Chip label={`${item.wordCount} mots`} size="small" />
        </Stack>
        <Typography variant="h1" fontSize={26}>{item.title}</Typography>
        <Typography color="text.secondary" mt={1} lineHeight={1.6}>{item.summaryFr ?? item.description}</Typography>
      </Box>

      <QueryState loading={query.isLoading} error={query.isError} empty={!query.data?.length} onRetry={() => query.refetch()} />
      {query.data?.map((segment) => {
        const question = segment.questions[0];
        const showAnswer = revealed.has(segment.id);
        const isAdded = added.has(segment.id);
        return (
          <Card key={segment.id}>
            <CardContent sx={{ p: { xs: 2.25, sm: 3 } }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="overline" color={tokens.pink}>Partie {segment.segmentIndex + 1}</Typography>
                <IconButton aria-label="Écouter cette partie" onClick={() => speakEnglish(segment.text)} sx={{ color: tokens.violetSoft, mr: -1 }}>
                  <VolumeUpRounded />
                </IconButton>
              </Stack>
              <Typography variant="h3" fontSize={19}>{segment.title}</Typography>
              <Typography lineHeight={1.9} mt={1.5} fontSize={16.5}>{segment.text}</Typography>
              <Box sx={{ mt: 2, p: 1.75, borderRadius: 4, background: 'rgba(70,217,245,0.07)', borderLeft: `3px solid ${tokens.cyan}` }}>
                <Typography fontSize={14} color="text.secondary" lineHeight={1.6}>{segment.summaryFr}</Typography>
              </Box>

              <Stack direction="row" gap={0.75} flexWrap="wrap" useFlexGap mt={2}>
                {segment.vocabulary.map((word) => (
                  <Pressable key={word} onClick={() => speakEnglish(word)} aria-label={`Écouter ${word}`} sx={{ width: 'auto' }}>
                    <Chip label={word} size="small" sx={{ cursor: 'pointer', background: 'rgba(139,108,255,0.12)', color: tokens.violetSoft }} />
                  </Pressable>
                ))}
              </Stack>
              <Button
                size="small"
                variant={isAdded ? 'contained' : 'outlined'}
                color={isAdded ? 'success' : 'primary'}
                startIcon={isAdded ? <CheckRounded /> : <AddRounded />}
                disabled={promote.isPending || isAdded}
                onClick={() => promote.mutate(
                  { level: segment.level, vocabulary: segment.vocabulary, example: segment.text },
                  { onSuccess: () => { feedback('success'); awardXp(5); setAdded((current) => new Set(current).add(segment.id)); } },
                )}
                sx={{ mt: 1.5, '&.Mui-disabled': isAdded ? { opacity: 1, color: '#05140D' } : {} }}
              >
                {isAdded ? 'Ajouté au SRS' : 'Ajouter le vocabulaire au SRS'}
              </Button>

              {question ? (
                <Box sx={{ mt: 2, p: 2, borderRadius: 4, background: 'rgba(255,255,255,0.03)', border: `1px solid ${tokens.border}` }}>
                  <Stack direction="row" gap={1} alignItems="flex-start">
                    <HelpRounded sx={{ color: tokens.amber, mt: 0.25 }} />
                    <Typography fontWeight={750}>{question.question}</Typography>
                  </Stack>
                  <Pressable
                    onClick={() => setRevealed((current) => new Set(current).add(segment.id))}
                    aria-label="Voir la réponse"
                    sx={{ mt: 1.5 }}
                  >
                    <Box position="relative" sx={{ p: 1.5, borderRadius: 3, background: 'rgba(52,229,160,0.08)', overflow: 'hidden' }}>
                      <MotionBox animate={{ filter: showAnswer ? 'blur(0px)' : 'blur(7px)' }} transition={{ duration: 0.4 }}>
                        <Typography fontSize={14.5}>{question.answer}</Typography>
                      </MotionBox>
                      {!showAnswer ? (
                        <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
                          <Typography fontFamily={displayFont} fontWeight={800} fontSize={14} color={tokens.mint}>Touche pour révéler</Typography>
                        </Box>
                      ) : null}
                    </Box>
                  </Pressable>
                </Box>
              ) : null}
            </CardContent>
          </Card>
        );
      })}
    </Stack>
  );
}
