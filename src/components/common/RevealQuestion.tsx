import HelpRounded from '@mui/icons-material/HelpRounded';
import { Box, Stack, Typography } from '@mui/material';
import { useState } from 'react';

import { MotionBox, Pressable } from '@/components/ui/motion';
import { feedback } from '@/services/feedbackService';
import { displayFont, tokens } from '@/theme';

/** Question de compréhension dont la réponse, floutée, se révèle au toucher. */
export function RevealQuestion({ question, answer, onReveal }: { question: string; answer: string; onReveal?: () => void }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <Box sx={{ p: 1.75, borderRadius: 4, background: 'rgba(49,39,78,0.03)', border: `1px solid ${tokens.border}` }}>
      <Stack direction="row" gap={1} alignItems="flex-start">
        <HelpRounded sx={{ color: tokens.amber, mt: 0.25, fontSize: 20 }} />
        <Typography fontWeight={750} fontSize={14.5}>{question}</Typography>
      </Stack>
      <Pressable
        onClick={() => { if (!revealed) { feedback('select'); setRevealed(true); onReveal?.(); } }}
        aria-label="Voir la réponse"
        sx={{ mt: 1 }}
      >
        <Box position="relative" sx={{ p: 1.25, borderRadius: 3, background: 'rgba(22,135,93,0.08)', overflow: 'hidden' }}>
          <MotionBox animate={{ filter: revealed ? 'blur(0px)' : 'blur(7px)' }} transition={{ duration: 0.35 }}>
            <Typography fontSize={14}>{answer}</Typography>
          </MotionBox>
          {!revealed ? (
            <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
              <Typography fontFamily={displayFont} fontWeight={800} fontSize={13.5} color={tokens.mint}>Touche pour révéler</Typography>
            </Box>
          ) : null}
        </Box>
      </Pressable>
    </Box>
  );
}
