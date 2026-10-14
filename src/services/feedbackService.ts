import { tokens } from '@/theme';

/**
 * Retours sensoriels de l'application : sons synthétisés (Web Audio, aucun fichier),
 * vibrations (Android) et confettis. Tout est désactivable dans les paramètres.
 */

type FeedbackKind = 'tap' | 'select' | 'success' | 'almost' | 'error' | 'complete' | 'swipe' | 'levelUp';

const settings = { sound: true, haptics: true };

export function configureFeedback(next: { sound: boolean; haptics: boolean }) {
  settings.sound = next.sound;
  settings.haptics = next.haptics;
}

let context: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  context ??= new Ctor();
  if (context.state === 'suspended') void context.resume();
  return context;
}

function tone(ctx: AudioContext, frequency: number, start: number, duration: number, options: {
  type?: OscillatorType;
  gain?: number;
  slideTo?: number;
} = {}) {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = options.type ?? 'sine';
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime + start);
  if (options.slideTo) {
    oscillator.frequency.exponentialRampToValueAtTime(options.slideTo, ctx.currentTime + start + duration);
  }
  const peak = options.gain ?? 0.12;
  gain.gain.setValueAtTime(0.0001, ctx.currentTime + start);
  gain.gain.exponentialRampToValueAtTime(peak, ctx.currentTime + start + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + duration);
  oscillator.connect(gain).connect(ctx.destination);
  oscillator.start(ctx.currentTime + start);
  oscillator.stop(ctx.currentTime + start + duration + 0.05);
}

function noise(ctx: AudioContext, duration: number, gainValue = 0.05) {
  const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * duration), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let index = 0; index < data.length; index += 1) data[index] = (Math.random() * 2 - 1) * (1 - index / data.length);
  const source = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  source.buffer = buffer;
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(900, ctx.currentTime);
  filter.frequency.exponentialRampToValueAtTime(2400, ctx.currentTime + duration);
  gain.gain.value = gainValue;
  source.connect(filter).connect(gain).connect(ctx.destination);
  source.start();
}

function playSound(kind: FeedbackKind, intensity = 0) {
  if (!settings.sound) return;
  const ctx = audio();
  if (!ctx) return;
  const lift = Math.min(intensity, 8) * 0.04; // le combo fait monter la hauteur
  const pitch = (value: number) => value * (1 + lift);

  switch (kind) {
    case 'tap':
      tone(ctx, 720, 0, 0.05, { type: 'triangle', gain: 0.05 });
      break;
    case 'select':
      tone(ctx, 540, 0, 0.07, { type: 'triangle', gain: 0.06, slideTo: 760 });
      break;
    case 'success':
      tone(ctx, pitch(784), 0, 0.14, { type: 'triangle', gain: 0.11 });
      tone(ctx, pitch(1175), 0.08, 0.22, { type: 'triangle', gain: 0.1 });
      tone(ctx, pitch(1568), 0.08, 0.26, { type: 'sine', gain: 0.04 });
      break;
    case 'almost':
      tone(ctx, 660, 0, 0.12, { type: 'triangle', gain: 0.09 });
      tone(ctx, 740, 0.09, 0.18, { type: 'triangle', gain: 0.07 });
      break;
    case 'error':
      tone(ctx, 300, 0, 0.18, { type: 'sawtooth', gain: 0.035, slideTo: 190 });
      tone(ctx, 220, 0.1, 0.22, { type: 'triangle', gain: 0.07, slideTo: 160 });
      break;
    case 'swipe':
      noise(ctx, 0.18, 0.06);
      break;
    case 'complete':
      [523, 659, 784, 1047].forEach((frequency, index) => tone(ctx, frequency, index * 0.09, 0.3, { type: 'triangle', gain: 0.1 }));
      tone(ctx, 1568, 0.38, 0.6, { type: 'sine', gain: 0.06 });
      break;
    case 'levelUp':
      [392, 523, 659, 784, 1047, 1319].forEach((frequency, index) => tone(ctx, frequency, index * 0.07, 0.28, { type: 'square', gain: 0.03 }));
      break;
  }
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

export function feedback(kind: FeedbackKind, intensity = 0) {
  vibrate(kind);
  playSound(kind, intensity);
}

const CONFETTI_COLORS = [tokens.violet, tokens.pink, tokens.amber, tokens.mint, tokens.cyan, tokens.lime];

function reducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export async function celebrate(level: 'small' | 'big' = 'small') {
  if (reducedMotion()) return;
  const { default: confetti } = await import('canvas-confetti');
  if (level === 'small') {
    void confetti({ particleCount: 46, spread: 70, startVelocity: 38, origin: { y: 0.72 }, colors: CONFETTI_COLORS, scalar: 0.9, ticks: 140 });
    return;
  }
  const end = Date.now() + 1100;
  const frame = () => {
    void confetti({ particleCount: 5, angle: 60, spread: 60, origin: { x: 0, y: 0.75 }, colors: CONFETTI_COLORS });
    void confetti({ particleCount: 5, angle: 120, spread: 60, origin: { x: 1, y: 0.75 }, colors: CONFETTI_COLORS });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();
  void confetti({ particleCount: 120, spread: 100, startVelocity: 45, origin: { y: 0.6 }, colors: CONFETTI_COLORS, scalar: 1.1 });
}
