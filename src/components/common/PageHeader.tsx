import { ChevronLeft } from 'lucide-react';
import { motion, useScroll, useTransform } from 'motion/react';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  back?: boolean;
  backLabel?: string;
  action?: React.ReactNode;
  /** Élément aligné sur le grand titre, à droite (avatar…). */
  trailing?: React.ReactNode;
}

/**
 * En-tête iOS : grand titre dans la page, puis une barre compacte floutée
 * qui apparaît en haut quand le grand titre sort de l'écran.
 */
export function PageHeader({ title, subtitle, eyebrow, back = false, backLabel = 'Retour', action, trailing }: PageHeaderProps) {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const barOpacity = useTransform(scrollY, [48, 76], [0, 1]);
  const titleOpacity = useTransform(scrollY, [0, 48], [1, 0]);
  const titleScale = useTransform(scrollY, [-120, 0], [1.08, 1]);

  const backButton = back ? (
    <button
      type="button"
      onClick={() => navigate(-1)}
      className="-ml-2 flex h-11 items-center gap-0.5 pr-2 text-[17px] text-violet transition-opacity active:opacity-50"
    >
      <ChevronLeft className="size-7" strokeWidth={2.4} />
      {backLabel}
    </button>
  ) : null;

  return (
    <>
      <motion.div
        style={{ opacity: barOpacity }}
        className="pointer-events-none fixed inset-x-0 top-0 z-[15] border-b border-border bg-glass pt-[env(safe-area-inset-top)] backdrop-blur-xl backdrop-saturate-150 [left:var(--content-left,0px)]"
      >
        <div className="relative flex h-11 items-center justify-center px-24">
          {back ? <div className="pointer-events-auto absolute inset-y-0 left-4 flex items-center">{backButton}</div> : null}
          <span className="truncate text-[17px] font-semibold">{title}</span>
        </div>
      </motion.div>

      <header className="relative z-[16] mb-2">
        {back || action ? (
          <div className="flex min-h-11 items-center justify-between gap-2">
            {backButton ?? <span />}
            {action}
          </div>
        ) : null}
        <motion.div style={{ opacity: titleOpacity, scale: titleScale }} className="flex origin-left items-end gap-3 px-1 pb-2 pt-1">
          <div className="min-w-0 flex-1">
            {eyebrow ? <span className="text-[13px] font-semibold uppercase tracking-[0.06em] text-violet">{eyebrow}</span> : null}
            <h1 className="type-h1">{title}</h1>
            {subtitle ? <p className="mt-1 text-[15px] leading-snug text-muted">{subtitle}</p> : null}
          </div>
          {trailing ? <div className="mb-1 shrink-0">{trailing}</div> : null}
        </motion.div>
      </header>
    </>
  );
}
