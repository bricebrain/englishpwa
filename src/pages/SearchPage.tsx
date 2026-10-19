import { Languages, Search, Volume2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, type FormEvent } from 'react';

import { PageHeader } from '@/components/common/PageHeader';
import { QueryState } from '@/components/common/QueryState';
import { PageLayout } from '@/components/layout/PageLayout';
import { IconButton } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { Pressable } from '@/components/ui/motion';
import { Segmented } from '@/components/ui/segmented';
import { SOURCE_LABELS } from '@/helpers/passageSources';
import { useSemanticSearch } from '@/hooks/useAiFeatures';
import { feedback } from '@/services/feedbackService';
import { speakEnglish } from '@/services/speechPlaybackService';
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

      <form onSubmit={submit} className="mb-4">
        <label className="flex items-center gap-2 rounded-[20px] border-2 border-border bg-surface px-4 py-1.5 transition-colors focus-within:border-violet">
          <Search className="size-6 shrink-0 text-faint" />
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Ex. : comment refuser poliment"
            aria-label="Recherche"
            enterKeyHint="search"
            className="min-h-11 w-full bg-transparent text-[17px] outline-none placeholder:text-faint"
          />
        </label>
      </form>

      {!query ? (
        <div className="mb-4 flex flex-wrap gap-2">
          {SUGGESTIONS.map((suggestion) => (
            <Pressable key={suggestion} onClick={() => { setDraft(suggestion); setQuery(suggestion); }} aria-label={suggestion} className="w-auto">
              <Chip label={suggestion} className="hover:bg-ink/12" />
            </Pressable>
          ))}
        </div>
      ) : null}

      <Segmented
        aria-label="Source"
        size="sm"
        value={source}
        onChange={setSource}
        options={[{ value: 'all', label: 'Tout' }, { value: 'content', label: 'Scripts' }, { value: 'reading', label: 'Articles' }]}
        className="mb-4"
      />

      <QueryState
        loading={search.isLoading && Boolean(query)}
        error={search.isError}
        empty={Boolean(query) && !search.isLoading && !search.isError && !search.data?.length}
        emptyLabel="Aucun passage proche. Essaie une autre formulation."
        onRetry={() => search.refetch()}
      />

      <div className="flex flex-col gap-2.5">
        {search.data?.map((result, index) => {
          const key = `${result.source}-${result.refId}`;
          const frVisible = showFr.has(key);
          return (
            <motion.div key={key} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
              <Card>
                <CardContent>
                  <div className="mb-2 flex items-center gap-1.5">
                    <Chip size="sm" label={SOURCE_LABELS[result.source]} />
                    {result.level ? <Chip size="sm" label={result.level} /> : null}
                    <span className="min-w-0 flex-1 truncate text-xs text-muted">{result.title}</span>
                    <span className="text-[11.5px] font-extrabold text-violet-soft">{Math.round(result.score * 100)} %</span>
                  </div>
                  <p className="text-[15.5px] leading-[1.7]">{result.text}</p>
                  {frVisible && result.textFr ? (
                    <p className="mt-2 border-l-[3px] border-cyan pl-3 text-sm leading-relaxed text-muted">{result.textFr}</p>
                  ) : null}
                  <div className="mt-2 flex gap-1">
                    <IconButton aria-label="Écouter le passage" onClick={() => speakEnglish(result.text)} className="text-violet-soft"><Volume2 /></IconButton>
                    {result.textFr ? (
                      <Pressable
                        onClick={() => setShowFr((current) => { const next = new Set(current); if (next.has(key)) next.delete(key); else next.add(key); return next; })}
                        aria-label="Afficher la traduction"
                        className="w-auto"
                      >
                        <span className="flex h-10 items-center gap-1 rounded-xl px-2.5 text-sm font-bold text-cyan">
                          <Languages className="size-5" /> {frVisible ? 'Masquer le français' : 'Français'}
                        </span>
                      </Pressable>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </PageLayout>
  );
}
