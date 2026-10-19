import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { SectionHeader } from '@/components/ui/list';
import { Pressable } from '@/components/ui/motion';
import { useDailyStory } from '@/hooks/useAiFeatures';

/** Accroche de l'histoire du jour (rien n'est affiché si elle n'est pas disponible). */
export function DailyStoryCard() {
  const navigate = useNavigate();
  const story = useDailyStory();
  if (!story.data) return null;
  const teaser = story.data.textEn.split(/(?<=[.!?])\s+/).slice(0, 2).join(' ');

  return (
    <section>
      <SectionHeader>Lecture du jour</SectionHeader>
      <Pressable onClick={() => navigate('/histoire')} aria-label="Lire l’histoire du jour">
        <span className="flex flex-col gap-1 rounded-xl bg-surface px-4 py-3.5">
          <span className="flex items-center justify-between gap-2">
            <span className="truncate text-[17px] font-semibold">{story.data.title}</span>
            <ChevronRight className="size-[18px] shrink-0 text-chevron" strokeWidth={2.6} />
          </span>
          <span className="line-clamp-2 text-[15px] leading-5 text-muted">{teaser}</span>
          <span className="mt-1 text-[13px] font-medium text-violet">
            {story.data.questions.length} questions · {story.data.wordsUsed.length} de tes mots
          </span>
        </span>
      </Pressable>
    </section>
  );
}
