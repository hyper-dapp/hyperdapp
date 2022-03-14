import o from 'ospec'
import { createFlow } from '../index.js'

o.spec('HTTP calls', () => {

  async function make(flowCode, onCallHttp) {
    const flow = await createFlow(flowCode, { onCallHttp })
    await flow.init('0xbeef', 10)
    return flow
  }

  o('basic', async () => {
    const flow = await make(`
        oracle(foo, r, 'example.com').
        bar(Out) :- call_http(foo, '/a/b' ++ '/c', Out).
      `,
      async function onCallHttp({ url, options }) {
        return { x: { y: [10, 20] } }
      }
    )
    const [{ Out }] = await flow.query(`bar(Out).`)

    // onCallHttp should return a JS object.
    // Tau knows recognizes JS objects and can pass them around as values.
    // In the near future we'll want to modify Tau to allow unification on
    // JS objects directly, instead of having to use prop/3 or json_prolog/2
    //
    o(Out).deepEquals({ x: { y: [10, 20] } })
  })

  o('options parsing', async () => {
    let caughtOptions
    const flow = await make(`
        oracle(foo, r, 'example.com').
        bar(Out) :- call_http(foo, '/a/b' ++ '/c', Out, [a: 10, b: [20, 30]]).
      `,
      async function onCallHttp({ url, options }) {
        caughtOptions = options
        return 9
      }
    )
    await flow.query(`bar(Out).`)

    o(caughtOptions).deepEquals({
      a: 10n,
      b: [20n, 30n]
    })
  })
})
