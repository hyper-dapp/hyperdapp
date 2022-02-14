
export function unescapeString(string) {
  return string.replace(/^'/, '').replace(/'$/, '').replace(`\\'`, `'`)
}
