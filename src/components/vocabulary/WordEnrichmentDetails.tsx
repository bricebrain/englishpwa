import { Volume2 } from 'lucide-react';

import { IconButton } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import {
  collocationKindLabel,
  getVocabularyCollocations,
  getVocabularySenses,
  partOfSpeechLabel,
  type VocabularyWordLike,
} from '@/helpers/vocabularyDisplay';
import { cn } from '@/lib/utils';
import { speakEnglish } from '@/services/speechPlaybackService';

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
    <div className="rounded-xl bg-surface p-4">
      <span className="type-overline mb-2 text-violet-soft">{title}</span>

      {senses.length ? (
        <div className="flex flex-col gap-2.5">
          {senses.map((sense) => (
            <div key={sense.senseKey || sense.translation} className={cn('border-l-[3px] pl-3', sense.senseKey === senseKey ? 'border-mint' : 'border-violet')}>
              <div className="flex flex-wrap items-center gap-1.5">
                <p className="font-bold">{sense.translation}</p>
                <Chip size="sm" label={partOfSpeechLabel(sense.partOfSpeech)} />
              </div>
              {sense.exampleEn ? (
                <div className="mt-1 flex items-start gap-1">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm italic">{sense.exampleEn}</p>
                    {sense.exampleFr ? <p className="text-[13px] text-muted">{sense.exampleFr}</p> : null}
                  </div>
                  <IconButton
                    size="sm"
                    aria-label="Écouter l’exemple"
                    onClick={(event) => { event.stopPropagation(); speakEnglish(sense.exampleEn); }}
                    className="text-violet-soft"
                  >
                    <Volume2 />
                  </IconButton>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      {collocations.length ? (
        <div className={cn('flex flex-col gap-1.5', senses.length && 'mt-3.5')}>
          {collocations.map((item) => (
            <div key={`${item.kind}-${item.en}`} className="flex flex-wrap items-baseline gap-2">
              <Chip size="sm" label={collocationKindLabel(item.kind)} className="bg-cyan/12 text-cyan" />
              <p className="text-[14.5px] font-bold">{item.en}</p>
              {item.fr ? <p className="text-[13.5px] text-muted">= {item.fr}</p> : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
