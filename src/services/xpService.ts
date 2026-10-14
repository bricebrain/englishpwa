/**
 * Système d'XP local : chaque bonne réponse rapporte des points, les séries
 * consécutives (combo) donnent un bonus, et les niveaux se débloquent au fil du temps.
 * Les données restent sur l'appareil ; elles complètent les statistiques du Worker.
 */

const STORAGE_KEY = 'english-fluency:xp';

export interface XpGain {
  id: number;
  amount: number;
  label?: string;
  leveledUpTo?: number;
}

export interface XpState {
  totalXp: number;
  history: Record<string, number>;
  bestCombo: number;
  lastGain: XpGain | null;
}

const EMPTY: XpState = { totalXp: 0, history: {}, bestCombo: 0, lastGain: null };

function todayKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function load(): XpState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? { ...EMPTY, ...JSON.parse(saved), lastGain: null } : EMPTY;
  } catch {
    return EMPTY;
  }
}

let state: XpState = load();
const listeners = new Set<() => void>();

function persist(next: XpState) {
  state = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ totalXp: next.totalXp, history: next.history, bestCombo: next.bestCombo }));
  } catch {
    // Stockage indisponible (navigation privée) : l'XP reste en mémoire.
  }
  listeners.forEach((listener) => listener());
}

export function subscribeXp(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getXpState() {
  return state;
}

/** Niveau n → n+1 coûte 100 + 50·(n-1) XP. */
export function levelFromXp(totalXp: number) {
  let level = 1;
  let remaining = totalXp;
  let size = 100;
  while (remaining >= size) {
    remaining -= size;
    level += 1;
    size = 100 + 50 * (level - 1);
  }
  return { level, intoLevel: remaining, levelSize: size, progress: remaining / size };
}

let gainId = 0;

export function awardXp(amount: number, label?: string) {
  if (amount <= 0) return;
  const before = levelFromXp(state.totalXp).level;
  const totalXp = state.totalXp + amount;
  const after = levelFromXp(totalXp).level;
  const key = todayKey();
  const history = { ...state.history, [key]: (state.history[key] ?? 0) + amount };
  // On ne conserve que les 60 derniers jours.
  const keys = Object.keys(history).sort();
  keys.slice(0, Math.max(0, keys.length - 60)).forEach((old) => delete history[old]);
  gainId += 1;
  persist({
    ...state,
    totalXp,
    history,
    lastGain: { id: gainId, amount, label, leveledUpTo: after > before ? after : undefined },
  });
}

export function recordCombo(combo: number) {
  if (combo > state.bestCombo) persist({ ...state, bestCombo: combo });
}

export function todayXp(current: XpState) {
  return current.history[todayKey()] ?? 0;
}

/** XP gagnés sur les 7 derniers jours, du plus ancien à aujourd'hui. */
export function lastSevenDays(current: XpState) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    return { date, xp: current.history[todayKey(date)] ?? 0 };
  });
}

/** Bonus de combo : +2 XP par bonne réponse consécutive, plafonné. */
export function xpForCorrect(base: number, combo: number) {
  return base + Math.min(combo, 10) * 2;
}
