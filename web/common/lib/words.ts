export function makeListSentence(words: string[]): string {
  if (words.length === 0) {
    return "";
  }
  if (words.length === 1) {
    return words[0];
  }
  if (words.length === 2) {
    return words.join(" and ");
  }
  return words.slice(0, -1).join(", ") + ", and " + words[words.length - 1];
}
