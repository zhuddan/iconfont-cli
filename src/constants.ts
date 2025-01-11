import * as c from 'kolorist'

export interface PromItem<T> {
  label: string
  value: T
  hint?: string
}

export const FRAMEWORK_OPTIONS: PromItem<'vue' | 'react'>[] = [
  {
    label: c.cyan('React'),
    value: 'react',
  },
  {
    label: c.green('Vue'),
    value: 'vue',
  },
]

export const SVG_BASE64_PERFIX = `data:image/svg+xml;charset=utf-8,`
