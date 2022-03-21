
export function unescapeString(stringOrTerm) {
  if (typeof stringOrTerm === 'string') {
    return stringOrTerm.replace(/^'/, '').replace(/'$/, '').replace(`\\'`, `'`)
  }
  else if (stringOrTerm[0] === 'address') {
    const addr = unescapeString(stringOrTerm[1])
    return `${addr.slice(0, 6)}..${addr.slice(18, 22)}`
  }
  else if (stringOrTerm[0] === 'eth') {
    const wei = stringOrTerm[1]
    const [integer, decimals] =
      wei.length >= 18
      ? [wei.slice(0, wei.length - 18), wei.slice(wei.length - 18).slice(0, 5)]
      : ['0', new Array(18 - wei.length).fill('0').join('') + wei.replace(/0+$/, '')]
    return `${integer}.${decimals} ETH`
  }
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


/**
 * JSON.stringify, but serializes BigInts and BigNumbers to '123n' strings
 * */
export function stringifyJson(data) {
  return JSON.stringify(data, (key, value) =>
    typeof value === 'bigint'
    ? value.toString() + 'n'
    : value?.type === 'BigNumber' && value?.hex
    ? BigInt(value.hex).toString() + 'n'
    : value
  )
}

/**
 * JSON.parse, but converts '123n' strings to BigInts
 * */
export function parseJson(json) {
  return JSON.parse(json, (key, value) => {
    if (typeof value === 'string' && /^\d+n$/.test(value)) {
      return BigInt(value.substr(0, value.length - 1))
    }
    return value
  })
}

export function convertEthersContractCallResult(value) {
  if (value?.constructor?.name === 'BigNumber') {
    return value.toBigInt()
  }
  else if (Array.isArray(value)) {
    return value.map(convertEthersContractCallResult)
  }
  return value
}
