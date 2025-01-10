import { parseArgs } from 'node:util'

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    force: {
      type: 'boolean',
      short: 'f',
    },
  },
})

export { positionals, values }
