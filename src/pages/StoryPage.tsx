import HelpRounded from '@mui/icons-material/HelpRounded';
import TranslateRounded from '@mui/icons-material/TranslateRounded';
import VolumeUpRounded from '@mui/icons-material/VolumeUpRounded';
import { Box, Button, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { Fragment, useState } from 'react';

import { PageHeader } from '@/components/common/PageHeader';
import { QueryState } from '@/components/common/QueryState';
import { PageLayout } from '@/components/layout/PageLayout';
import { MotionBox, Pressable } from '@/components/ui/motion';
import { useDailyStory } from '@/hooks/useAiFeatures';
import { feedback } from '@/services/feedbackService';
import { speakEnglish, stopEnglishSpeech } from '@/services/speechPlaybackService';
import { awardXp } from '@/services/xpService';
import { displayFont, tokens } from '@/theme';

/** Met en évidence tous les mots du jour (et leurs formes simples) dans le texte. */
function StoryText({ text, words }: { text: string; words: string[] }) {
  if (!words.length) return <>{text}</>;
  const alternatives = words.map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const parts = text.split(new RegExp(`(\\b(?:${alternatives})(?:s|es|ed|d|ing|'s)?\\b)`, 'gi'));
  return (
    <>
      {parts.map((part, index) => (index % 2 === 1
        ? <Box key={index} component="strong" sx={{ color: tokens.violet }}>{part}</Box>
        : <Fragment key={index}>{part}</Fragment>))}
    </>
  );
}

export function StoryPage() {
  const story = useDailyStory();
  const [showFr, setShowFr] = useState(false);
  const [revealed, setRevealed] = useState<Set<number>>(() => new Set());
  const [playing, setPlaying] = useState(false);
  const data = story.data;

  const listen = async () => {
    if (!data) return;
    if (playing) {
      stopEnglishSpeech();
      setPlaying(false);
      return;
    }
    setPlaying(true);
    try { await speakEnglish(data.textEn); } finally { setPlaying(false); }
  };

  const reveal = (index: number) => {
    if (revealed.has(index)) return;
    feedback('select');
    const next = new Set(revealed).add(index);
    setRevealed(next);
    if (data && next.size === data.questions.length) awardXp(15, 'Histoire du jour');
  };

  return (
    <PageLayout reading>
      <PageHeader back eyebrow="Lecture du jour" title={data?.title ?? 'Histoire du jour'} subtitle="Une histoire écrite pour toi avec les mots que tu révises." />
      <QueryState
        loading={story.isLoading}
        error={story.isError}
        empty={!story.isLoading && !story.isError && !data}
        emptyLabel="L’histoire du jour n’est pas encore prête. Reviens un peu plus tard."
        onRetry={() => story.refetch()}
      />

      {data ? (
        <Stack gap={2}>
          {data.wordsUsed.length ? (
            <Stack direction="row" gap={0.75} flexWrap="wrap" useFlexGap>
              {data.wordsUsed.map((word) => <Chip key={word} label={word} size="small" onClick={() => speakEnglish(word)} sx={{ cursor: 'pointer', background: 'rgba(112,85,232,0.12)', color: tokens.violet }} />)}
            </Stack>
          ) : null}

          <Card>
            <CardContent sx={{ p: { xs: 2.25, sm: 3 } }}>
              <Typography fontFamily={displayFont} fontSize={18} lineHeight={1.85}>
                <StoryText text={data.textEn} words={data.wordsUsed} />
              </Typography>
              {showFr ? (
                <MotionBox initial={{ opacity: 0 }} animate={{ opacity: 1 }} sx={{ mt: 2, pl: 1.5, borderLeft: `3px solid ${tokens.cyan}` }}>
                  <Typography lineHeight={1.7} color="text.secondary">{data.textFr}</Typography>
                </MotionBox>
              ) : null}
              <Stack direction="row" gap={1} mt={2} flexWrap="wrap" useFlexGap>
                <Button variant="contained" startIcon={<VolumeUpRounded />} onClick={() => void listen()}>{playing ? 'Arrêter' : 'Écouter'}</Button>
                <Button variant="outlined" startIcon={<TranslateRounded />} onClick={() => setShowFr((value) => !value)}>{showFr ? 'Masquer le français' : 'Voir le français'}</Button>
              </Stack>
            </CardContent>
          </Card>

          <Typography variant="h3">As-tu compris ?</Typography>
          {data.questions.map((item, index) => (
            <Box key={item.question} sx={{ p: 2, borderRadius: 4, background: tokens.surface, border: `1px solid ${tokens.border}` }}>
              <Stack direction="row" gap={1} alignItems="flex-start">
                <HelpRounded sx={{ color: tokens.amber, mt: 0.25 }} />
                <Typography fontWeight={750}>{item.question}</Typography>
              </Stack>
              <Pressable onClick={() => reveal(index)} aria-label="Voir la réponse" sx={{ mt: 1.25 }}>
                <Box position="relative" sx={{ p: 1.5, borderRadius: 3, background: 'rgba(22,135,93,0.08)', overflow: 'hidden' }}>
                  <MotionBox animate={{ filter: revealed.has(index) ? 'blur(0px)' : 'blur(7px)' }} transition={{ duration: 0.35 }}>
                    <Typography fontSize={14.5}>{item.answer}</Typography>
                  </MotionBox>
                  {!revealed.has(index) ? (
                    <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
                      <Typography fontFamily={displayFont} fontWeight={800} fontSize={14} color={tokens.mint}>Touche pour révéler</Typography>
                    </Box>
                  ) : null}
                </Box>
              </Pressable>
            </Box>
          ))}
        </Stack>
      ) : null}
    </PageLayout>
  );
}
