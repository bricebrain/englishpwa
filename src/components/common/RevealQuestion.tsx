import { CircleHelp } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

import { Pressable } from '@/components/ui/motion';
import { feedback } from '@/services/feedbackService';

/** Question de compréhension dont la réponse, floutée, se révèle au toucher. */
export function RevealQuestion({ question, answer, onReveal }: { question: string; answer: string; onReveal?: () => void }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <div className="rounded-2xl border border-border bg-ink/[0.03] p-3.5">
      <div className="flex items-start gap-2">
        <CircleHelp className="mt-0.5 size-5 shrink-0 text-amber" />
        <p className="text-[14.5px] font-bold">{question}</p>
      </div>
      <Pressable
        onClick={() => { if (!revealed) { feedback('select'); setRevealed(true); onReveal?.(); } }}
        aria-label="Voir la réponse"
        className="mt-2"
      >
        <div className="relative overflow-hidden rounded-xl bg-mint/8 p-2.5">
          <motion.div animate={{ filter: revealed ? 'blur(0px)' : 'blur(7px)' }} transition={{ duration: 0.35 }}>
            <p className="text-sm">{answer}</p>
          </motion.div>
          {!revealed ? (
            <div className="absolute inset-0 grid place-items-center">
              <span className="font-display text-[13.5px] font-extrabold text-mint">Touche pour révéler</span>
            </div>
          ) : null}
        </div>
      </Pressable>
    </div>
  );
}
