import { Volume2 } from 'lucide-react';
import { Fragment } from 'react';

import { IconButton } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { SOURCE_LABELS } from '@/helpers/passageSources';
import { useWordContexts } from '@/hooks/useAiFeatures';
import { speakEnglish } from '@/services/speechPlaybackService';

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
        ? <strong key={index} className="text-violet">{part}</strong>
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
    <div className="rounded-xl bg-surface p-4">
      <span className="type-overline mb-2 text-cyan">Dans tes contenus</span>
      <div className="flex flex-col gap-2.5">
        {contexts.map((context) => (
          <div key={`${context.parentId}-${context.sentence}`} className="flex items-start gap-1">
            <div className="min-w-0 flex-1">
              <p className="text-[14.5px] leading-normal"><HighlightedSentence sentence={context.sentence} word={word} /></p>
              <div className="mt-1 flex items-center gap-1.5">
                <Chip size="sm" label={SOURCE_LABELS[context.source]} />
                <span className="truncate text-xs text-muted">{context.title}</span>
              </div>
            </div>
            <IconButton
              size="sm"
              aria-label="Écouter la phrase"
              onClick={(event) => { event.stopPropagation(); speakEnglish(context.sentence); }}
              className="text-violet-soft"
            >
              <Volume2 />
            </IconButton>
          </div>
        ))}
      </div>
    </div>
  );
}
