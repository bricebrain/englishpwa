import { Check } from 'lucide-react';
import { motion } from 'motion/react';

import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';
import { feedback } from '@/services/feedbackService';
import type { ThemePreference } from '@/services/themePreference';

const PREVIEW = {
  light: { bg: '#ffffff', card: '#f4f4f8', ink: '#1c1c1e' },
  dark: { bg: '#0e0f14', card: '#1a1b22', ink: '#ededf0' },
};

/** Mini-écran d'aperçu : fond, carte en dégradé, deux lignes de texte. */
function Preview({ mode }: { mode: 'light' | 'dark' }) {
  const p = PREVIEW[mode];
  return <span className="relative block h-24 overflow-hidden rounded-[14px] border border-border" style={{ background: p.bg }}>
    <span className="absolute inset-x-2.5 top-2.5 h-9 rounded-[10px] bg-grad-primary" />
    <span className="absolute left-2.5 top-[52px] h-2 w-16 rounded-full opacity-80" style={{ background: p.ink }} />
    <span className="absolute left-2.5 right-2.5 top-[66px] h-5 rounded-[7px]" style={{ background: p.card }} />
  </span>;
}

/** Choix du thème par aperçus : Clair, Sombre, ou Automatique (suit le téléphone). */
export function ThemePicker() {
  const { preference, resolved, setPreference } = useTheme();
  const options: [ThemePreference, string][] = [['light', 'Clair'], ['dark', 'Sombre'], ['system', 'Automatique']];
  return <div className="grid grid-cols-3 gap-2.5">
    {options.map(([value, label]) => {
      const on = preference === value;
      return <motion.button key={value} type="button" whileTap={{ scale: 0.95 }} aria-pressed={on}
        onClick={() => { feedback('select'); setPreference(value); }}
        className={cn('relative flex flex-col gap-2 rounded-[18px] p-2 text-left transition-colors', on ? 'bg-violet/12' : 'bg-surface')}>
        {value === 'system'
          ? <span className="relative block h-24 overflow-hidden rounded-[14px]">
              <span className="absolute inset-y-0 left-0 w-1/2 overflow-hidden"><span className="block w-[200%]"><Preview mode="light" /></span></span>
              <span className="absolute inset-y-0 right-0 w-1/2 overflow-hidden"><span className="-ml-[100%] block w-[200%]"><Preview mode="dark" /></span></span>
            </span>
          : <Preview mode={value} />}
        <span className="flex items-center justify-between px-1 pb-0.5">
          <span className={cn('text-[15px] font-semibold', on && 'text-violet')}>{label}</span>
          {on ? <motion.span layoutId="theme-check" className="grid size-5 place-items-center rounded-full bg-grad-primary text-white"><Check className="size-3.5" strokeWidth={3} /></motion.span> : null}
        </span>
        {value === 'system' && on ? <span className="px-1 text-[12px] text-muted">Actuellement {resolved === 'dark' ? 'sombre' : 'clair'}</span> : null}
      </motion.button>;
    })}
  </div>;
}
