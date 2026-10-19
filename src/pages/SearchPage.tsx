import SearchRounded from '@mui/icons-material/SearchRounded';
import TranslateRounded from '@mui/icons-material/TranslateRounded';
import VolumeUpRounded from '@mui/icons-material/VolumeUpRounded';
import { Box, Card, CardContent, Chip, IconButton, InputBase, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { useState, type FormEvent } from 'react';

import { PageHeader } from '@/components/common/PageHeader';
import { QueryState } from '@/components/common/QueryState';
import { PageLayout } from '@/components/layout/PageLayout';
import { MotionBox, Pressable } from '@/components/ui/motion';
import { SOURCE_LABELS } from '@/helpers/passageSources';
import { useSemanticSearch } from '@/hooks/useAiFeatures';
import { feedback } from '@/services/feedbackService';
import { speakEnglish } from '@/services/speechPlaybackService';
import { tokens } from '@/theme';
import type { PassageSource } from '@/types/aiFeatures';

const SUGGESTIONS = ['parler d’argent', 's’excuser poliment', 'prendre une décision', 'la météo', 'au travail'];

export function SearchPage() {
  const [draft, setDraft] = useState('');
  const [query, setQuery] = useState('');
  const [source, setSource] = useState<PassageSource | 'all'>('all');
  const [showFr, setShowFr] = useState<Set<string>>(() => new Set());
  const search = useSemanticSearch(query, source === 'all' ? undefined : source);

  const submit = (event?: FormEvent) => {
    event?.preventDefault();
    if (draft.trim().length >= 2) {
      feedback('select');
      setQuery(draft.trim());
    }
  };

  return (
    <PageLayout reading>
      <PageHeader back eyebrow="Recherche par le sens" title="Rechercher" subtitle="Décris une idée, en français ou en anglais : je retrouve les passages de tes contenus qui en parlent." />

      <Box component="form" onSubmit={submit} mb={2}>
        <Stack
          direction="row" alignItems="center" gap={1} px={2} py={0.75} borderRadius={5}
          sx={{ background: tokens.surface, border: `2px solid ${tokens.border}`, '&:focus-within': { borderColor: tokens.violet } }}
        >
          <SearchRounded sx={{ color: tokens.textFaint }} />
          <InputBase
            fullWidth
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Ex. : comment refuser poliment"
            inputProps={{ 'aria-label': 'Recherche', enterKeyHint: 'search' }}
            sx={{ fontSize: 17 }}
          />
        </Stack>
      </Box>

      {!query ? (
        <Stack direction="row" gap={1} flexWrap="wrap" useFlexGap mb={2}>
          {SUGGESTIONS.map((suggestion) => (
            <Chip key={suggestion} label={suggestion} onClick={() => { setDraft(suggestion); setQuery(suggestion); }} sx={{ cursor: 'pointer' }} />
          ))}
        </Stack>
      ) : null}

      <ToggleButtonGroup exclusive size="small" value={source} onChange={(_, value) => { if (value) setSource(value); }} sx={{ mb: 2 }}>
        <ToggleButton value="all">Tout</ToggleButton>
        <ToggleButton value="content">Scripts</ToggleButton>
        <ToggleButton value="reading">Articles</ToggleButton>
      </ToggleButtonGroup>

      <QueryState
        loading={search.isLoading && Boolean(query)}
        error={search.isError}
        empty={Boolean(query) && !search.isLoading && !search.isError && !search.data?.length}
        emptyLabel="Aucun passage proche. Essaie une autre formulation."
        onRetry={() => search.refetch()}
      />

      <Stack gap={1.25}>
        {search.data?.map((result, index) => {
          const key = `${result.source}-${result.refId}`;
          const frVisible = showFr.has(key);
          return (
            <MotionBox key={key} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
              <Card>
                <CardContent>
                  <Stack direction="row" alignItems="center" gap={0.75} mb={1}>
                    <Chip size="small" label={SOURCE_LABELS[result.source]} />
                    {result.level ? <Chip size="small" label={result.level} /> : null}
                    <Typography fontSize={12} color="text.secondary" noWrap flex={1}>{result.title}</Typography>
                    <Typography fontSize={11.5} fontWeight={800} color={tokens.violetSoft}>{Math.round(result.score * 100)} %</Typography>
                  </Stack>
                  <Typography lineHeight={1.7} fontSize={15.5}>{result.text}</Typography>
                  {frVisible && result.textFr ? (
                    <Typography lineHeight={1.6} fontSize={14} color="text.secondary" mt={1} sx={{ pl: 1.5, borderLeft: `3px solid ${tokens.cyan}` }}>{result.textFr}</Typography>
                  ) : null}
                  <Stack direction="row" gap={0.5} mt={1}>
                    <IconButton aria-label="Écouter le passage" onClick={() => speakEnglish(result.text)} sx={{ color: tokens.violetSoft }}><VolumeUpRounded /></IconButton>
                    {result.textFr ? (
                      <Pressable
                        onClick={() => setShowFr((current) => { const next = new Set(current); if (next.has(key)) next.delete(key); else next.add(key); return next; })}
                        aria-label="Afficher la traduction"
                        sx={{ width: 'auto' }}
                      >
                        <Stack direction="row" alignItems="center" gap={0.5} px={1.25} height={40} borderRadius={3} sx={{ color: tokens.cyan, fontWeight: 700, fontSize: 14 }}>
                          <TranslateRounded fontSize="small" /> {frVisible ? 'Masquer le français' : 'Français'}
                        </Stack>
                      </Pressable>
                    ) : null}
                  </Stack>
                </CardContent>
              </Card>
            </MotionBox>
          );
        })}
      </Stack>
    </PageLayout>
  );
}
