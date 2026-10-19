import {
  AudioLines,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  GraduationCap,
  Languages,
  Lightbulb,
  LoaderCircle,
  NotebookPen,
  Trash2,
  Volume2,
} from 'lucide-react';
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
import { Button, IconButton } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { Collapse } from '@/components/ui/collapse';
import { IconTile } from '@/components/ui/SessionChrome';
import { cn } from '@/lib/utils';
import { speakEnglish } from '@/services/speechPlaybackService';
import { alpha, gradients, tokens } from '@/theme';
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
    <div className="mt-3.5 rounded-2xl p-4" style={{ background: alpha(color, 0.07), borderLeft: `3px solid ${color}` }}>
      <span className="type-overline" style={{ color }}>{title}</span>
      {children}
    </div>
  );
}

function SpeakButton({ text }: { text: string }) {
  return (
    <IconButton size="sm" aria-label="Écouter l’exemple" onClick={() => speakEnglish(text)} className="ml-0.5 text-faint hover:text-violet">
      <Volume2 />
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
      <div className="mt-1.5 divide-y divide-border">
        {segments.map((segment) => {
          const active = segment.id === activeId;
          const content = (
            <>
              <p className={cn('text-[15.5px] leading-[1.7]', active && 'font-semibold')}>{segment.en}</p>
              {segment.fr ? <p className="mt-0.5 text-[13.5px] leading-relaxed text-muted">{segment.fr}</p> : null}
            </>
          );
          const className = cn('-mx-2 block w-[calc(100%+16px)] rounded-lg px-2 py-2 text-left transition-colors duration-150', active && 'bg-violet/12');
          return onSelect && segment.startMs !== null ? (
            <button type="button" key={segment.id} onClick={() => onSelect(segment)} aria-current={active ? 'true' : undefined} className={className}>
              {content}
            </button>
          ) : (
            <div key={segment.id} aria-current={active ? 'true' : undefined} className={className}>{content}</div>
          );
        })}
      </div>
    </Panel>
  );
}

function ChunksPanel({ chunks }: { chunks: ContentChunk[] }) {
  return (
    <Panel color={tokens.coral} title="Chunks à retenir">
      <div className="mt-2 flex flex-col gap-2.5">
        {chunks.map((chunk) => (
          <div key={chunk.id} className="rounded-xl border border-border bg-surface p-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <p className="text-[15.5px] font-bold">{chunk.expression}</p>
              {chunk.level ? <Chip size="sm" label={chunk.level} /> : null}
              {chunk.type ? <Chip size="sm" variant="outlined" label={CHUNK_TYPE_LABELS[chunk.type] ?? chunk.type} /> : null}
            </div>
            <p className="mt-0.5 text-sm text-muted">{chunk.meaningFr}</p>
            {chunk.exampleEn ? (
              <div className="mt-1.5 flex items-center">
                <p className="text-sm italic">« {chunk.exampleEn} »</p>
                <SpeakButton text={chunk.exampleEn} />
              </div>
            ) : null}
            {chunk.exampleFr ? <p className="text-[13px] text-muted">{chunk.exampleFr}</p> : null}
            {chunk.explanationFr || chunk.context ? (
              <p className="mt-1.5 text-[13px] leading-[1.55] text-muted">
                {[chunk.explanationFr, chunk.context].filter(Boolean).join(' — ')}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </Panel>
  );
}

function GrammarPanel({ points }: { points: ContentGrammarPoint[] }) {
  return (
    <Panel color={tokens.mint} title="Points de grammaire">
      <div className="mt-2 flex flex-col gap-2.5">
        {points.map((point) => (
          <div key={point.id} className="rounded-xl border border-border bg-surface p-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <p className="text-[15px] font-bold">{point.title}</p>
              {point.level ? <Chip size="sm" label={point.level} /> : null}
            </div>
            <p className="mt-1 text-sm leading-relaxed">{point.explanationFr}</p>
            {point.sourceExcerpt ? (
              <p className="mt-1.5 text-[13px] text-muted">Dans le texte : « {point.sourceExcerpt} »</p>
            ) : null}
            {point.exampleEn ? (
              <div className="mt-1 flex items-center">
                <p className="text-sm italic">« {point.exampleEn} »</p>
                <SpeakButton text={point.exampleEn} />
              </div>
            ) : null}
            {point.exampleFr ? <p className="text-[13px] text-muted">{point.exampleFr}</p> : null}
          </div>
        ))}
      </div>
    </Panel>
  );
}

function SectionButton({ open, icon, onClick, disabled, children }: {
  open: boolean;
  icon: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <Button size="sm" variant={open ? 'primary' : 'outline'} aria-pressed={open} onClick={onClick} disabled={disabled}>
      {icon}{children}
    </Button>
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
    <Card className="h-full">
      <CardContent>
        <div className="flex items-start gap-3">
          <IconTile icon={track ? <AudioLines /> : <NotebookPen />} gradient={track ? gradients.ocean : gradients.primary} size={46} />
          <div className="min-w-0 flex-1">
            <h3 className="type-h3">{item.title}</h3>
            <div className="mt-1.5 flex flex-wrap gap-1">
              <Chip size="sm" label={sourceKind ?? TYPE_LABELS[item.type ?? ''] ?? item.type ?? 'Contenu'} className="bg-violet/15 text-violet-soft" />
              {voiceLabel ? <Chip size="sm" variant="outlined" label={voiceLabel} /> : null}
              {isTextOnlyContent(item) ? <Chip size="sm" variant="outlined" label="Texte seul" /> : null}
              {item.level ? <Chip size="sm" label={item.level} /> : null}
              {durationLabel && !(isTextOnlyContent(item) && durationLabel === 'Texte') ? <Chip size="sm" label={durationLabel} /> : null}
              {getContentLanguage(item) ? <Chip size="sm" label={getContentLanguage(item)} /> : null}
              {!isTextOnlyContent(item) && getContentAudioLanguage(item) ? <Chip size="sm" label={`audio ${getContentAudioLanguage(item)}`} /> : null}
              {item.topic ?? item.source ? <Chip size="sm" label={item.topic ?? item.source} /> : null}
            </div>
          </div>
          <IconButton aria-label="Supprimer ce contenu" onClick={() => onDelete(item)} className="-mr-2 -mt-1 text-faint hover:text-red">
            <Trash2 />
          </IconButton>
        </div>

        <p className="mt-3.5 text-[14.5px] leading-[1.65] text-muted">
          {getContentSummary(item, isOpen('script') ? 600 : 200)}
        </p>
        {sourceLink ? (
          <a href={sourceLink} target="_blank" rel="noopener noreferrer" className="mt-1.5 inline-flex items-center gap-1 text-[13px] font-semibold text-violet underline underline-offset-2">
            Voir la source <ExternalLink className="size-3.5" />
          </a>
        ) : null}

        <div className="mt-4">
          {track ? (
            <AudioPlayerBar track={track} {...player} />
          ) : englishScript ? (
            <Button variant="outline" onClick={() => void speak()}>
              <Volume2 />Écouter en synthèse vocale
            </Button>
          ) : (
            <p className="text-[13px] text-faint">Pas d’audio ni de script anglais.</p>
          )}
        </div>

        <div className="mt-3.5 flex flex-wrap gap-2">
          {counts.segments ? (
            <SectionButton open={isOpen('bilingual')} icon={<BookOpen />} onClick={() => toggle('bilingual')}>Bilingue</SectionButton>
          ) : null}
          <SectionButton open={isOpen('script')} icon={isOpen('script') ? <ChevronUp /> : <ChevronDown />} onClick={() => toggle('script')} disabled={!englishScript}>
            Script
          </SectionButton>
          {frenchTranslation ? (
            <SectionButton open={isOpen('translation')} icon={<Languages />} onClick={() => toggle('translation')}>Traduction</SectionButton>
          ) : null}
          {counts.chunks ? (
            <SectionButton open={isOpen('chunks')} icon={<Lightbulb />} onClick={() => toggle('chunks')}>Chunks · {counts.chunks}</SectionButton>
          ) : null}
          {counts.grammarPoints ? (
            <SectionButton open={isOpen('grammar')} icon={<GraduationCap />} onClick={() => toggle('grammar')}>Grammaire · {counts.grammarPoints}</SectionButton>
          ) : null}
        </div>

        {detailPending ? (
          <div className="mt-4 flex items-center gap-2 text-muted">
            {detailQuery.isError ? (
              <>
                <p className="text-[13.5px]">Impossible de charger le détail.</p>
                <Button size="sm" variant="ghost" onClick={() => detailQuery.refetch()}>Réessayer</Button>
              </>
            ) : (
              <>
                <LoaderCircle className="size-4 animate-spin text-violet" />
                <p className="text-[13.5px]">Chargement du contenu…</p>
              </>
            )}
          </div>
        ) : null}

        <Collapse in={!detailPending && isOpen('bilingual')}>
          <BilingualPanel segments={segments} activeId={activeSegmentId} onSelect={selectSegment} />
        </Collapse>

        <Collapse in={!detailPending && isOpen('translation')}>
          <Panel color={tokens.cyan} title="Traduction française">
            <p className="mt-1 whitespace-pre-wrap text-[14.5px] leading-[1.75]">{frenchTranslation}</p>
          </Panel>
        </Collapse>

        <Collapse in={!detailPending && isOpen('script')}>
          <Panel color={tokens.violet} title="Script anglais">
            <p className="mt-1 whitespace-pre-wrap text-[15.5px] leading-[1.85]">{englishScript}</p>
          </Panel>
        </Collapse>

        <Collapse in={!detailPending && isOpen('chunks')}>
          <ChunksPanel chunks={chunks} />
        </Collapse>

        <Collapse in={!detailPending && isOpen('grammar')}>
          <GrammarPanel points={grammarPoints} />
        </Collapse>
      </CardContent>
    </Card>
  );
}
