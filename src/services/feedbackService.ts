/**
 * Retours sensoriels de l'application : vibrations (Android) et confettis discrets.
 * Pas de sons : des bips synthétisés gâchent l'expérience plus qu'ils ne l'enrichissent.
 */

type FeedbackKind = 'tap' | 'select' | 'success' | 'almost' | 'error' | 'complete' | 'swipe' | 'levelUp';

const settings = { haptics: true };

export function configureFeedback(next: { haptics: boolean }) {
  settings.haptics = next.haptics;
}

const VIBRATIONS: Record<FeedbackKind, number | number[]> = {
  tap: 8,
  select: 12,
  success: [14, 40, 22],
  almost: [18, 50, 18],
  error: [40, 50, 40],
  swipe: 16,
  complete: [20, 60, 20, 60, 50],
  levelUp: [30, 40, 30, 40, 80],
};

function vibrate(kind: FeedbackKind) {
  if (!settings.haptics || typeof navigator === 'undefined' || !('vibrate' in navigator)) return;
  // Chrome refuse la vibration tant que l'utilisateur n'a pas touché la page.
  if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return;
  try {
    navigator.vibrate(VIBRATIONS[kind]);
  } catch {
    // Certains navigateurs refusent la vibration sans geste utilisateur : on ignore.
  }
}

export function feedback(kind: FeedbackKind) {
  vibrate(kind);
}

// canvas-confetti dessine sur un canvas : il lui faut de vraies couleurs, pas des variables CSS.
const CONFETTI_COLORS = ['#5856D6', '#0A84FF', '#34C759', '#AF52DE'];

function reducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Célébration sobre : rien de visuel pour les petites réussites, une gerbe discrète pour les grandes. */
export async function celebrate(level: 'small' | 'big' = 'small') {
  if (level === 'small' || reducedMotion()) return;
  const { default: confetti } = await import('canvas-confetti');
  void confetti({ particleCount: 70, spread: 80, startVelocity: 36, gravity: 1.1, origin: { y: 0.65 }, colors: CONFETTI_COLORS, scalar: 0.8, ticks: 160 });
}
