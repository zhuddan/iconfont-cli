import { defineConfig } from 'tsup'

export default () => (
  defineConfig({
    banner: {
      js: '#!/usr/bin/env node',
    },
    entry: {
      script: 'src/index.ts',
    },
    format: 'cjs',
    platform: 'node',
    target: 'node14',
    minify: 'terser',
    clean: true,
  })
)
