import { Languages, Volume2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Fragment, useState } from 'react';

import { PageHeader } from '@/components/common/PageHeader';
import { QueryState } from '@/components/common/QueryState';
import { RevealQuestion } from '@/components/common/RevealQuestion';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { Pressable } from '@/components/ui/motion';
import { useDailyStory } from '@/hooks/useAiFeatures';
import { speakEnglish, stopEnglishSpeech } from '@/services/speechPlaybackService';
import { awardXp } from '@/services/xpService';

/** Met en évidence tous les mots du jour (et leurs formes simples) dans le texte. */
function StoryText({ text, words }: { text: string; words: string[] }) {
  if (!words.length) return <>{text}</>;
  const alternatives = words.map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const parts = text.split(new RegExp(`(\\b(?:${alternatives})(?:s|es|ed|d|ing|'s)?\\b)`, 'gi'));
  return (
    <>
      {parts.map((part, index) => (index % 2 === 1
        ? <strong key={index} className="text-violet">{part}</strong>
        : <Fragment key={index}>{part}</Fragment>))}
    </>
  );
}

export function StoryPage() {
  const story = useDailyStory();
  const [showFr, setShowFr] = useState(false);
  const [revealed, setRevealed] = useState<Set<number>>(() => new Set());
  const [playing, setPlaying] = useState(false);
  const data = story.data;

  const listen = async () => {
    if (!data) return;
    if (playing) {
      stopEnglishSpeech();
      setPlaying(false);
      return;
    }
    setPlaying(true);
    try { await speakEnglish(data.textEn); } finally { setPlaying(false); }
  };

  const reveal = (index: number) => {
    if (revealed.has(index)) return;
    const next = new Set(revealed).add(index);
    setRevealed(next);
    if (data && next.size === data.questions.length) awardXp(15, 'Histoire du jour');
  };

  return (
    <PageLayout reading>
      <PageHeader back eyebrow="Lecture du jour" title={data?.title ?? 'Histoire du jour'} subtitle="Une histoire écrite pour toi avec les mots que tu révises." />
      <QueryState
        loading={story.isLoading}
        error={story.isError}
        empty={!story.isLoading && !story.isError && !data}
        emptyLabel="L’histoire du jour n’est pas encore prête. Reviens un peu plus tard."
        onRetry={() => story.refetch()}
      />

      {data ? (
        <div className="flex flex-col gap-4">
          {data.wordsUsed.length ? (
            <div className="flex flex-wrap gap-1.5">
              {data.wordsUsed.map((word) => (
                <Pressable key={word} onClick={() => speakEnglish(word)} aria-label={`Écouter ${word}`} className="w-auto">
                  <Chip size="sm" label={word} className="bg-violet/12 text-violet" />
                </Pressable>
              ))}
            </div>
          ) : null}

          <Card>
            <CardContent className="p-[18px] sm:p-6">
              <p className="font-display text-lg leading-[1.85]">
                <StoryText text={data.textEn} words={data.wordsUsed} />
              </p>
              {showFr ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 border-l-[3px] border-cyan pl-3">
                  <p className="leading-[1.7] text-muted">{data.textFr}</p>
                </motion.div>
              ) : null}
              <div className="mt-4 flex flex-wrap gap-2">
                <Button onClick={() => void listen()}><Volume2 />{playing ? 'Arrêter' : 'Écouter'}</Button>
                <Button variant="outline" onClick={() => setShowFr((value) => !value)}><Languages />{showFr ? 'Masquer le français' : 'Voir le français'}</Button>
              </div>
            </CardContent>
          </Card>

          <h3 className="type-h3">As-tu compris ?</h3>
          {data.questions.map((item, index) => (
            <RevealQuestion key={item.question} question={item.question} answer={item.answer} onReveal={() => reveal(index)} />
          ))}
        </div>
      ) : null}
    </PageLayout>
  );
}
