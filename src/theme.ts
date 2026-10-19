/**
 * Palette « Daylight Aurora » pour les styles calculés en JS (animations, SVG, couleurs dynamiques).
 * Chaque valeur renvoie à une variable CSS de `styles.css` : elle suit donc le thème clair ou sombre.
 */
export const tokens = {
  bg: 'var(--bg)',
  surface: 'var(--surface)',
  surfaceRaised: 'var(--surface)',
  surfaceHigh: 'var(--surface-high)',
  ink: 'var(--ink)',
  border: 'var(--border)',
  borderStrong: 'var(--border-strong)',
  text: 'var(--fg)',
  textMuted: 'var(--muted)',
  textFaint: 'var(--faint)',
  violet: 'var(--violet)',
  violetSoft: 'var(--violet-soft)',
  pink: 'var(--pink)',
  coral: 'var(--coral)',
  amber: 'var(--amber)',
  lime: 'var(--lime)',
  mint: 'var(--mint)',
  cyan: 'var(--cyan)',
  red: 'var(--red)',
} as const;

export const gradients = {
  primary: 'var(--grad-primary)',
  sunrise: 'var(--grad-sunrise)',
  ocean: 'var(--grad-ocean)',
  mint: 'var(--grad-mint)',
  card: 'var(--grad-card)',
} as const;

export const displayFont = 'var(--font-display)';
export const bodyFont = 'var(--font-sans)';

/** Couleur translucide, compatible avec les variables CSS (remplace `alpha` de MUI). */
export function alpha(color: string, opacity: number) {
  return `color-mix(in srgb, ${color} ${Math.round(opacity * 1000) / 10}%, transparent)`;
}
