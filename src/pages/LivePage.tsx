import { AudioLines, Check, Copy, ExternalLink } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useState } from 'react';

import { PageHeader } from '@/components/common/PageHeader';
import { PageLayout } from '@/components/layout/PageLayout';
import { LiveAnalysisPanel } from '@/components/live/LiveAnalysisPanel';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/form';
import { Toast } from '@/components/ui/toast';
import { feedback } from '@/services/feedbackService';
import { awardXp } from '@/services/xpService';
import { gradients } from '@/theme';

const COACH_PROMPT = `Tu es mon coach d'anglais. Lance une séance de 10 minutes niveau B1-B2 sur le thème du travail et des décisions. Pose une question à la fois, corrige brièvement mes erreurs et termine par un bilan structuré : points forts, erreurs récurrentes, expressions à revoir.`;

function StepBadge({ step, gradient }: { step: number; gradient: string }) {
  return (
    <span className="grid size-[34px] shrink-0 place-items-center rounded-[11px] font-display font-bold text-white" style={{ background: gradient }}>
      {step}
    </span>
  );
}

export function LivePage() {
  const [report, setReport] = useState(() => localStorage.getItem('english-fluency:last-live-report') ?? '');
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const closeToast = useCallback(() => setSaved(false), []);

  const copyPrompt = async () => {
    await navigator.clipboard.writeText(COACH_PROMPT);
    feedback('success');
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  };

  const saveReport = () => {
    const previous = localStorage.getItem('english-fluency:last-live-report');
    localStorage.setItem('english-fluency:last-live-report', report.trim());
    feedback('complete');
    if (previous !== report.trim()) awardXp(30, 'Séance Live');
    setSaved(true);
  };

  return (
    <PageLayout>
      <PageHeader eyebrow="Conversation" title="Séance Live" subtitle="Prépare ChatGPT Live, parle, puis garde ton bilan." />

      <div className="relative mb-5 overflow-hidden rounded-3xl border border-coral/30 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--amber)_14%,transparent),color-mix(in_srgb,var(--pink)_12%,transparent))] p-5">
        <div className="flex items-center gap-4">
          <div className="relative size-16 shrink-0">
            {[0, 1].map((ring) => (
              <motion.span
                key={ring}
                animate={{ scale: [1, 1.7], opacity: [0.5, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, delay: ring * 1.1, ease: 'easeOut' }}
                className="absolute inset-0 rounded-full bg-violet/40"
              />
            ))}
            <span className="relative grid size-16 place-items-center rounded-full bg-grad-primary text-white">
              <AudioLines className="size-8" />
            </span>
          </div>
          <div>
            <p className="font-display text-xl font-bold">10 minutes pour parler</p>
            <p className="text-sm text-muted">Vise la fluidité, pas la perfection. +30 XP au bilan.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="h-full">
          <CardContent className="p-[18px] sm:p-6">
            <div className="flex items-center gap-2.5">
              <StepBadge step={1} gradient={gradients.primary} />
              <h2 className="type-h2">Copier la mission</h2>
            </div>
            <div className="mt-4 rounded-2xl border-l-[3px] border-violet bg-ink/[0.035] p-4 text-[14.5px] leading-[1.7] text-muted">
              {COACH_PROMPT}
            </div>
            <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
              <Button variant={copied ? 'success' : 'primary'} onClick={copyPrompt} className="flex-1">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span key={copied ? 'ok' : 'copy'} initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }} className="grid">
                    {copied ? <Check /> : <Copy />}
                  </motion.span>
                </AnimatePresence>
                {copied ? 'Copiée !' : 'Copier la consigne'}
              </Button>
              <Button variant="outline" asChild className="flex-1">
                <a href="https://chatgpt.com" target="_blank" rel="noreferrer"><ExternalLink />Ouvrir ChatGPT</a>
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card className="h-full">
          <CardContent className="p-[18px] sm:p-6">
            <div className="flex items-center gap-2.5">
              <StepBadge step={2} gradient={gradients.sunrise} />
              <h2 className="type-h2">Importer le bilan</h2>
            </div>
            <p className="mb-4 mt-2 text-sm leading-relaxed text-muted">
              Colle le bilan de fin de conversation pour le retrouver ici.
            </p>
            <Textarea
              rows={7} value={report}
              onChange={(event) => setReport(event.target.value)}
              placeholder="Points forts, erreurs récurrentes, expressions à revoir…"
              aria-label="Bilan de la séance"
            />
            <Button size="lg" variant="secondary" className="mt-4 w-full" disabled={!report.trim()} onClick={saveReport}>
              <Check />Enregistrer le bilan
            </Button>
          </CardContent>
        </Card>
      </div>
      <LiveAnalysisPanel report={report} />
      <Toast open={saved} onClose={closeToast} message="Bilan enregistré sur cet appareil ✓" />
    </PageLayout>
  );
}
