import { ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

import { IconButton } from '@/components/ui/button';
import { softSpring } from '@/components/ui/springs';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  back?: boolean;
  action?: React.ReactNode;
}

export function PageHeader({ title, subtitle, eyebrow, back = false, action }: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="mb-6">
      <div className={`flex min-h-11 items-center justify-between gap-2 ${back ? 'mb-2' : ''}`}>
        {back ? (
          <IconButton aria-label="Revenir en arrière" onClick={() => navigate(-1)} className="-ml-1 border border-border bg-ink/5 text-fg">
            <ArrowLeft />
          </IconButton>
        ) : <span />}
        {action}
      </div>
      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={softSpring}>
        {eyebrow ? <span className="type-overline text-violet-soft">{eyebrow}</span> : null}
        <h1 className="type-h1">{title}</h1>
        {subtitle ? <p className="mt-1.5 text-[15px] leading-normal text-muted">{subtitle}</p> : null}
      </motion.div>
    </header>
  );
}
