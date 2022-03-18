import prolog from '../vendor/tau-prolog/modules/core.js'
import importJsModule from '../vendor/tau-prolog/modules/js.js'
import importListsModule from '../vendor/tau-prolog/modules/lists.js'
import importPromisesModule from '../vendor/tau-prolog/modules/promises.js'

import { CORTEX_BASE_CODE } from './cortex.js'

importJsModule(prolog)
importListsModule(prolog)
importPromisesModule(prolog)

let idCounter = 100

export async function createFlow(flowCode, {
  onCallFn,
  onCallHttp,
}) {

  // The "global" context that tau prolog code has access to
  // We set this to a variable so functions close over their own objects,
  // as opposed to an always up to date reference via prolog.__env
  const env = {

    context: {
      // Internal state
      __: {
        hasInit: false,
        lockRegistering: false,
      },

      me: {
        // Populated via init/0
        address: null
      },

      // Populated by address/2
      address: {},

      // Populated by oracle/3
      oracle: {},
    },

    uiState: {},

    inputState: {},

    setUiState(path, value) {
      if (path.length === 0) {
        throw new Error('set/2 - No path provided')
      }
      setValueInPath(env.uiState, path, value)
    },

    setInputValue(type, path, value) {
      if (path.length === 0) {
        throw new Error('[setInputValue] No path provided')
      }

      let cleanValue
      if (type === 'address') {
        if (! /^0x/.test(value) && value.length <= 40) {
          value = '0x' + value
        }
        if (/^0x[0-9a-f]{40}/.test(value)) {
          cleanValue = [value]
        }
      }
      else if (type === 'eth') {
        if (! /\..*$/) {
          value = value + '.0'
        }
        if (/\.$/.test(value)) {
          value = value + '0'
        }
        if (/^[0-9]+\.[0-9]$/.test(value)) {
          cleanValue = [parseFloat(value)]
        }
      }
      else if (type === 'string') {
        if (!value) {
          value = undefined
        }
        cleanValue = [value]
      }
      else {
        const message = `[flow] Invalid input type '${type}' for '${path.join('/')}'`
        console.error(message) // TODO: Figure out why Tau doesn't handle async errors correctly
        throw new Error(message)
      }

      if (cleanValue) {
        setValueInPath(env.inputState, path, cleanValue[0])
      }
      else {
        console.warn(`[setInputValue] Ignoring invalid input '${value}' for '${path.join('/')}'`)
      }
    },

    // For security, we only want to allow specifying addresses & oracles before and during init/1.
    // However, Prolog can asserta/assertz at anytime.
    // To work around this, we store valid addresses in an external JS object,
    // then lock writes after a certain point.
    registerAddress(id, addr) {
      if (env.context.__.lockRegistering) {
        throw new Error('[hyperdapp] Addresses locked')
      }
      if (env.context.address[id]) {
        throw new Error(`[hyperdapp] Address already defined: '${id}'`)
      }
      env.context.address[id] = addr.toLowerCase()
    },

    registerOracle(id, permission, host) {
      if (env.context.__.lockRegistering) {
        throw new Error('[hyperdapp] Oracles locked')
      }
      if (env.context.oracle[id]) {
        throw new Error(`[hyperdapp] Oracle already defined: '${id}'`)
      }
      env.context.oracle[id] = { host, permission }
    },

    async callFn(targetAddress, functionSig, mutability, paramTypes, args, returnType, options) {
      // TODO: Inspect library code to determine why errors here do not throw
      // console.log("callFn", targetAddress, functionSig, paramTypes, args, returnType)

      let value = 0n
      for (let opt of options) {
        if (opt[0] === 'value') {
          value = opt[1]
        }
      }

      const returnValue = await onCallFn({
        env: callEnv,
        args,
        block: currentBlock,
        value,
        contractAddress: targetAddress,
        mutability: {
          view: mutability.includes('view'),
          payable: mutability.includes('payable'),
        },
        paramTypes,
        returnType,
        functionSig,
      })
      // console.log(functionSig, '=>', returnValue)

      return returnValue.map((value, i) =>
        // Maintain internal consistency by ensuring all addresses are always lowercase
        returnType[i] === 'address'
        ? value.toLowerCase()
        : value
      )
    },

    async callHttp(url, rawOptions) {
      const options = {}
      for (let [key, val] of rawOptions) {
        options[key] = val
      }
      const result = await onCallHttp({
        url,
        options
      })
      return result
    },
  }

  // WARNING: This line prevents multiple flow
  // instances existing at one time
  prolog.__env = env

  const session = prolog.create()

  await tryCatchProlog(async () => {
    await session.promiseConsult(`
      ${CORTEX_BASE_CODE}
      ${
        // TODO SECURITY: Parse and disallow certain built-ins
        flowCode
      }
    `)
    session.thread.warnings.map(w =>
      console.warn(w.toJavaScript({ quoted: true }))
    )
  })()


  let callEnv = {}
  let currentBlock = { number: 0, cache: {} }

  function afterInit(fn) {
    return async (...args) => {
      if (!env.context.__.hasInit) {
        console.warn("[Warning] Hyperdapp flow has not init")
        return []
      }
      return await fn(...args)
    }
  }

  const api = {
    id: idCounter++,
    init: tryCatchProlog(
      async function init (signerAddress, blockNum, callEnv_={}) {
        callEnv = callEnv_
        env.context.me.address = signerAddress

        api.setBlockNumber(blockNum)

        await session.promiseQuery(`register_addresses, current_predicate(init/0), init.`)
        for await (let answer of session.promiseAnswers()) {
          // flush
        }

        await session.promiseQuery(`post_init.`)
        for await (let answer of session.promiseAnswers()) {
          // flush
        }

        env.context.__.hasInit = true
        env.context.__.lockRegistering = true
      }
    ),

    setBlockNumber(blockNum) {
      if (blockNum !== currentBlock.number) {
        currentBlock = { number: blockNum, cache: {} }
      }
    },

    getPrompts: tryCatchProlog(afterInit(
      async function getPrompts() {
        let prompts = []

        await session.promiseQuery(`prompt_list(Prompt).`)

        for await (let answer of session.promiseAnswers()) {
          // console.log('->>', session.format_answer(answer), answer)
          const prompt = answer.links.Prompt.toJavaScript({ quoted: true })
          prompts.push(serializeNonJsonValues(prompt))
          // console.log(prompts[prompts.length-1])
        }
        if (prompts.length >= 2) {
          console.warn('Multiple prompt_list answers')
        }
        return prompts[0]
      }
    )),

    matchPrompts: tryCatchProlog(afterInit(
      async function matchPrompts(matchQuery, selectVariable) {
        const selectQuery = selectVariable
          ? `, (serialize_term(${selectVariable}, ${selectVariable}Out) -> true; ${selectVariable}Out = ${selectVariable})`
          : ''
        await session.promiseQuery(`get_prompts(Prompts), member(P, Prompts), prompt_exists(${matchQuery}, P)${selectQuery}.`)

        let answers = []
        for await (let answer of session.promiseAnswers()) {
          // console.log('->>', session.format_answer(answer), answer)
          answers.push(
            selectVariable
            ? { [selectVariable]: answer.links[selectVariable+'Out'].toJavaScript({ quoted: true }) }
            : {}
          )
          // console.log(answers[answers.length-1])
        }

        return answers
      }
    )),

    async promptCount(query) {
      const results = await api.matchPrompts(query)
      return results.length
    },

    async effectCount(query) {
      await session.promiseQuery(`effect(${query}).`)
      let answerCount = 0
      for await (let answer of session.promiseAnswers()) {
        // console.log('->>', session.format_answer(answer), answer)
        answerCount += 1
      }
      return answerCount
    },

    // TODO: Clone internal state somehow to make effects atomic
    execute: tryCatchProlog(async function execute(actionTerms) {
      if (!env.context.__.hasInit) {
        console.warn("Hyperdapp flow has not init")
        return { effects: [] }
      }
      // console.log('Executing', actionTerms)
      const effects = []
      await session.promiseQuery(`execute_all(${arrayToString(actionTerms)}, Effects0), maplist(serialize_term, Effects0, Effects).`)

      for await (let answer of session.promiseAnswers()) {
        // Effects
        // console.log('!->>', session.format_answer(answer), answer)
        const newEffects = answer.links.Effects.toJavaScript({ quoted: true })
        // console.log(newEffects)
        effects.push(...newEffects)
      }
      return { effects }
    }),


    handleInput: tryCatchProlog(async function handleInput(nameTerm, value) {
      if (!env.context.__.hasInit) {
        console.warn("Hyperdapp flow has not init")
        return
      }
      // console.log('Inputting', value, nameTerm)

      await session.promiseQuery(`
        deserialize_term(${arrayToString(nameTerm)}, Name), %% Ex: [/, [/, a, b], b] -> /(/(a,b), c)
        path_flat(Name, Path),  %% Ex: /(/(a,b), c) -> [a, b, c]
        get_prompts(Prompts),
        member(P, Prompts),
        prompt_exists(input(Type, Name), P).
      `)

      const answers = []

      for await (let answer of session.promiseAnswers()) {
        // console.log('->>', session.format_answer(answer), answer)
        // console.log('->>', answer)
        answers.push({
          type: answer.links.Type.toJavaScript({ quoted: true }),
          namePath: answer.links.Path.toJavaScript({ quoted: true }),
        })
        // console.log('->>', answers[answers.length-1])
      }

      if (answers.length === 0) {
        console.warn('[flow] No such input for name:', nameTerm)
      }
      else if (answers.length >= 2) {
        console.warn('[flow] Duplicate inputs for name:', nameTerm, answers)
      }

      const input = answers[0]
      env.setInputValue(input.type, input.namePath, value)
    }),

    query: tryCatchProlog(afterInit(
      async function query(query) {
        let answers = []
        await session.promiseQuery(query)

        for await (let answer of session.promiseAnswers()) {
          // console.log('->>', session.format_answer(answer), answer)
          // console.log('->>', answer)
          let result = {}
          for (let variable in answer.links) {
            result[variable] = answer.links[variable].toJavaScript({ quoted: true })
          }
          answers.push(result)
          // console.log(answers[answers.length-1])
        }
        return answers
      }
    )),
  }

  return api
}

function arrayToString(x) {
  if (Array.isArray(x)) {
    return `[${x.map(arrayToString).join(',')}]`
  }
  else if (typeof x === 'number' || typeof x === 'bigint') {
    return x
  }
  else {
    return x.match(/^[a-z0-9'"]/i)
      ? x
      : `(${x})` // Wrap operators in parethesis in the rare case it's needed
  }
}

function serializeNonJsonValues(xs) {
  return xs.map(x =>
    Array.isArray(x)
    ? serializeNonJsonValues(x)
    : typeof x === 'bigint'
    ? x.toString()
    : x
  )
}

function tryCatchProlog(fn) {
  return async (...args) => {
    try {
      return await fn(...args)
    }
    catch(err) {
      if (err instanceof Error) {
        throw err
      }
      throw new Error(err.args[0].toJavaScript())
    }
  }
}

function setValueInPath(obj, path, value) {
  let current = obj
  for (let prop of path.slice(0, path.length-1)) {
    if (current[prop] === undefined) {
      current[prop] = {}
    }
    current = current[prop]
  }
  const lastKey = path[path.length-1]
  if (value === undefined) {
    delete current[lastKey]
  }
  else {
    current[lastKey] = value
  }
}
