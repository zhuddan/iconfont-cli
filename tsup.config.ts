import { defineConfig } from 'tsup'

export default () => (
  defineConfig({
    entry: {
      script: 'src/index.ts',
    },
    format: 'cjs',
    platform: 'node',
    target: 'node12',
    minify: 'terser',
    clean: true,
  })
)
