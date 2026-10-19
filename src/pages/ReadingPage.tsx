import { ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

import { PageHeader } from '@/components/common/PageHeader';
import { QueryState } from '@/components/common/QueryState';
import { PageLayout } from '@/components/layout/PageLayout';
import { GuidedArticlePanel } from '@/components/reading/GuidedArticlePanel';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { Pressable, Stagger, StaggerItem } from '@/components/ui/motion';
import { Segmented } from '@/components/ui/segmented';
import { useReadingItems } from '@/hooks/useReadingLibrary';
import { gradients } from '@/theme';
import type { ReadingItem } from '@/types/reading';

const CARD_GRADIENTS = [gradients.primary, gradients.ocean, gradients.sunrise, gradients.mint];
const LEVELS = ['Tout', 'A2', 'B1', 'B2', 'C1'];

export function ReadingPage() {
  const [level, setLevel] = useState('Tout');
  const [selected, setSelected] = useState<ReadingItem | null>(null);
  const query = useReadingItems(level);

  return (
    <PageLayout>
      <PageHeader back eyebrow="Compréhension écrite" title="Lire" subtitle="Lecture guidée et articles" />

      {selected ? (
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 26 }}>
          <Button variant="ghost" onClick={() => setSelected(null)} className="-ml-2 mb-3 text-violet-soft"><ArrowLeft />Bibliothèque</Button>
          <GuidedArticlePanel item={selected} />
        </motion.div>
      ) : (
        <>
          <Segmented
            aria-label="Niveau"
            size="sm"
            value={level}
            onChange={setLevel}
            options={LEVELS.map((item) => ({ value: item, label: item }))}
            className="mb-4"
          />
          <QueryState loading={query.isLoading} error={query.isError} empty={!query.data?.length} onRetry={() => query.refetch()} />
          <Stagger gap={0.05} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {query.data?.map((item, index) => {
              const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length]!;
              return (
                <StaggerItem key={item.id} className="h-full">
                  <Pressable onClick={() => setSelected(item)} aria-label={item.title} className="h-full">
                    <Card className="h-full overflow-hidden">
                      <div className="h-1.5" style={{ background: gradient }} />
                      <CardContent>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="type-h3">{item.title}</h3>
                          <Chip size="sm" label={item.level} className="text-white" style={{ background: gradient }} />
                        </div>
                        <p className="mt-1.5 text-[13.5px] leading-[1.55] text-muted">{item.description}</p>
                        <div className="mt-3.5 flex flex-wrap gap-1.5">
                          <Chip size="sm" label={item.category} />
                          <Chip size="sm" label={`${item.segmentCount} parties`} />
                          <Chip size="sm" label={`${item.wordCount} mots`} />
                        </div>
                      </CardContent>
                    </Card>
                  </Pressable>
                </StaggerItem>
              );
            })}
          </Stagger>
        </>
      )}
    </PageLayout>
  );
}
