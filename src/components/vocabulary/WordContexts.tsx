import VolumeUpRounded from '@mui/icons-material/VolumeUpRounded';
import { Box, Chip, IconButton, Stack, Typography } from '@mui/material';
import { Fragment } from 'react';

import { SOURCE_LABELS } from '@/helpers/passageSources';
import { useWordContexts } from '@/hooks/useAiFeatures';
import { speakEnglish } from '@/services/speechPlaybackService';
import { tokens } from '@/theme';

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Met en gras le mot (et ses formes simples) dans la phrase. */
export function HighlightedSentence({ sentence, word }: { sentence: string; word: string }) {
  const pattern = new RegExp(`(\\b${escapeRegex(word)}(?:s|es|ed|d|ing|'s)?\\b)`, 'gi');
  const parts = sentence.split(pattern);
  return (
    <>
      {parts.map((part, index) => (index % 2 === 1
        ? <Box key={index} component="strong" sx={{ color: tokens.violet }}>{part}</Box>
        : <Fragment key={index}>{part}</Fragment>))}
    </>
  );
}

/**
 * Encart « Dans tes contenus » : vraies phrases de tes scripts, articles et
 * scènes qui contiennent le mot. N'affiche rien s'il n'y en a pas.
 */
export function WordContexts({ word }: { word: string }) {
  const query = useWordContexts(word);
  const contexts = query.data ?? [];
  if (!contexts.length) return null;

  return (
    <Box sx={{ p: 2, borderRadius: 5, background: tokens.surface, border: `1px solid ${tokens.border}` }}>
      <Typography variant="overline" color={tokens.cyan} display="block" mb={1}>Dans tes contenus</Typography>
      <Stack gap={1.25}>
        {contexts.map((context) => (
          <Stack key={`${context.parentId}-${context.sentence}`} direction="row" gap={0.5} alignItems="flex-start">
            <Box flex={1} minWidth={0}>
              <Typography fontSize={14.5} lineHeight={1.5}><HighlightedSentence sentence={context.sentence} word={word} /></Typography>
              <Stack direction="row" gap={0.75} alignItems="center" mt={0.5}>
                <Chip size="small" label={SOURCE_LABELS[context.source]} />
                <Typography fontSize={12} color="text.secondary" noWrap>{context.title}</Typography>
              </Stack>
            </Box>
            <IconButton
              size="small"
              aria-label="Écouter la phrase"
              onClick={(event) => { event.stopPropagation(); speakEnglish(context.sentence); }}
              sx={{ minWidth: 36, minHeight: 36, color: tokens.violetSoft }}
            >
              <VolumeUpRounded fontSize="small" />
            </IconButton>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}
