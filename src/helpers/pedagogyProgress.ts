import { constructions } from '@/constants/pedagogy/constructions';
import { labContent } from '@/constants/pedagogy/labContent';
import type { CompetencyProgress, Construction, LabSession, LearningEvidence, PedagogyProfile } from '@/types/pedagogy';

const DAY = 86_400_000;

export function getCompetencyProgress(construction: Construction, evidence: LearningEvidence[]): CompetencyProgress {
  const events = evidence.filter((item) => item.constructionId === construction.id)
    .sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
  const validated = events.filter((item) => item.evaluation.outcome !== 'uncertain');
  const criteria = construction.masteryCriteria;
  const transfers: LearningEvidence[] = [];
  let lastValidated: LearningEvidence | undefined;
  const successfulDays = new Set<string>();
  for (const event of validated) {
    if (event.evaluation.outcome === 'incorrect') {
      transfers.length = 0;
      successfulDays.clear();
    } else {
      if (event.kind === 'transfer' && !event.usedHint && lastValidated
        && Date.parse(event.at) - Date.parse(lastValidated.at) >= criteria.minimumDelayDays * DAY
        && event.contextId !== (transfers.at(-1)?.contextId ?? lastValidated.contextId)
        && event.sessionId !== lastValidated.sessionId) {
        transfers.push(event);
      }
      if (!event.usedHint) successfulDays.add(new Date(event.at).toISOString().slice(0, 10));
    }
    lastValidated = event;
  }
  const last = events.at(-1);
  const mastered = transfers.length >= criteria.delayedTransfers
    && new Set(transfers.map((item) => item.contextId)).size >= criteria.distinctContexts;
  const recentError = validated.some((item) => item.sessionId === lastValidated?.sessionId && item.evaluation.outcome === 'incorrect');
  const interval = recentError || lastValidated?.usedHint
    ? 1 : Math.min(14, 2 ** Math.min(4, successfulDays.size));
  return {
    constructionId: construction.id,
    status: mastered ? 'mastered' : transfers.length ? 'consolidating' : events.length ? 'learning' : 'new',
    dueAt: lastValidated ? new Date(Date.parse(lastValidated.at) + interval * DAY).toISOString() : null,
    delayedTransfers: transfers.length,
    pendingCount: events.filter((item) => item.evaluation.outcome === 'uncertain').length,
    showHints: !lastValidated || recentError || lastValidated.usedHint,
    lastContextId: last?.contextId ?? null,
  };
}

export function getPedagogyProgress(profile: PedagogyProfile): CompetencyProgress[] {
  return constructions.map((construction) => getCompetencyProgress(construction, profile.evidence));
}

export function planMixedSession(profile: PedagogyProfile, sessionId: string, now = new Date()): LabSession {
  const progress = getPedagogyProgress(profile);
  const selected = [...constructions].sort((a, b) => {
    const left = progress.find((item) => item.constructionId === a.id)!;
    const right = progress.find((item) => item.constructionId === b.id)!;
    const priority = (item: CompetencyProgress) => item.dueAt && Date.parse(item.dueAt) <= now.getTime() ? 0 : item.status !== 'new' ? 1 : 2;
    return priority(left) - priority(right);
  }).slice(0, 3);
  const targets = selected.map((construction) => {
    const last = progress.find((item) => item.constructionId === construction.id)!;
    const context = labContent[construction.id].find((item) => item.id !== last.lastContextId) ?? labContent[construction.id][0]!;
    // La séance mélangée apporte une preuve de production, pas un transfert différé certifié.
    return { construction, context, exercise: { ...context.transfer, kind: 'production' as const } };
  });
  // L’ordre change sans exposer à l’utilisateur la construction à choisir.
  for (let index = targets.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [targets[index], targets[swap]] = [targets[swap]!, targets[index]!];
  }
  return { id: sessionId, construction: targets[0]!.construction, context: targets[0]!.context,
    exercises: targets.map((item) => item.exercise), targets, mixed: true, showHints: false, isDue: false };
}

export function planLabSession(profile: PedagogyProfile, sessionId: string, now = new Date()): LabSession {
  const progress = getPedagogyProgress(profile);
  const eligible = progress.filter((item) => {
    const construction = constructions.find((entry) => entry.id === item.constructionId)!;
    return construction.prerequisites.every((id) => progress.find((entry) => entry.constructionId === id)?.status === 'mastered');
  });
  const due = eligible.filter((item) => item.dueAt && Date.parse(item.dueAt) <= now.getTime())
    .sort((a, b) => Date.parse(a.dueAt!) - Date.parse(b.dueAt!));
  const selected = due[0] ?? eligible.find((item) => item.status === 'new')
    ?? eligible.find((item) => !item.dueAt) ?? [...eligible].sort((a, b) => Date.parse(a.dueAt!) - Date.parse(b.dueAt!))[0]!;
  const construction = constructions.find((item) => item.id === selected.constructionId)!;
  const contexts = labContent[construction.id];
  const context = contexts.find((item) => item.id !== selected.lastContextId) ?? contexts[0]!;
  const isDue = Boolean(selected.dueAt && Date.parse(selected.dueAt) <= now.getTime());
  return {
    id: sessionId, construction, context, isDue, showHints: selected.showHints,
    exercises: [...(isDue ? [context.transfer] : []), ...context.exercises],
  };
}
