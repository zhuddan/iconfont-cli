import * as c from 'kolorist'

export const HINT = '使用↑↓选择，回车确认'

export interface PromItem<T> {
  label: string
  value: T
  hint?: string
}

export const frameworkOptions: PromItem<'vue' | 'react'>[] = [
  {
    label: c.cyan('React'),
    value: 'react',
  },
  {
    label: c.green('Vue'),
    value: 'vue',
  },
]

export const achieveOptions: PromItem<'mask' | 'backgroundImage'>[] = [
  {
    label: c.reset('mask'),
    value: 'mask',
    hint: '新特性',
  },
  {
    label: c.gray('backgroundImage'),
    value: 'backgroundImage',
    hint: '兼容性好',
  },
]
