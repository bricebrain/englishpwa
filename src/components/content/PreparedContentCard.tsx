import AutoStoriesRounded from '@mui/icons-material/AutoStoriesRounded';
import OpenInNewRounded from '@mui/icons-material/OpenInNewRounded';
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded';
import GraphicEqRounded from '@mui/icons-material/GraphicEqRounded';
import LightbulbOutlined from '@mui/icons-material/LightbulbOutlined';
import NotesRounded from '@mui/icons-material/NotesRounded';
import ExpandLessRounded from '@mui/icons-material/ExpandLessRounded';
import ExpandMoreRounded from '@mui/icons-material/ExpandMoreRounded';
import SchoolOutlined from '@mui/icons-material/SchoolOutlined';
import TranslateRounded from '@mui/icons-material/TranslateRounded';
import VolumeUpRounded from '@mui/icons-material/VolumeUpRounded';
import { Box, Button, ButtonBase, Card, CardContent, Chip, CircularProgress, Collapse, IconButton, Link, Stack, Typography } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import type { ReactNode } from 'react';

import { AudioPlayerBar } from '@/components/audio/AudioPlayerBar';
import {
  CHUNK_TYPE_LABELS,
  findActiveSegmentId,
  getAudioVoiceLabel,
  getContentAudioLanguage,
  getContentChunks,
  getContentCounts,
  getContentDurationLabel,
  getContentGrammarPoints,
  getContentLanguage,
  getContentSegments,
  getContentSummary,
  getEnglishScript,
  getFrenchTranslation,
  getSourceKindLabel,
  getSourceLink,
  isContentSummary,
  isTextOnlyContent,
} from '@/helpers/preparedContent';
import { learningApi } from '@/api/learningApi';
import { usePreparedContentDetail } from '@/hooks/useLearningQueries';
import type { ContentChunk, ContentGrammarPoint, ContentSegment } from '@/helpers/preparedContent';
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

type Section = 'script' | 'translation' | 'bilingual' | 'chunks' | 'grammar';

function Panel({ color, title, children }: { color: string; title: string; children: ReactNode }) {
  return (
    <Box sx={{ mt: 1.75, p: 2, borderRadius: 4, background: `${color}12`, borderLeft: `3px solid ${color}` }}>
      <Typography variant="overline" color={color}>{title}</Typography>
      {children}
    </Box>
  );
}

function SpeakButton({ text }: { text: string }) {
  return (
    <IconButton size="small" aria-label="Écouter l’exemple" onClick={() => speakEnglish(text)} sx={{ ml: 0.25, color: tokens.textFaint, '&:hover': { color: tokens.violet } }}>
      <VolumeUpRounded fontSize="inherit" />
    </IconButton>
  );
}

function BilingualPanel({ segments, activeId, onSelect }: {
  segments: ContentSegment[];
  /** Segment en cours de lecture (surlignage via timeupdate). */
  activeId: string | null;
  /** Positionne la lecture au début d'un segment horodaté. */
  onSelect?: (segment: ContentSegment) => void;
}) {
  return (
    <Panel color={tokens.violet} title="Lecture bilingue">
      <Stack mt={0.75} divider={<Box sx={{ borderTop: `1px solid ${tokens.border}` }} />}>
        {segments.map((segment) => {
          const active = segment.id === activeId;
          const content = (
            <>
              <Typography lineHeight={1.7} fontSize={15.5} fontWeight={active ? 650 : undefined}>{segment.en}</Typography>
              {segment.fr ? <Typography lineHeight={1.6} fontSize={13.5} color="text.secondary" mt={0.35}>{segment.fr}</Typography> : null}
            </>
          );
          const sx = { py: 1.1, px: 1, mx: -1, borderRadius: 2, textAlign: 'left', display: 'block', width: 'calc(100% + 16px)',
            background: active ? 'rgba(139,108,255,0.12)' : 'transparent', transition: 'background 160ms' } as const;
          return onSelect && segment.startMs !== null ? (
            <ButtonBase key={segment.id} onClick={() => onSelect(segment)} aria-current={active ? 'true' : undefined} sx={sx}>
              {content}
            </ButtonBase>
          ) : (
            <Box key={segment.id} aria-current={active ? 'true' : undefined} sx={sx}>{content}</Box>
          );
        })}
      </Stack>
    </Panel>
  );
}

function ChunksPanel({ chunks }: { chunks: ContentChunk[] }) {
  return (
    <Panel color={tokens.coral} title="Chunks à retenir">
      <Stack gap={1.25} mt={1}>
        {chunks.map((chunk) => (
          <Box key={chunk.id} sx={{ p: 1.5, borderRadius: 3, background: tokens.surface, border: `1px solid ${tokens.border}` }}>
            <Stack direction="row" alignItems="center" gap={0.75} flexWrap="wrap" useFlexGap>
              <Typography fontWeight={750} fontSize={15.5}>{chunk.expression}</Typography>
              {chunk.level ? <Chip size="small" label={chunk.level} /> : null}
              {chunk.type ? <Chip size="small" variant="outlined" label={CHUNK_TYPE_LABELS[chunk.type] ?? chunk.type} /> : null}
            </Stack>
            <Typography color="text.secondary" fontSize={14} mt={0.25}>{chunk.meaningFr}</Typography>
            {chunk.exampleEn ? (
              <Stack direction="row" alignItems="center" mt={0.75}>
                <Typography fontStyle="italic" fontSize={14}>« {chunk.exampleEn} »</Typography>
                <SpeakButton text={chunk.exampleEn} />
              </Stack>
            ) : null}
            {chunk.exampleFr ? <Typography fontSize={13} color="text.secondary">{chunk.exampleFr}</Typography> : null}
            {chunk.explanationFr || chunk.context ? (
              <Typography fontSize={13} color={tokens.textMuted} mt={0.75} lineHeight={1.55}>
                {[chunk.explanationFr, chunk.context].filter(Boolean).join(' — ')}
              </Typography>
            ) : null}
          </Box>
        ))}
      </Stack>
    </Panel>
  );
}

function GrammarPanel({ points }: { points: ContentGrammarPoint[] }) {
  return (
    <Panel color={tokens.mint} title="Points de grammaire">
      <Stack gap={1.25} mt={1}>
        {points.map((point) => (
          <Box key={point.id} sx={{ p: 1.5, borderRadius: 3, background: tokens.surface, border: `1px solid ${tokens.border}` }}>
            <Stack direction="row" alignItems="center" gap={0.75} flexWrap="wrap" useFlexGap>
              <Typography fontWeight={750} fontSize={15}>{point.title}</Typography>
              {point.level ? <Chip size="small" label={point.level} /> : null}
            </Stack>
            <Typography fontSize={14} mt={0.5} lineHeight={1.6}>{point.explanationFr}</Typography>
            {point.sourceExcerpt ? (
              <Typography fontSize={13} color="text.secondary" mt={0.75}>Dans le texte : « {point.sourceExcerpt} »</Typography>
            ) : null}
            {point.exampleEn ? (
              <Stack direction="row" alignItems="center" mt={0.5}>
                <Typography fontStyle="italic" fontSize={14}>« {point.exampleEn} »</Typography>
                <SpeakButton text={point.exampleEn} />
              </Stack>
            ) : null}
            {point.exampleFr ? <Typography fontSize={13} color="text.secondary">{point.exampleFr}</Typography> : null}
          </Box>
        ))}
      </Stack>
    </Panel>
  );
}

export function PreparedContentCard({ item, player, onDelete }: {
  item: PreparedContent;
  player: PlayerProps;
  onDelete: (item: PreparedContent) => void;
}) {
  const [open, setOpen] = useState<Set<Section>>(new Set());
  const queryClient = useQueryClient();
  // Liste résumée : le détail n'est chargé qu'à l'ouverture d'un panneau.
  const summaryOnly = isContentSummary(item);
  const detailQuery = usePreparedContentDetail(item.id, summaryOnly && open.size > 0);
  const full = summaryOnly ? detailQuery.data ?? null : item;
  const counts = getContentCounts(item);
  const englishScript = getEnglishScript(full ?? item);
  const frenchTranslation = getFrenchTranslation(full ?? item);
  const segments = full ? getContentSegments(full) : [];
  const chunks = full ? getContentChunks(full) : [];
  const grammarPoints = full ? getContentGrammarPoints(full) : [];
  const durationLabel = getContentDurationLabel(item);
  const detailPending = summaryOnly && open.size > 0 && !full;
  const speak = async () => {
    if (full) return speakEnglish(getEnglishScript(full));
    const detail = await queryClient.fetchQuery({
      queryKey: ['prepared-content-detail', item.id],
      queryFn: () => learningApi.getPreparedContentItem(item.id),
    });
    speakEnglish(getEnglishScript(detail));
  };
  const track = item.audioUrl ? { id: item.id, title: item.title, url: item.audioUrl } : null;
  const voiceLabel = getAudioVoiceLabel(item);
  const sourceKind = getSourceKindLabel(item);
  const sourceLink = getSourceLink(item);
  const isActiveTrack = Boolean(track && player.activeTrack?.id === track.id);
  const activeSegmentId = isActiveTrack ? findActiveSegmentId(segments, player.currentTime * 1000) : null;
  // Toucher un segment horodaté y positionne la lecture en cours de cette piste
  const selectSegment = isActiveTrack ? (segment: ContentSegment) => {
    if (segment.startMs !== null) player.onSeek(segment.startMs / 1000);
  } : undefined;
  const isOpen = (section: Section) => open.has(section);
  const toggle = (section: Section) => setOpen((current) => {
    const next = new Set(current);
    if (next.has(section)) next.delete(section);
    else next.add(section);
    return next;
  });

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack direction="row" alignItems="flex-start" gap={1.5}>
          <IconTile icon={track ? <GraphicEqRounded /> : <NotesRounded />} gradient={track ? gradients.ocean : gradients.primary} size={46} />
          <Box minWidth={0} flex={1}>
            <Typography variant="h3" lineHeight={1.3}>{item.title}</Typography>
            <Stack direction="row" gap={0.5} flexWrap="wrap" useFlexGap mt={0.75}>
              <Chip size="small" label={sourceKind ?? TYPE_LABELS[item.type ?? ''] ?? item.type ?? 'Contenu'} sx={{ background: 'rgba(139,108,255,0.15)', color: tokens.violetSoft }} />
              {voiceLabel ? <Chip size="small" variant="outlined" label={voiceLabel} /> : null}
              {isTextOnlyContent(item) ? <Chip size="small" variant="outlined" label="Texte seul" /> : null}
              {item.level ? <Chip size="small" label={item.level} /> : null}
              {durationLabel && !(isTextOnlyContent(item) && durationLabel === 'Texte') ? <Chip size="small" label={durationLabel} /> : null}
              {getContentLanguage(item) ? <Chip size="small" label={getContentLanguage(item)} /> : null}
              {!isTextOnlyContent(item) && getContentAudioLanguage(item) ? <Chip size="small" label={`audio ${getContentAudioLanguage(item)}`} /> : null}
              {item.topic ?? item.source ? <Chip size="small" label={item.topic ?? item.source} /> : null}
            </Stack>
          </Box>
          <IconButton aria-label="Supprimer ce contenu" onClick={() => onDelete(item)} sx={{ mt: -0.5, mr: -1, color: tokens.textFaint, '&:hover': { color: tokens.red } }}>
            <DeleteOutlineRounded />
          </IconButton>
        </Stack>

        <Typography color="text.secondary" lineHeight={1.65} mt={1.75} fontSize={14.5}>
          {getContentSummary(item, isOpen('script') ? 600 : 200)}
        </Typography>
        {sourceLink ? (
          <Link href={sourceLink} target="_blank" rel="noopener noreferrer" fontSize={13} sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, mt: 0.75 }}>
            Voir la source <OpenInNewRounded sx={{ fontSize: 14 }} />
          </Link>
        ) : null}

        <Box mt={2}>
          {track ? (
            <AudioPlayerBar track={track} {...player} />
          ) : englishScript ? (
            <Button variant="outlined" startIcon={<VolumeUpRounded />} onClick={() => void speak()}>
              Écouter en synthèse vocale
            </Button>
          ) : (
            <Typography color="text.disabled" fontSize={13}>Pas d’audio ni de script anglais.</Typography>
          )}
        </Box>

        <Stack direction="row" gap={1} flexWrap="wrap" useFlexGap mt={1.75}>
          {counts.segments ? (
            <Button size="small" variant={isOpen('bilingual') ? 'contained' : 'outlined'} startIcon={<AutoStoriesRounded />} onClick={() => toggle('bilingual')}>
              Bilingue
            </Button>
          ) : null}
          <Button size="small" variant={isOpen('script') ? 'contained' : 'outlined'} startIcon={isOpen('script') ? <ExpandLessRounded /> : <ExpandMoreRounded />} onClick={() => toggle('script')} disabled={!englishScript}>
            Script
          </Button>
          {frenchTranslation ? (
            <Button size="small" variant={isOpen('translation') ? 'contained' : 'outlined'} startIcon={<TranslateRounded />} onClick={() => toggle('translation')}>
              Traduction
            </Button>
          ) : null}
          {counts.chunks ? (
            <Button size="small" variant={isOpen('chunks') ? 'contained' : 'outlined'} startIcon={<LightbulbOutlined />} onClick={() => toggle('chunks')}>
              Chunks · {counts.chunks}
            </Button>
          ) : null}
          {counts.grammarPoints ? (
            <Button size="small" variant={isOpen('grammar') ? 'contained' : 'outlined'} startIcon={<SchoolOutlined />} onClick={() => toggle('grammar')}>
              Grammaire · {counts.grammarPoints}
            </Button>
          ) : null}
        </Stack>

        {detailPending ? (
          <Stack direction="row" alignItems="center" gap={1} mt={2} color="text.secondary">
            {detailQuery.isError ? (
              <>
                <Typography fontSize={13.5}>Impossible de charger le détail.</Typography>
                <Button size="small" onClick={() => detailQuery.refetch()}>Réessayer</Button>
              </>
            ) : (
              <>
                <CircularProgress size={16} />
                <Typography fontSize={13.5}>Chargement du contenu…</Typography>
              </>
            )}
          </Stack>
        ) : null}

        <Collapse in={!detailPending && isOpen('bilingual')} unmountOnExit>
          <BilingualPanel segments={segments} activeId={activeSegmentId} onSelect={selectSegment} />
        </Collapse>

        <Collapse in={!detailPending && isOpen('translation')} unmountOnExit>
          <Panel color={tokens.cyan} title="Traduction française">
            <Typography whiteSpace="pre-wrap" lineHeight={1.75} mt={0.5} fontSize={14.5}>{frenchTranslation}</Typography>
          </Panel>
        </Collapse>

        <Collapse in={!detailPending && isOpen('script')} unmountOnExit>
          <Panel color={tokens.violet} title="Script anglais">
            <Typography whiteSpace="pre-wrap" lineHeight={1.85} mt={0.5} fontSize={15.5}>{englishScript}</Typography>
          </Panel>
        </Collapse>

        <Collapse in={!detailPending && isOpen('chunks')} unmountOnExit>
          <ChunksPanel chunks={chunks} />
        </Collapse>

        <Collapse in={!detailPending && isOpen('grammar')} unmountOnExit>
          <GrammarPanel points={grammarPoints} />
        </Collapse>
      </CardContent>
    </Card>
  );
}
