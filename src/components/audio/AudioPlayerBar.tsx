import { Pause, Play, Square } from 'lucide-react';
import { motion } from 'motion/react';

import { Alert } from '@/components/ui/alert';
import { IconButton } from '@/components/ui/button';
import { Slider } from '@/components/ui/form';
import { Pressable } from '@/components/ui/motion';
import type { AudioTrack } from '@/hooks/useAudioPlayer';
import { cn } from '@/lib/utils';
import { tokens } from '@/theme';

interface AudioPlayerBarProps {
  track: AudioTrack;
  activeTrack: AudioTrack | null;
  playing: boolean;
  currentTime: number;
  duration: number;
  speed: number;
  error?: string | null;
  onToggle: (track: AudioTrack) => void;
  onSeek: (value: number) => void;
  onSpeedChange: (value: number) => void;
  onStop: () => void;
}

const SPEEDS = [0.75, 1, 1.25, 1.5];

function formatTime(value: number) {
  if (!Number.isFinite(value)) return '0:00';
  const minutes = Math.floor(value / 60);
  return `${minutes}:${Math.floor(value % 60).toString().padStart(2, '0')}`;
}

/** Petit égaliseur animé affiché pendant la lecture. */
export function Equalizer({ active, color = tokens.cyan, bars = 4 }: { active: boolean; color?: string; bars?: number }) {
  return (
    <div className="flex h-4 items-end gap-0.5" aria-hidden>
      {Array.from({ length: bars }, (_, index) => (
        <motion.span
          key={index}
          animate={active ? { height: ['30%', '100%', '45%', '85%', '30%'] } : { height: '30%' }}
          transition={active ? { duration: 0.9 + index * 0.13, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.3 }}
          className="block w-[3px] rounded-sm"
          style={{ background: color }}
        />
      ))}
    </div>
  );
}

export function AudioPlayerBar(props: AudioPlayerBarProps) {
  const active = props.activeTrack?.id === props.track.id;
  const isPlaying = active && props.playing;
  const progress = active ? props.currentTime : 0;
  const duration = active ? props.duration : 0;
  const nextSpeed = SPEEDS[(SPEEDS.indexOf(props.speed) + 1) % SPEEDS.length] ?? 1;

  return (
    <div>
      <div className="flex items-center gap-2.5">
        <Pressable
          onClick={() => props.onToggle(props.track)}
          aria-label={isPlaying ? 'Mettre en pause' : 'Lire'}
          className="size-12 shrink-0 rounded-full"
        >
          <span
            className={cn(
              'grid size-12 place-items-center rounded-full text-white transition-[background,box-shadow] duration-300',
              isPlaying ? 'bg-grad-sunrise' : 'bg-grad-ocean',
            )}
            style={{ boxShadow: `0 8px 22px -8px ${isPlaying ? tokens.coral : tokens.cyan}` }}
          >
            {isPlaying ? <Pause className="size-6 fill-current" /> : <Play className="ml-0.5 size-6 fill-current" />}
          </span>
        </Pressable>
        <div className="min-w-0 flex-1">
          <Slider
            value={[progress]}
            max={Math.max(1, duration)}
            step={0.1}
            disabled={!active || !duration}
            onValueChange={([value]) => props.onSeek(value ?? 0)}
            aria-label="Position de lecture"
          />
          <div className="-mt-0.5 flex items-center justify-between">
            <span className="text-[11px] tabular-nums text-muted">{formatTime(progress)}</span>
            {isPlaying ? <Equalizer active /> : null}
            <span className="text-[11px] tabular-nums text-muted">{formatTime(duration)}</span>
          </div>
        </div>
        <Pressable onClick={() => props.onSpeedChange(nextSpeed)} aria-label={`Vitesse ${props.speed}×, passer à ${nextSpeed}×`} className="w-auto">
          <span className="grid h-8 place-items-center rounded-[10px] border border-violet/25 bg-violet/12 px-2 text-[13px] font-extrabold text-violet-soft">
            {props.speed}×
          </span>
        </Pressable>
        {active ? (
          <IconButton aria-label="Arrêter" onClick={props.onStop}><Square className="fill-current" /></IconButton>
        ) : null}
      </div>
      {active && props.error ? <Alert severity="error" className="mt-2">{props.error}</Alert> : null}
    </div>
  );
}
