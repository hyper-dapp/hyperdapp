import prolog from '../vendor/tau-prolog/modules/core.js'
import importJsModule from '../vendor/tau-prolog/modules/js.js'
import importListsModule from '../vendor/tau-prolog/modules/lists.js'
import importPromisesModule from '../vendor/tau-prolog/modules/promises.js'

import { CORTEX_BASE_CODE } from './cortex.js'

importJsModule(prolog)
importListsModule(prolog)
importPromisesModule(prolog)

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

    setUiState(path, value) {
      // console.log("Setting", path, value)
      if (path.length === 0) {
        throw new Error('set/2 - No path provided')
      }
      let current = env.uiState
      for (let prop of path.slice(0, path.length-1)) {
        if (current[prop] === undefined) {
          current[prop] = {}
        }
        current = current[prop]
      }
      const lastKey = path[path.length-1]
      current[lastKey] = value
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
        args,
        block: currentBlock,
        value,
        signer: currentSigner,
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


  let currentSigner = null
  let currentBlock = { number: 0, cache: {} }

  function updateCurrentBlock(blockNum) {
    if (blockNum !== currentBlock.number) {
      currentBlock = { number: blockNum, cache: {} }
    }
  }

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
    init: tryCatchProlog(
      async function init (signer, signerAddress, blockNum) {
        currentSigner = signer
        env.context.me.address = signerAddress

        updateCurrentBlock(blockNum)

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

    getPrompts: tryCatchProlog(afterInit(
        async function getPrompts(blockNum) {
        updateCurrentBlock(blockNum)

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
      async function matchPrompts(blockNum, matchQuery, selectVariable) {
        updateCurrentBlock(blockNum)

        const selectQuery = selectVariable
          ? `, (term_to_list(${selectVariable}, ${selectVariable}Out) -> true; ${selectVariable}Out = ${selectVariable})`
          : ''
        await session.promiseQuery(`prompt([], Prompt), prompt_exists(${matchQuery}, Prompt)${selectQuery}.`)

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

    async promptCount(blockNum, query) {
      const results = await api.matchPrompts(blockNum, query)
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

    execute: tryCatchProlog(async function execute(actions) {
      if (!env.context.__.hasInit) {
        console.warn("Hyperdapp flow has not init")
        return { effects: [] }
      }
      // console.log('Executing', actions)
      const effects = []
      await session.promiseQuery(`execute_all(${arrayToString(actions)}, Effects0), terms_to_list(Effects0, Effects).`)

      for await (let answer of session.promiseAnswers()) {
        // Effects
        // console.log('!->>', session.format_answer(answer), answer)
        const newEffects = answer.links.Effects.toJavaScript({ quoted: true })
        // console.log(newEffects)
        effects.push(...newEffects)
      }
      return { effects }
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

function arrayToString(arr) {
  if (Array.isArray(arr)) {
    return `[${arr.map(arrayToString).join(',')}]`
  }
  else {
    return arr
  }
}

function serializeNonJsonValues(xs) {
  return xs.map(x =>
    Array.isArray(x)
    ? serializeNonJsonValues(x)
    : typeof x === 'bigint'
    ? x.toString() + 'n'
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
