import { Alert, Button as MuiButton, Paper, Stack, Typography } from '@mui/material';

import { Check, Delete, Keyboard, LayoutGrid, Volume2, X } from 'lucide-react';
import { LayoutGroup, motion } from 'motion/react';

import { QueryState } from '@/components/common/QueryState';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button, IconButton } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { Textarea } from '@/components/ui/form';
import { ResultPanel, SessionHeader } from '@/components/ui/SessionChrome';
import { useSentenceBuilder, type Tile } from '@/hooks/useSentenceBuilder';
import { cn } from '@/lib/utils';
import { feedback } from '@/services/feedbackService';
import { speakEnglish } from '@/services/speechPlaybackService';

export function SentenceBuilderPage() {
  const {
    trackingError, daily, exercise, exercises, generated, completed, index, answer, setAnswer,
    placed, setPlaced, keyboard, setKeyboard, correct, evaluation, score, pending, combo,
    tiles, byId, builtSentence, check, next, submit, restart,
  } = useSentenceBuilder();

  if (daily.isLoading) {
    return (
      <PageLayout reading>
        <QueryState loading skeletons={2} />
      </PageLayout>
    );
  }

  if (completed) {
    return (
      <PageLayout reading>
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Typography component="h1" variant="h5">Séance terminée</Typography>
            <Typography>{score.current} formulation(s) reconnue(s) · {pending.current} réponse(s) à vérifier.</Typography>
            <Typography variant="body2">Les formulations non reconnues restent à vérifier, sans pénalité. Aucun taux de réussite n’est calculé avec ces réponses.</Typography>
            <MuiButton variant="contained" onClick={restart}>Recommencer</MuiButton>
          </Stack>
        </Paper>
      </PageLayout>
    );
  }

  return (
    <PageLayout reading>
      {trackingError && <Alert severity="warning">Cette réponse n’a pas pu être enregistrée dans le suivi local.</Alert>}
      <SessionHeader
        progress={(index + (correct !== null ? 1 : 0)) / exercises.length}
        combo={combo.combo}
        label={`${index + 1}/${exercises.length}`}
        action={(
          <IconButton
            aria-label={keyboard ? 'Passer en mode tuiles' : 'Passer en mode clavier'}
            onClick={() => { feedback('select'); setKeyboard((value) => !value); }}
          >
            {keyboard ? <LayoutGrid /> : <Keyboard />}
          </IconButton>
        )}
      />

      <motion.div key={index} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ type: 'spring', stiffness: 280, damping: 26 }}>
        <Chip size="sm" label={exercise.hint} className="mb-4 bg-violet/12 text-violet" />
        {generated && index === 0 ? (
          <p className="mb-2 text-[12.5px] font-bold text-violet-soft">
            Phrases du jour, écrites pour toi avec tes mots à réviser
          </p>
        ) : null}
        <span className="type-overline text-muted">Traduis en anglais</span>
        <p className="mb-6 mt-1 font-display text-[26px] font-bold leading-[1.3] sm:text-[30px]">
          {exercise.prompt}
        </p>

        <form onSubmit={submit}>
          {keyboard ? (
            <Textarea
              autoFocus
              rows={3}
              placeholder="Ta phrase en anglais…"
              value={answer}
              disabled={correct !== null}
              onChange={(event) => setAnswer(event.target.value)}
              onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); if (correct !== null) next(); else check(); } }}
              autoCapitalize="sentences"
              aria-label="Ta phrase"
              className="min-h-[110px] resize-none text-[19px] font-semibold"
            />
          ) : (
            <LayoutGroup>
              <div
                className={cn(
                  'flex min-h-[116px] flex-wrap content-start gap-2 rounded-[20px] border-2 border-dashed bg-ink/[0.035] p-2.5 transition-colors duration-300',
                  correct === null ? 'border-border-strong' : correct ? 'border-mint' : 'border-red',
                )}
              >
                {placed.length === 0 ? (
                  <p className="p-2 text-sm font-semibold text-faint">Touche les mots dans l’ordre…</p>
                ) : null}
                {placed.map((id) => {
                  const tile = byId.get(id);
                  return tile ? (
                    <WordTile key={id} tile={tile} placed disabled={correct !== null} onClick={() => { feedback('tap'); setPlaced((current) => current.filter((item) => item !== id)); }} />
                  ) : null;
                })}
              </div>

              <div className="mt-1.5 flex min-h-10 justify-end">
                {placed.length && correct === null ? (
                  <Button size="sm" variant="ghost" onClick={() => setPlaced((current) => current.slice(0, -1))} className="text-muted">
                    <Delete />Effacer
                  </Button>
                ) : null}
              </div>

              <div className="mt-2 flex flex-wrap justify-center gap-2">
                {tiles.map((tile) => (
                  <div key={tile.id} className="relative">
                    {/* Emplacement fantôme pour que les tuiles restantes ne bougent pas. */}
                    <span className="flex h-[46px] items-center rounded-xl bg-ink/[0.045] px-3.5 text-[17px] font-bold text-transparent">
                      {tile.word}
                    </span>
                    {!placed.includes(tile.id) ? (
                      <div className="absolute inset-0">
                        <WordTile tile={tile} disabled={correct !== null} onClick={() => { feedback('select'); setPlaced((current) => [...current, tile.id]); }} />
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </LayoutGroup>
          )}

          {correct !== null ? (
            <div className="mt-5">
              <ResultPanel tone={correct ? 'success' : 'neutral'} title={correct ? 'Formulation reconnue' : 'Formulation à vérifier'} icon={correct ? <Check /> : <X />}>
                <div className="flex items-center gap-2">
                  <div className="flex-1"><p>{evaluation?.explanation}</p><p className="text-[17px] font-bold">Exemple : {exercise.expected}</p></div>
                  <IconButton aria-label="Écouter la phrase" onClick={() => speakEnglish(exercise.expected)} className="text-violet-soft">
                    <Volume2 />
                  </IconButton>
                </div>
              </ResultPanel>
            </div>
          ) : null}

          <Button
            type="submit"
            size="lg"
            variant={correct ? 'success' : 'primary'}
            disabled={!builtSentence.trim()}
            className="mt-5 min-h-14 w-full text-[17px]"
          >
            {correct !== null ? 'Suivant' : 'Vérifier'}
          </Button>
        </form>
      </motion.div>
    </PageLayout>
  );
}

function WordTile({ tile, placed = false, disabled, onClick }: { tile: Tile; placed?: boolean; disabled?: boolean; onClick: () => void }) {
  return (
    <motion.button
      type="button"
      layoutId={tile.id}
      onClick={disabled ? undefined : onClick}
      whileTap={disabled ? undefined : { scale: 0.92 }}
      transition={{ type: 'spring', stiffness: 520, damping: 34 }}
      className={cn(
        'flex h-[46px] items-center whitespace-nowrap rounded-xl border-[1.5px] border-b-4 px-3.5 text-[17px] font-bold text-fg',
        placed ? 'w-auto border-violet/50 bg-violet/16' : 'w-full border-border-strong bg-surface',
        disabled ? 'cursor-default' : 'cursor-pointer',
      )}
    >
      {tile.word}
    </motion.button>
  );
}
