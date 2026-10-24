import type { AssimilLesson } from '@/types/learning';

export interface DictationPhrase {
  id: string;
  text: string;
  translation?: string;
  source: string;
  level: AssimilLesson['level'];
}

export type DictationHistory = Record<string, number>;
