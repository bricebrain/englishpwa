import { CircleAlert, CloudOff, Inbox } from 'lucide-react';
import { motion } from 'motion/react';

import { Button } from '@/components/ui/button';

interface QueryStateProps {
  loading?: boolean;
  error?: boolean;
  empty?: boolean;
  offline?: boolean;
  onRetry?: () => void;
  emptyLabel?: string;
  skeletons?: number;
}

export function QueryState({ loading, error, empty, offline, onRetry, emptyLabel, skeletons = 3 }: QueryStateProps) {
  if (loading) {
    return (
      <div className="mb-4 flex flex-col gap-3" role="status" aria-label="Chargement">
        {Array.from({ length: skeletons }, (_, index) => (
          <div key={index} className={`shimmer rounded-2xl ${index === 0 ? 'h-[150px]' : 'h-[88px]'}`} />
        ))}
      </div>
    );
  }

  if (offline || error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mb-4 rounded-2xl bg-surface px-6 py-10 text-center"
      >
        <div className="mx-auto grid size-12 place-items-center rounded-full bg-ink/[0.08] text-muted">
          {offline ? <CloudOff /> : <CircleAlert />}
        </div>
        <p className="mt-3 font-semibold">{offline ? 'Pas de connexion' : 'Impossible de charger les données'}</p>
        <p className="mt-1 text-sm text-muted">
          {offline ? 'Reconnecte-toi pour retrouver tes contenus.' : 'Un petit souci côté serveur.'}
        </p>
        {onRetry ? <Button variant="outline" onClick={onRetry} className="mt-4">Réessayer</Button> : null}
      </motion.div>
    );
  }

  if (empty) {
    return (
      <div className="py-14 text-center text-muted">
        <Inbox className="mx-auto mb-2 size-10 text-faint" />
        <p>{emptyLabel ?? 'Rien à afficher pour l’instant.'}</p>
      </div>
    );
  }

  return null;
}
