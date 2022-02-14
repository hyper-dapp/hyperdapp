import { setFlowDir } from 'hyperdapp-dev'
export * from 'hyperdapp-dev'

const __dirname = new URL('.', import.meta.url).pathname;

setFlowDir(__dirname + '/integration')
