import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded';
import { Box, Button, Card, CardContent, Chip, Grid, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { useState } from 'react';

import { PageHeader } from '@/components/common/PageHeader';
import { QueryState } from '@/components/common/QueryState';
import { PageLayout } from '@/components/layout/PageLayout';
import { GuidedArticlePanel } from '@/components/reading/GuidedArticlePanel';
import { MotionBox, Pressable, Stagger, StaggerItem } from '@/components/ui/motion';
import { useReadingItems } from '@/hooks/useReadingLibrary';
import { feedback } from '@/services/feedbackService';
import { gradients, tokens } from '@/theme';
import type { ReadingItem } from '@/types/reading';

const CARD_GRADIENTS = [gradients.primary, gradients.ocean, gradients.sunrise, gradients.mint];

export function ReadingPage() {
  const [level, setLevel] = useState('Tout');
  const [selected, setSelected] = useState<ReadingItem | null>(null);
  const query = useReadingItems(level);

  return (
    <PageLayout>
      <PageHeader back eyebrow="Compréhension écrite" title="Lire" subtitle="Lecture guidée et articles" />

      {selected ? (
        <MotionBox initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 26 }}>
          <Button startIcon={<ArrowBackRounded />} onClick={() => setSelected(null)} sx={{ mb: 1.5, color: tokens.violetSoft }}>Bibliothèque</Button>
          <GuidedArticlePanel item={selected} />
        </MotionBox>
      ) : (
        <>
          <ToggleButtonGroup exclusive value={level} onChange={(_, value) => { if (value) { feedback('select'); setLevel(value); } }} size="small" sx={{ mb: 2 }}>
            {['Tout', 'A2', 'B1', 'B2', 'C1'].map((item) => <ToggleButton key={item} value={item}>{item}</ToggleButton>)}
          </ToggleButtonGroup>
          <QueryState loading={query.isLoading} error={query.isError} empty={!query.data?.length} onRetry={() => query.refetch()} />
          <Stagger gap={0.05}>
            <Grid container spacing={1.5}>
              {query.data?.map((item, index) => {
                const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length]!;
                return (
                  <Grid item xs={12} sm={6} key={item.id}>
                    <StaggerItem sx={{ height: '100%' }}>
                      <Pressable onClick={() => setSelected(item)} aria-label={item.title} sx={{ height: '100%' }}>
                        <Card sx={{ height: '100%', overflow: 'hidden' }}>
                          <Box sx={{ height: 6, background: gradient }} />
                          <CardContent>
                            <Stack direction="row" justifyContent="space-between" gap={1} alignItems="flex-start">
                              <Typography variant="h3" lineHeight={1.3}>{item.title}</Typography>
                              <Chip label={item.level} size="small" sx={{ background: gradient, color: '#fff', flexShrink: 0 }} />
                            </Stack>
                            <Typography color="text.secondary" fontSize={13.5} mt={0.75} lineHeight={1.55}>{item.description}</Typography>
                            <Stack direction="row" gap={0.75} mt={1.75} flexWrap="wrap" useFlexGap>
                              <Chip size="small" label={item.category} />
                              <Chip size="small" label={`${item.segmentCount} parties`} />
                              <Chip size="small" label={`${item.wordCount} mots`} />
                            </Stack>
                          </CardContent>
                        </Card>
                      </Pressable>
                    </StaggerItem>
                  </Grid>
                );
              })}
            </Grid>
          </Stagger>
        </>
      )}
    </PageLayout>
  );
}
