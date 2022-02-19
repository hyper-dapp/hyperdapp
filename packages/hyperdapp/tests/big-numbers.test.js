import o from 'ospec'
import { createFlow } from '../index.js'

o.spec('Big numbers', () => {

  async function make(flowCode) {
    const flow = await createFlow(flowCode, {
      async onCallFn() {
        throw new Error('Not testing')
      }
    })
    await flow.init({ address: '0x0' })
    return flow
  }

  o('Used by default', async () => {
    const flow = await make(`prompt([abc(X)]) :- X is 8 + 2.`)
    const [{ N }] = await flow.matchPrompts(10, `abc(N)`, 'N')
    o(N).equals(10n)
  })

  o('Serialized as BigInt strings', async () => {
    const flow = await make(`prompt([abc(X)]) :- X is 8 + 2.`)
    const [[[, serializedValue]]] = await flow.getPrompts(10)
    o(serializedValue).equals('10n')
  })
})
