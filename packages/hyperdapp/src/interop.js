
export function unescapeString(string) {
  return string.replace(/^'/, '').replace(/'$/, '').replace(`\\'`, `'`)
}

export function escapeAtom(string) {
  return startsWithCapitalLetter(string) ? `'${string}'` : string
}

export function startsWithCapitalLetter(word) {
  return word.charCodeAt(0) >= 65 && word.charCodeAt(0) <= 90;
}

export function capitalize(word) {
  return word[0].toUpperCase() + word.slice(1)
}

export function uncapitalize(word) {
  return word[0].toLowerCase() + word.slice(1)
}
