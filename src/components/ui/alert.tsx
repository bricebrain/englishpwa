import { CircleAlert, CircleCheck, Info, TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type Tone = 'info' | 'success' | 'warning' | 'error';

const TONES: Record<Tone, { className: string; icon: ReactNode }> = {
  info: { className: 'bg-cyan/10 text-info-fg border-cyan/25', icon: <Info /> },
  success: { className: 'bg-mint/10 text-success-fg border-mint/25', icon: <CircleCheck /> },
  warning: { className: 'bg-amber/10 text-warning-fg border-amber/25', icon: <TriangleAlert /> },
  error: { className: 'bg-red/10 text-error-fg border-red/25', icon: <CircleAlert /> },
};

export function Alert({ severity = 'info', icon, action, className, children }: {
  severity?: Tone;
  icon?: ReactNode | false;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  const tone = TONES[severity];
  return (
    <div role={severity === 'error' ? 'alert' : 'status'} className={cn('flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm leading-relaxed', tone.className, className)}>
      {icon === false ? null : <span className="mt-0.5 shrink-0 [&_svg]:size-5">{icon ?? tone.icon}</span>}
      <div className="min-w-0 flex-1 py-px">{children}</div>
      {action ? <div className="-my-1 shrink-0">{action}</div> : null}
    </div>
  );
}
