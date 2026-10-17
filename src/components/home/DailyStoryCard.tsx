import AutoStoriesRounded from '@mui/icons-material/AutoStoriesRounded';
import ChevronRightRounded from '@mui/icons-material/ChevronRightRounded';
import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { Pressable } from '@/components/ui/motion';
import { IconTile } from '@/components/ui/SessionChrome';
import { useDailyStory } from '@/hooks/useAiFeatures';
import { gradients, tokens } from '@/theme';

/** Accroche de l'histoire du jour (rien n'est affiché si elle n'est pas disponible). */
export function DailyStoryCard() {
  const navigate = useNavigate();
  const story = useDailyStory();
  if (!story.data) return null;
  const teaser = story.data.textEn.split(/(?<=[.!?])\s+/).slice(0, 2).join(' ');

  return (
    <Pressable onClick={() => navigate('/histoire')} aria-label="Lire l’histoire du jour">
      <Card sx={{ overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', top: -50, right: -40, width: 160, height: 160, borderRadius: '50%', background: gradients.sunrise, opacity: 0.16, filter: 'blur(20px)' }} />
        <CardContent sx={{ position: 'relative' }}>
          <Stack direction="row" alignItems="center" gap={1.5}>
            <IconTile icon={<AutoStoriesRounded />} gradient={gradients.sunrise} />
            <Box flex={1} minWidth={0}>
              <Typography variant="overline" color={tokens.coral}>Histoire du jour</Typography>
              <Typography variant="h3" noWrap>{story.data.title}</Typography>
            </Box>
            <ChevronRightRounded sx={{ color: tokens.textFaint }} />
          </Stack>
          <Typography color="text.secondary" fontSize={14} mt={1.25} lineHeight={1.55} sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {teaser}
          </Typography>
          <Typography fontSize={12.5} fontWeight={700} color={tokens.violetSoft} mt={1}>
            {story.data.wordsUsed.length} de tes mots à réviser · {story.data.questions.length} questions
          </Typography>
        </CardContent>
      </Card>
    </Pressable>
  );
}
