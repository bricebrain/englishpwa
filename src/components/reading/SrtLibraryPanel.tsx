import VolumeUpRounded from '@mui/icons-material/VolumeUpRounded';
import {
  Box,
  Card,
  CardContent,
  Chip,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';

import { QueryState } from '@/components/common/QueryState';
import { useSrtEpisodes, useSrtScenes, useSrtSources } from '@/hooks/useReadingLibrary';
import { speakEnglish } from '@/services/speechPlaybackService';
import { gradients, tokens } from '@/theme';

export function SrtLibraryPanel() {
  const sources = useSrtSources();
  const [sourceId, setSourceId] = useState<string | null>(null);
  const episodes = useSrtEpisodes(sourceId);
  const [episodeId, setEpisodeId] = useState<string | null>(null);
  const scenes = useSrtScenes(episodeId);

  useEffect(() => {
    if (!sourceId && sources.data?.[0]) setSourceId(sources.data[0].id);
  }, [sourceId, sources.data]);

  useEffect(() => {
    setEpisodeId(episodes.data?.[0]?.id ?? null);
  }, [episodes.data]);

  return (
    <Stack gap={1.5}>
      <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.25}>
        <FormControl fullWidth>
          <InputLabel id="source-label">Série / source</InputLabel>
          <Select labelId="source-label" label="Série / source" value={sourceId ?? ''} onChange={(event) => setSourceId(event.target.value)}>
            {sources.data?.map((source) => <MenuItem key={source.id} value={source.id}>{source.title} · {source.sceneCount} scènes</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl fullWidth disabled={!episodes.data?.length}>
          <InputLabel id="episode-label">Épisode</InputLabel>
          <Select labelId="episode-label" label="Épisode" value={episodeId ?? ''} onChange={(event) => setEpisodeId(event.target.value)}>
            {episodes.data?.map((episode) => <MenuItem key={episode.id} value={episode.id}>{episode.title}</MenuItem>)}
          </Select>
        </FormControl>
      </Stack>
      <QueryState loading={sources.isLoading || episodes.isLoading || scenes.isLoading} error={sources.isError || episodes.isError || scenes.isError} empty={!scenes.isLoading && !scenes.data?.length} />
      {scenes.data?.map((scene) => (
        <Card key={scene.id}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
              <Box>
                <Typography variant="overline" color={tokens.violetSoft}>Scène {scene.sceneIndex} · {scene.startTime}–{scene.endTime}</Typography>
                <Typography color="text.secondary" fontSize={12}>{scene.level} · {scene.wordsPerMin} mots/min</Typography>
              </Box>
              <IconButton aria-label="Écouter la scène en synthèse vocale" onClick={() => speakEnglish(scene.text)} sx={{ background: gradients.ocean, color: '#fff', '&:hover': { background: gradients.ocean } }}><VolumeUpRounded /></IconButton>
            </Stack>
            <Typography whiteSpace="pre-wrap" lineHeight={1.85} mt={1.5} fontSize={16} sx={{ pl: 1.75, borderLeft: `3px solid ${tokens.violet}` }}>{scene.text}</Typography>
            {scene.summaryFr ? <Typography color="text.secondary" fontSize={13} mt={1}>{scene.summaryFr}</Typography> : null}
            <Stack direction="row" gap={0.75} flexWrap="wrap" useFlexGap mt={1.5}>
              {scene.vocabulary.map((word) => <Chip key={word} label={word} size="small" onClick={() => speakEnglish(word)} sx={{ background: 'rgba(139,108,255,0.12)', color: tokens.violetSoft }} />)}
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}
