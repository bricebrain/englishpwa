import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded';
import GraphicEqRounded from '@mui/icons-material/GraphicEqRounded';
import NotesRounded from '@mui/icons-material/NotesRounded';
import ExpandLessRounded from '@mui/icons-material/ExpandLessRounded';
import ExpandMoreRounded from '@mui/icons-material/ExpandMoreRounded';
import TranslateRounded from '@mui/icons-material/TranslateRounded';
import VolumeUpRounded from '@mui/icons-material/VolumeUpRounded';
import { Box, Button, Card, CardContent, Chip, Collapse, IconButton, Stack, Typography } from '@mui/material';
import { useState } from 'react';

import { AudioPlayerBar } from '@/components/audio/AudioPlayerBar';
import {
  getContentAudioLanguage,
  getContentLanguage,
  getContentSummary,
  getEnglishScript,
  getFrenchTranslation,
} from '@/helpers/preparedContent';
import type { AudioTrack } from '@/hooks/useAudioPlayer';
import { IconTile } from '@/components/ui/SessionChrome';
import { speakEnglish } from '@/services/speechPlaybackService';
import { gradients, tokens } from '@/theme';
import type { PreparedContent } from '@/types/learning';

interface PlayerProps {
  activeTrack: AudioTrack | null;
  playing: boolean;
  currentTime: number;
  duration: number;
  speed: number;
  error: string | null;
  onToggle: (track: AudioTrack) => void;
  onSeek: (value: number) => void;
  onSpeedChange: (value: number) => void;
  onStop: () => void;
}

const TYPE_LABELS: Record<string, string> = {
  course: 'Cours',
  daily_podcast: 'Podcast du jour',
  podcast: 'Podcast',
  script_audio: 'Script audio',
  story: 'Histoire',
  youtube_import: 'YouTube',
};

export function PreparedContentCard({ item, player, onDelete }: {
  item: PreparedContent;
  player: PlayerProps;
  onDelete: (item: PreparedContent) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [translationVisible, setTranslationVisible] = useState(false);
  const englishScript = getEnglishScript(item);
  const frenchTranslation = getFrenchTranslation(item);
  const track = item.audioUrl ? { id: item.id, title: item.title, url: item.audioUrl } : null;

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack direction="row" alignItems="flex-start" gap={1.5}>
          <IconTile icon={track ? <GraphicEqRounded /> : <NotesRounded />} gradient={track ? gradients.ocean : gradients.primary} size={46} />
          <Box minWidth={0} flex={1}>
            <Typography variant="h3" lineHeight={1.3}>{item.title}</Typography>
            <Stack direction="row" gap={0.5} flexWrap="wrap" useFlexGap mt={0.75}>
              <Chip size="small" label={TYPE_LABELS[item.type ?? ''] ?? item.type ?? 'Contenu'} sx={{ background: 'rgba(139,108,255,0.15)', color: tokens.violetSoft }} />
              {item.level ? <Chip size="small" label={item.level} /> : null}
              {getContentLanguage(item) ? <Chip size="small" label={getContentLanguage(item)} /> : null}
              {getContentAudioLanguage(item) ? <Chip size="small" label={`audio ${getContentAudioLanguage(item)}`} /> : null}
              {item.topic ?? item.source ? <Chip size="small" label={item.topic ?? item.source} /> : null}
            </Stack>
          </Box>
          <IconButton aria-label="Supprimer ce contenu" onClick={() => onDelete(item)} sx={{ mt: -0.5, mr: -1, color: tokens.textFaint, '&:hover': { color: tokens.red } }}>
            <DeleteOutlineRounded />
          </IconButton>
        </Stack>

        <Typography color="text.secondary" lineHeight={1.65} mt={1.75} fontSize={14.5}>
          {getContentSummary(item, expanded ? 600 : 200)}
        </Typography>

        <Box mt={2}>
          {track ? (
            <AudioPlayerBar track={track} {...player} />
          ) : englishScript ? (
            <Button variant="outlined" startIcon={<VolumeUpRounded />} onClick={() => speakEnglish(englishScript)}>
              Écouter en synthèse vocale
            </Button>
          ) : (
            <Typography color="text.disabled" fontSize={13}>Pas d’audio ni de script anglais.</Typography>
          )}
        </Box>

        <Stack direction="row" gap={1} flexWrap="wrap" useFlexGap mt={1.75}>
          <Button size="small" variant={expanded ? 'contained' : 'outlined'} startIcon={expanded ? <ExpandLessRounded /> : <ExpandMoreRounded />} onClick={() => setExpanded((value) => !value)} disabled={!englishScript}>
            Script
          </Button>
          {frenchTranslation ? (
            <Button size="small" variant={translationVisible ? 'contained' : 'outlined'} startIcon={<TranslateRounded />} onClick={() => setTranslationVisible((value) => !value)}>
              Traduction
            </Button>
          ) : null}
        </Stack>

        <Collapse in={translationVisible} unmountOnExit>
          <Box sx={{ mt: 1.75, p: 2, borderRadius: 4, background: 'rgba(70,217,245,0.07)', borderLeft: `3px solid ${tokens.cyan}` }}>
            <Typography variant="overline" color={tokens.cyan}>Traduction française</Typography>
            <Typography whiteSpace="pre-wrap" lineHeight={1.75} mt={0.5} fontSize={14.5}>{frenchTranslation}</Typography>
          </Box>
        </Collapse>

        <Collapse in={expanded} unmountOnExit>
          <Box sx={{ mt: 1.75, p: 2, borderRadius: 4, background: 'rgba(139,108,255,0.07)', borderLeft: `3px solid ${tokens.violet}` }}>
            <Typography variant="overline" color={tokens.violetSoft}>Script anglais</Typography>
            <Typography whiteSpace="pre-wrap" lineHeight={1.85} mt={0.5} fontSize={15.5}>{englishScript}</Typography>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
}
