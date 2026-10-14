import RecordVoiceOverRounded from '@mui/icons-material/RecordVoiceOverRounded';
import { Box, Stack, Typography } from '@mui/material';

import { AudioPlayerBar } from '@/components/audio/AudioPlayerBar';
import { MotionBox } from '@/components/ui/motion';
import type { AudioTrack } from '@/hooks/useAudioPlayer';
import { tokens } from '@/theme';
import type { AssimilDialogueLine } from '@/types/learning';

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

function time(value: number) {
  const minutes = Math.floor(value / 60);
  return `${minutes}:${Math.floor(value % 60).toString().padStart(2, '0')}`;
}

export function AssimilDialoguePanel({
  audioUrl,
  lessonId,
  dialogue,
  player,
}: {
  audioUrl: string;
  lessonId: string;
  dialogue: AssimilDialogueLine[];
  player: PlayerProps;
}) {
  const lines = dialogue.length > 1 ? dialogue.slice(1) : dialogue;

  return (
    <Box>
      <Stack direction="row" alignItems="center" gap={1} mb={1.5}>
        <RecordVoiceOverRounded sx={{ color: tokens.violetSoft }} />
        <Typography variant="h2">Dialogue original</Typography>
      </Stack>
      <Stack gap={1.25}>
        {lines.map((line, index) => {
          const right = line.speakerNumber % 2 === 0;
          const track = {
            id: `${lessonId}-segment-${index}`,
            title: line.text,
            url: audioUrl,
            startTime: line.start,
            endTime: line.end,
          };
          const playing = player.activeTrack?.id === track.id && player.playing;
          return (
            <MotionBox
              key={`${line.speakerLabel}-${line.start}`}
              initial={{ opacity: 0, x: right ? 30 : -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
              sx={{ display: 'flex', justifyContent: right ? 'flex-end' : 'flex-start' }}
            >
              <Box
                sx={{
                  width: { xs: '92%', sm: '80%' }, p: 2, borderRadius: right ? '22px 22px 6px 22px' : '22px 22px 22px 6px',
                  background: right ? 'linear-gradient(160deg, rgba(139,108,255,0.22), rgba(255,93,162,0.12))' : tokens.surfaceRaised,
                  border: `1px solid ${playing ? tokens.violet : right ? 'rgba(139,108,255,0.3)' : tokens.border}`,
                  boxShadow: playing ? `0 0 30px -10px ${tokens.violet}` : 'none', transition: 'border-color .3s, box-shadow .3s',
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1} mb={0.75}>
                  <Typography variant="overline" color={right ? tokens.pink : tokens.cyan}>Voix {line.speakerNumber}</Typography>
                  <Typography fontSize={11.5} color="text.disabled">{line.emotion} · {line.tone} · {time(line.start)}</Typography>
                </Stack>
                <Typography fontSize={17} fontWeight={650} lineHeight={1.5}>{line.text}</Typography>
                {line.textFr ? <Typography color="text.secondary" fontSize={14} mt={0.5}>{line.textFr}</Typography> : null}
                <Box mt={1.25}><AudioPlayerBar track={track} {...player} /></Box>
              </Box>
            </MotionBox>
          );
        })}
      </Stack>
    </Box>
  );
}
