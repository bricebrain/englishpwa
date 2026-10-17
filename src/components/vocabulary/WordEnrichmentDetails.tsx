import VolumeUpRounded from '@mui/icons-material/VolumeUpRounded';
import { Box, Chip, IconButton, Stack, Typography } from '@mui/material';

import {
  collocationKindLabel,
  getVocabularyCollocations,
  getVocabularySenses,
  partOfSpeechLabel,
  type VocabularyWordLike,
} from '@/helpers/vocabularyDisplay';
import { speakEnglish } from '@/services/speechPlaybackService';
import { tokens } from '@/theme';

interface WordEnrichmentDetailsProps {
  word: VocabularyWordLike;
  /** Sens visé par l'exercice : il passe en premier et ses collocations aussi. */
  senseKey?: string;
  /** Masque le premier sens quand il est déjà affiché ailleurs (verso de flashcard). */
  skipFirstSense?: boolean;
  maxSenses?: number;
  maxCollocations?: number;
  title?: string;
}

/**
 * Sens et expressions publiés par l'atelier Vocabulaire. Présentatif uniquement :
 * à n'afficher qu'après la réponse pour ne pas donner la solution.
 */
export function WordEnrichmentDetails({
  word,
  senseKey,
  skipFirstSense = false,
  maxSenses = 3,
  maxCollocations = 4,
  title = 'Autres sens et expressions',
}: WordEnrichmentDetailsProps) {
  const allSenses = getVocabularySenses(word);
  const ordered = senseKey
    ? [...allSenses.filter((sense) => sense.senseKey === senseKey), ...allSenses.filter((sense) => sense.senseKey !== senseKey)]
    : allSenses;
  const senses = (skipFirstSense ? ordered.slice(1) : ordered).slice(0, maxSenses);
  const collocations = getVocabularyCollocations(word, { senseKey, limit: maxCollocations });

  if (!senses.length && !collocations.length) return null;

  return (
    <Box sx={{ p: 2, borderRadius: 5, background: tokens.surface, border: `1px solid ${tokens.border}` }}>
      <Typography variant="overline" color={tokens.violetSoft} display="block" mb={1}>{title}</Typography>

      {senses.length ? (
        <Stack gap={1.25}>
          {senses.map((sense) => (
            <Box key={sense.senseKey || sense.translation} sx={{ pl: 1.5, borderLeft: `3px solid ${sense.senseKey === senseKey ? tokens.mint : tokens.violet}` }}>
              <Stack direction="row" alignItems="center" gap={0.75} flexWrap="wrap" useFlexGap>
                <Typography fontWeight={800}>{sense.translation}</Typography>
                <Chip size="small" label={partOfSpeechLabel(sense.partOfSpeech)} />
              </Stack>
              {sense.exampleEn ? (
                <Stack direction="row" alignItems="flex-start" gap={0.5} mt={0.5}>
                  <Box flex={1} minWidth={0}>
                    <Typography fontSize={14} fontStyle="italic">{sense.exampleEn}</Typography>
                    {sense.exampleFr ? <Typography fontSize={13} color="text.secondary">{sense.exampleFr}</Typography> : null}
                  </Box>
                  <IconButton
                    size="small"
                    aria-label="Écouter l’exemple"
                    onClick={(event) => { event.stopPropagation(); speakEnglish(sense.exampleEn); }}
                    sx={{ minWidth: 36, minHeight: 36, color: tokens.violetSoft }}
                  >
                    <VolumeUpRounded fontSize="small" />
                  </IconButton>
                </Stack>
              ) : null}
            </Box>
          ))}
        </Stack>
      ) : null}

      {collocations.length ? (
        <Stack gap={0.75} mt={senses.length ? 1.75 : 0}>
          {collocations.map((item) => (
            <Stack key={`${item.kind}-${item.en}`} direction="row" alignItems="baseline" gap={1} flexWrap="wrap" useFlexGap>
              <Chip size="small" label={collocationKindLabel(item.kind)} sx={{ background: 'rgba(22,140,168,0.12)', color: tokens.cyan }} />
              <Typography fontWeight={750} fontSize={14.5}>{item.en}</Typography>
              {item.fr ? <Typography fontSize={13.5} color="text.secondary">= {item.fr}</Typography> : null}
            </Stack>
          ))}
        </Stack>
      ) : null}
    </Box>
  );
}
