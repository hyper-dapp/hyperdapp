import o from 'ospec'
import { createFlow } from '../index.js'

o.spec('Declarative Helpers', () => {

  async function make(flowCode) {
    const flow = await createFlow(flowCode, {
      async onCallFn() {
        throw new Error('Not testing')
      }
    })
    await flow.init({ address: '0x0' })
    return flow
  }

  o('prompt_once/1', async () => {
    const flow = await make(`prompt([foo]) :- prompt_once(x).`)
    o((await flow.matchPrompts(10, `foo`, 'Out')).length).equals(1)
    o((await flow.matchPrompts(10, `foo`, 'Out')).length).equals(0)
  })
})
