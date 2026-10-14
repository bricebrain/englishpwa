const SPEECH_REPLACEMENTS: Array<[RegExp, string]> = [
  [/\*\*(.+?)\*\*/gs, '$1'],
  [/\*(.+?)\*/gs, '$1'],
  [/`(.+?)`/gs, '$1'],
  [/^#{1,6}\s+/gm, ''],
  [/^[\s]*[-*•–]\s+/gm, '. '],
  [/https?:\/\/\S+/g, ''],
  [/([^.!?:])\n+/g, '$1. '],
  [/\n+/g, ' '],
  [/\be\.g\.\s*/gi, 'for example, '],
  [/\bi\.e\.\s*/gi, 'that is, '],
  [/\bvs\.\s*/gi, 'versus '],
  [/\betc\./gi, 'and so on'],
  [/\(\s*\)/g, ''],
  [/\s{2,}/g, ' '],
];

export function formatTextForSpeech(text: string): string {
  const formatted = SPEECH_REPLACEMENTS.reduce(
    (value, [pattern, replacement]) => value.replace(pattern, replacement),
    text,
  ).trim();

  if (!formatted || /[.!?]$/.test(formatted)) return formatted;
  return `${formatted}.`;
}

export function splitSpeechText(text: string, maxLength = 3_500): string[] {
  const formatted = formatTextForSpeech(text);
  if (!formatted) return [];
  if (formatted.length <= maxLength) return [formatted];

  const chunks: string[] = [];
  let remaining = formatted;

  while (remaining.length > maxLength) {
    const slice = remaining.slice(0, maxLength);
    const sentenceBreak = Math.max(
      slice.lastIndexOf('. '),
      slice.lastIndexOf('! '),
      slice.lastIndexOf('? '),
    );
    const wordBreak = slice.lastIndexOf(' ');
    const cut = sentenceBreak > maxLength / 2
      ? sentenceBreak + 1
      : Math.max(wordBreak, 1);

    chunks.push(remaining.slice(0, cut).trim());
    remaining = remaining.slice(cut).trim();
  }

  if (remaining) chunks.push(remaining);
  return chunks;
}
