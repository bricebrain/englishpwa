export function normalizeSentence(value: string): string {
  return value.trim().toLocaleLowerCase('en').replace(/[.,!?;:]+$/g, '').replace(/\s+/g, ' ');
}

export function evaluateSentence(answer: string, expected: string): boolean {
  return normalizeSentence(answer) === normalizeSentence(expected);
}
