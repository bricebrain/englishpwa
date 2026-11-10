import { isObservation } from '@/helpers/learningObservation';
import type { LearningObservation } from '@/types/learningObservation';
import { constructions } from '@/constants/pedagogy/constructions';
import type { LearningEvidence, PedagogyProfile } from '@/types/pedagogy';

const KEY = 'english-fluency:pedagogy:v1:';
const kinds = ['comprehension', 'transformation', 'error_correction', 'production', 'transfer'];
const outcomes = ['correct', 'incorrect', 'uncertain'];
const categories = ['missing_word', 'subject_agreement', 'auxiliary'];

function isEvidence(value: unknown): value is LearningEvidence {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  const evaluation = item.evaluation as Record<string, unknown> | null;
  return ['id', 'sessionId', 'exerciseId', 'contextId', 'answer'].every((key) => typeof item[key] === 'string')
    && constructions.some((entry) => entry.id === item.constructionId)
    && typeof item.at === 'string' && Number.isFinite(Date.parse(item.at))
    && typeof item.usedHint === 'boolean' && kinds.includes(String(item.kind))
    && Boolean(evaluation && typeof evaluation === 'object'
      && outcomes.includes(String(evaluation.outcome)) && typeof evaluation.explanation === 'string'
      && (evaluation.errorCategory === undefined || categories.includes(String(evaluation.errorCategory))));
}

function loadProfile(profileId: string): PedagogyProfile {
    const raw = localStorage.getItem(`${KEY}${profileId}`);
    if (!raw) return { version: 1, evidence: [] };
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== 'object' || !('version' in data) || data.version !== 1
      || !('evidence' in data) || !Array.isArray(data.evidence) || !data.evidence.every(isEvidence)
      || ('observations' in data && (!Array.isArray(data.observations) || !data.observations.every(isObservation)))) {
      throw new Error('Le suivi pédagogique local est illisible. Les données existantes ont été conservées.');
    }
    return data as PedagogyProfile;
}

export const pedagogyService = {
  async load(profileId: string): Promise<PedagogyProfile> { return loadProfile(profileId); },
  recordObservation(profileId: string, observation: LearningObservation): PedagogyProfile {
    if (!isObservation(observation)) throw new Error('Observation pédagogique invalide.');
    const profile = loadProfile(profileId);
    if (profile.observations?.some((item) => item.id === observation.id)) return profile;
    const updated = { ...profile, observations: [...(profile.observations ?? []), observation] };
    localStorage.setItem(`${KEY}${profileId}`, JSON.stringify(updated));
    return updated;
  },

  async record(profileId: string, evidence: LearningEvidence): Promise<PedagogyProfile> {
    if (!isEvidence(evidence)) throw new Error('Preuve pédagogique invalide.');
    const profile = loadProfile(profileId);
    if (profile.evidence.some((item) => item.id === evidence.id)) return profile;
    const updated: PedagogyProfile = { ...profile, evidence: [...profile.evidence, evidence] };
    localStorage.setItem(`${KEY}${profileId}`, JSON.stringify(updated));
    return updated;
  },
};
