import { BookOpen, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Card, CardContent } from '@/components/ui/card';
import { Pressable } from '@/components/ui/motion';
import { IconTile } from '@/components/ui/SessionChrome';
import { useDailyStory } from '@/hooks/useAiFeatures';
import { gradients } from '@/theme';

/** Accroche de l'histoire du jour (rien n'est affiché si elle n'est pas disponible). */
export function DailyStoryCard() {
  const navigate = useNavigate();
  const story = useDailyStory();
  if (!story.data) return null;
  const teaser = story.data.textEn.split(/(?<=[.!?])\s+/).slice(0, 2).join(' ');

  return (
    <Pressable onClick={() => navigate('/histoire')} aria-label="Lire l’histoire du jour">
      <Card className="overflow-hidden">
        <div className="absolute -right-10 -top-[50px] size-40 rounded-full bg-grad-sunrise opacity-15 blur-[20px]" />
        <CardContent className="relative">
          <div className="flex items-center gap-3">
            <IconTile icon={<BookOpen />} gradient={gradients.sunrise} />
            <div className="min-w-0 flex-1">
              <span className="type-overline text-coral">Histoire du jour</span>
              <h3 className="type-h3 truncate">{story.data.title}</h3>
            </div>
            <ChevronRight className="size-6 text-faint" />
          </div>
          <p className="mt-2.5 line-clamp-2 text-sm leading-[1.55] text-muted">{teaser}</p>
          <p className="mt-2 text-[12.5px] font-bold text-violet-soft">
            {story.data.wordsUsed.length} de tes mots à réviser · {story.data.questions.length} questions
          </p>
        </CardContent>
      </Card>
    </Pressable>
  );
}
