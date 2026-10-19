import { Check, Plus, Volume2 } from 'lucide-react';
import { useState } from 'react';

import { QueryState } from '@/components/common/QueryState';
import { RevealQuestion } from '@/components/common/RevealQuestion';
import { Button, IconButton } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { Pressable } from '@/components/ui/motion';
import { usePromoteReadingVocabulary, useReadingSegments } from '@/hooks/useReadingLibrary';
import { feedback } from '@/services/feedbackService';
import { speakEnglish } from '@/services/speechPlaybackService';
import { awardXp } from '@/services/xpService';
import type { ReadingItem } from '@/types/reading';

export function GuidedArticlePanel({ item }: { item: ReadingItem }) {
  const query = useReadingSegments(item.id);
  const promote = usePromoteReadingVocabulary();
  const [added, setAdded] = useState<Set<string>>(() => new Set());

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-3xl border border-pink/25 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--pink)_14%,transparent),color-mix(in_srgb,var(--violet)_12%,transparent))] p-5">
        <div className="mb-2.5 flex gap-2">
          <Chip size="sm" label={item.level} className="bg-grad-primary text-white" />
          <Chip size="sm" label={`${item.wordCount} mots`} />
        </div>
        <h1 className="type-h1 text-[26px]">{item.title}</h1>
        <p className="mt-2 leading-relaxed text-muted">{item.summaryFr ?? item.description}</p>
      </div>

      <QueryState loading={query.isLoading} error={query.isError} empty={!query.data?.length} onRetry={() => query.refetch()} />
      {query.data?.map((segment) => {
        const question = segment.questions[0];
        const isAdded = added.has(segment.id);
        return (
          <Card key={segment.id}>
            <CardContent className="p-[18px] sm:p-6">
              <div className="flex items-center justify-between">
                <span className="type-overline text-pink">Partie {segment.segmentIndex + 1}</span>
                <IconButton aria-label="Écouter cette partie" onClick={() => speakEnglish(segment.text)} className="-mr-2 text-violet-soft">
                  <Volume2 />
                </IconButton>
              </div>
              <h3 className="type-h3 text-[19px]">{segment.title}</h3>
              <p className="mt-3 text-[16.5px] leading-[1.9]">{segment.text}</p>
              <div className="mt-4 rounded-2xl border-l-[3px] border-cyan bg-cyan/7 p-3.5">
                <p className="text-sm leading-relaxed text-muted">{segment.summaryFr}</p>
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {segment.vocabulary.map((word) => (
                  <Pressable key={word} onClick={() => speakEnglish(word)} aria-label={`Écouter ${word}`} className="w-auto">
                    <Chip size="sm" label={word} className="bg-violet/12 text-violet-soft" />
                  </Pressable>
                ))}
              </div>
              <Button
                size="sm"
                variant={isAdded ? 'success' : 'outline'}
                disabled={promote.isPending || isAdded}
                onClick={() => promote.mutate(
                  { level: segment.level, vocabulary: segment.vocabulary, example: segment.text },
                  { onSuccess: () => { feedback('success'); awardXp(5); setAdded((current) => new Set(current).add(segment.id)); } },
                )}
                className={isAdded ? 'mt-3 disabled:opacity-100' : 'mt-3'}
              >
                {isAdded ? <Check /> : <Plus />}
                {isAdded ? 'Ajouté au SRS' : 'Ajouter le vocabulaire au SRS'}
              </Button>

              {question ? (
                <div className="mt-4">
                  <RevealQuestion question={question.question} answer={question.answer} />
                </div>
              ) : null}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
