import { Speech } from 'lucide-react';
import { motion } from 'motion/react';

import { AudioPlayerBar } from '@/components/audio/AudioPlayerBar';
import type { AudioTrack } from '@/hooks/useAudioPlayer';
import { cn } from '@/lib/utils';
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
    <div>
      <div className="mb-3 flex items-center gap-2">
        <Speech className="size-6 text-violet-soft" />
        <h2 className="type-h2">Dialogue original</h2>
      </div>
      <div className="flex flex-col gap-2.5">
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
            <motion.div
              key={`${line.speakerLabel}-${line.start}`}
              initial={{ opacity: 0, x: right ? 30 : -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
              className={cn('flex', right ? 'justify-end' : 'justify-start')}
            >
              <div
                className={cn(
                  'w-[92%] border p-4 transition-[border-color,box-shadow] duration-300 sm:w-4/5',
                  right
                    ? 'rounded-[22px_22px_6px_22px] bg-[linear-gradient(160deg,color-mix(in_srgb,var(--violet)_18%,transparent),color-mix(in_srgb,var(--pink)_10%,transparent))]'
                    : 'rounded-[22px_22px_22px_6px] bg-surface',
                  playing ? 'border-violet' : right ? 'border-violet/30' : 'border-border',
                )}
                style={playing ? { boxShadow: `0 0 30px -10px ${tokens.violet}` } : undefined}
              >
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <span className={cn('type-overline', right ? 'text-pink' : 'text-cyan')}>Voix {line.speakerNumber}</span>
                  <span className="text-[11.5px] text-faint">{line.emotion} · {line.tone} · {time(line.start)}</span>
                </div>
                <p className="text-[17px] font-semibold leading-normal">{line.text}</p>
                {line.textFr ? <p className="mt-1 text-sm text-muted">{line.textFr}</p> : null}
                <div className="mt-2.5"><AudioPlayerBar track={track} {...player} /></div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
