import PauseRounded from '@mui/icons-material/PauseRounded';
import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded';
import StopRounded from '@mui/icons-material/StopRounded';
import { Alert, Box, IconButton, Slider, Stack, Typography } from '@mui/material';

import { MotionBox, Pressable } from '@/components/ui/motion';
import type { AudioTrack } from '@/hooks/useAudioPlayer';
import { gradients, tokens } from '@/theme';

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
    <Stack direction="row" alignItems="flex-end" gap="2px" height={16} aria-hidden>
      {Array.from({ length: bars }, (_, index) => (
        <MotionBox
          key={index}
          animate={active ? { height: ['30%', '100%', '45%', '85%', '30%'] } : { height: '30%' }}
          transition={active ? { duration: 0.9 + index * 0.13, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.3 }}
          sx={{ width: 3, borderRadius: 2, background: color }}
        />
      ))}
    </Stack>
  );
}

export function AudioPlayerBar(props: AudioPlayerBarProps) {
  const active = props.activeTrack?.id === props.track.id;
  const isPlaying = active && props.playing;
  const progress = active ? props.currentTime : 0;
  const duration = active ? props.duration : 0;
  const nextSpeed = SPEEDS[(SPEEDS.indexOf(props.speed) + 1) % SPEEDS.length] ?? 1;

  return (
    <Box>
      <Stack direction="row" alignItems="center" gap={1.25}>
        <Pressable
          onClick={() => props.onToggle(props.track)}
          aria-label={isPlaying ? 'Mettre en pause' : 'Lire'}
          sx={{ width: 48, height: 48, borderRadius: '50%', flexShrink: 0 }}
        >
          <Box
            sx={{
              width: 48, height: 48, borderRadius: '50%', display: 'grid', placeItems: 'center', color: '#fff',
              background: isPlaying ? gradients.sunrise : gradients.ocean,
              boxShadow: `0 8px 22px -8px ${isPlaying ? tokens.coral : tokens.cyan}`,
              transition: 'background .3s, box-shadow .3s',
            }}
          >
            {isPlaying ? <PauseRounded /> : <PlayArrowRounded />}
          </Box>
        </Pressable>
        <Stack flex={1} minWidth={0}>
          <Slider
            size="small"
            value={progress}
            max={Math.max(1, duration)}
            disabled={!active || !duration}
            onChange={(_, value) => props.onSeek(value as number)}
            aria-label="Position de lecture"
            sx={{ py: 1.25, '&.Mui-disabled .MuiSlider-thumb': { display: 'none' } }}
          />
          <Stack direction="row" justifyContent="space-between" alignItems="center" mt={-0.5}>
            <Typography fontSize={11} color="text.secondary" sx={{ fontVariantNumeric: 'tabular-nums' }}>{formatTime(progress)}</Typography>
            {isPlaying ? <Equalizer active /> : null}
            <Typography fontSize={11} color="text.secondary" sx={{ fontVariantNumeric: 'tabular-nums' }}>{formatTime(duration)}</Typography>
          </Stack>
        </Stack>
        <Pressable onClick={() => props.onSpeedChange(nextSpeed)} aria-label={`Vitesse ${props.speed}×, passer à ${nextSpeed}×`} sx={{ width: 'auto' }}>
          <Box sx={{ px: 1.1, height: 32, borderRadius: 2.5, display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 800, color: tokens.violetSoft, background: 'rgba(139,108,255,0.12)', border: '1px solid rgba(139,108,255,0.25)' }}>
            {props.speed}×
          </Box>
        </Pressable>
        {active ? (
          <IconButton aria-label="Arrêter" onClick={props.onStop} sx={{ color: 'text.secondary' }}><StopRounded /></IconButton>
        ) : null}
      </Stack>
      {active && props.error ? <Alert severity="error" sx={{ mt: 1 }}>{props.error}</Alert> : null}
    </Box>
  );
}
