import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';

export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <PageLayout reading>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="pt-20 text-center">
        <motion.div animate={{ rotate: [0, -8, 8, -4, 0] }} transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 1 }} className="inline-block">
          <p className="text-gradient font-display text-8xl font-extrabold leading-none">404</p>
        </motion.div>
        <h2 className="type-h2 mt-4">Lost in translation</h2>
        <p className="mb-8 mt-2 text-muted">Cette page n’existe pas ou n’est plus disponible.</p>
        <Button size="lg" onClick={() => navigate('/')}>Revenir à l’accueil</Button>
      </motion.div>
    </PageLayout>
  );
}
