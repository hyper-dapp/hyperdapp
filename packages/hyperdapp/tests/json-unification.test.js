import o from 'ospec'

// Prolog imports should match flow.js
import prolog from '../vendor/tau-prolog/modules/core.js'
import importJsModule from '../vendor/tau-prolog/modules/js.js'
import importListsModule from '../vendor/tau-prolog/modules/lists.js'
import importPromisesModule from '../vendor/tau-prolog/modules/promises.js'


o.spec('JSON unification', () => {
  let session;
  const BASE_CODE = `
    :- use_module(library(lists)).
    :- use_module(library(js)).
  `

  async function consult(code) {
    await session.promiseConsult(code)
    session.thread.warnings.map(w =>
      console.warn(w.toJavaScript({ quoted: true }))
    )
  }
  async function query(code) {
    await session.promiseQuery(code)
    let answers = []
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

  o.beforeEach(() => {
    session = prolog.create()
    prolog.__env = {
      foo: { x: 10, y: 20, z: 30 },
      bar: { a: null, b: undefined, c: true, d: false, e: '' }
    }
  })

  o('null', async () => {
    await consult(BASE_CODE)
    const answers = await query(`prop(bar, Bar), prop(Bar, a, V).`)
    o(answers[0].V).equals(null)
  })

  o('undefined', async () => {
    await consult(BASE_CODE)
    const answers = await query(`prop(bar, Bar), prop(Bar, b, V).`)
    o('V' in answers[0]).equals(true)
    o(answers[0].V).equals(undefined)
  })

  o('true/false', async () => {
    await consult(BASE_CODE)
    const answers = await query(`prop(bar, Bar), prop(Bar, c, T), prop(Bar, d, F).`)
    o(answers[0].T).equals(true)
    o(answers[0].F).equals(false)
  })
})
