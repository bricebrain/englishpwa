export type RecallResult = 'success' | 'almost' | 'fail';

function normalize(value: string) {
  return value.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9' -]/g, '').trim();
}

function distance(left: string, right: string): number {
  const row = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let i = 1; i <= left.length; i += 1) {
    let previous = row[0]!;
    row[0] = i;
    for (let j = 1; j <= right.length; j += 1) {
      const current = row[j]!;
      row[j] = Math.min(row[j]! + 1, row[j - 1]! + 1, previous + (left[i - 1] === right[j - 1] ? 0 : 1));
      previous = current;
    }
  }
  return row[right.length]!;
}

export function evaluateRecall(answer: string, expected: string): RecallResult {
  const value = normalize(answer);
  if (!value) return 'fail';
  const accepted = expected.split(/[,;/]|\bou\b/i).map(normalize).filter(Boolean);
  if (accepted.includes(value)) return 'success';
  if (accepted.some((candidate) => candidate.length >= 4 && distance(value, candidate) <= 1)) return 'almost';
  return 'fail';
}
