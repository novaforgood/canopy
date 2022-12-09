export function makeListSentence(words: string[]): string {
  if (words.length === 0) {
    return "";
  }
  return words
    .slice(0, -1)
    .join(", ")
    .concat(words.length > 1 ? " and " : "")
    .concat(words.slice(-1)[0]);
}
