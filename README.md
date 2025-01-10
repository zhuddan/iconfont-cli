# @zd~/iconfont-cli

一个基于[iconfont](https://www.iconfont.cn/)自动生成`react`/`vue`组件的cli。

## 对比

- 使用 `iconfont` 的字体文件，不用每次修改之后重新下载、替换字体文件和css
- 使用 `Symbol字体图标的在线js`，不能兼容小程序

## 特点

- 配置简单
- 类型支持(即使你不使用ts)
- 可自定义修改
- 支持小程序(tarojs/uni-app)
- 具名导出支持组件预览(见下图)

![readme.jpg](./.github/code.png)

## 如何使用

1. 复制你的Symbol字体图标的在线js链接(**确保可以访问**)

![readme.jpg](./.github/readme.jpg)

2. 运行命令

```shell
npx @zd~/iconfont-cli@latest
```

3. 根据命令提示完成你的配置

- 请输入Symbol字体图标的在线js链接
- 请选择一个框架 (react/vue)
- 是否使用ts (yes/no)
- Iconfont 组件路径文件夹 (默认 src/components/iconfont)
- 是否具名导出每一个图标组件 (仅 react 可用)
- 具名导出组件的组件前缀 (仅 react 可用)

然后会在你的执行命令的文件夹下生成一个`iconfont-cli-config.json`文件

```json
{
  "jsLink": "//at.alicdn.com/t/c/你的链接.js", // Symbol字体图标的在线js链接
  "framework": "react", // 框架
  "useTs": true, // 是否使用 ts
  "iconfontPath": "src/components/iconfont", // Iconfont 组件路径文件夹
  "set": true, // 是否具名导出每一个图标组件 (仅 react 可用)
  "iconPrefix": "icon" // 具名导出组件的组件前缀 (仅 react 可用)
}
```

4. 最后他会在 `src/components/iconfont` 目录下生成相应的组件文件，并提示操作成功

生成的示例以上面配置为例

src/components/iconfont/iconfont-data.ts

```ts
/**
 * 图标 svg 数据
 */
const iconfontData = {
  loading: '...',
  left: '...',
  // ...
}
```

src/components/iconfont/iconfont-set.tsx

```tsx
import { ComponentProps } from 'react'
import { Iconfont } from '.'

type CommonIconfontProps = Omit<ComponentProps<typeof Iconfont>, 'name'>

/**
 * IconLoading iconfont component wrapper
 *
 * ![IconLoading](...)
 */
export function IconLoading(props: CommonIconfontProps) {
  return <Iconfont name="loading" {...props} />
}
```

src/components/iconfont/iconfont-types.ts

```tsx
/**
 * 图标名称
 */
export type IconfontTypes = 'loading' | 'check-order' | 'trade' | 'connect' | 'setup' | 'coupon' | 'order' | 'notice' | 'remark' | 'navigate' | 'user' | 'phone' | 'clock' | 'chat' | 'store' | 'star' | 'star-fill' | 'close' | 'shop' | 'location' | 'down' | 'left' | 'plus' | 'right' | 'search' | 'up'
```

src/components/iconfont/iconfont.tsx

```tsx
import type { CSSProperties, HTMLAttributes } from 'react'
import type { IconfontType } from './iconfont-types'
import clsx from 'clsx'
import { useMemo } from 'react'
import data from './iconfont-data'

interface IconfontProps extends HTMLAttributes<HTMLDivElement> {
  size?: number
  color?: string
  name: IconfontType
}

export function Iconfont({
  size,
  color = '#000000',
  name,
  style,
  className,
  ...rest
}: IconfontProps) {
  const mask = useMemo(() => {
    return `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(data[name])}")`
  }, [name])
  const innerStyle = useMemo(() => {
    const _size = size ? `${size}px` : '1em'
    return {
      ...style,
      'mask': mask,
      // eslint-disable-next-line ts/ban-ts-comment
      // @ts-expect-error
      '-webkit-mask': mask,
      'mask-size': _size,
      'width': _size,
      'height': _size,
      'backgroundColor': color,
      'display': 'inline-block',
    } satisfies CSSProperties
  }, [color, mask, size, style])
  return (
    <div
      className={clsx('iconfont', className)}
      style={innerStyle}
      {...rest}
    >
    </div>
  )
}
```

5. 配置文件存在之后，更新在线图标之后**只用再次执行下面命令**即可

```shell
npx @zd~/iconfont-cli@latest
```

6. 为了方便使用，你可以把下面命令添加到你的`package.json`

```json
{
  "scripts": {
    "update-iconfont": "npx @zd~/iconfont-cli@latest",
    "update-iconfont:force": "npx @zd~/iconfont-cli@latest --force"
  }
}
```

> [!NOTE]
> 注意组件文件(react 为 `iconfont.jsx` 或者 `iconfont.tsx`, vue 为 `iconfont.vue`) 只会创建一次！
>
> **目的**是你可以自己修改组件细节，例如上文中的`src/components/iconfont/iconfont.tsx`, 使用小程序的情况下你可以把`size`的单位调整为`rpx`，或者修改组件的默认颜色等
>
> 如果需要覆盖文件重新创建请是使用`npx @zd~/iconfont-cli@latest --force`

感谢您的使用。如果你有任何问题或建议，请随时联系我。
