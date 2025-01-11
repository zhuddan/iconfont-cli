# @zd~/iconfont-cli

一个基于 [Iconfont](https://www.iconfont.cn/) 自动生成 React/Vue 组件的 CLI 工具，免除字体依赖，提供多种实现方式，支持 TaroJS 和 UniApp。

## 优势对比

### 传统方式

1. **字体文件方式**
   每次修改后需重新下载并替换字体文件和 CSS，过程繁琐。
2. **在线 JS 引用方式**
   Symbol 字体图标的在线 JS 方式无法兼容小程序环境。

### @zd~/iconfont-cli

- **自动化**：仅需简单配置，快速生成组件。
- **类型支持**：内置类型定义，即使你不使用 TypeScript 也能获得良好的开发体验。
- **小程序兼容**：完整支持小程序平台（TaroJS、Uni-App）。
- **可扩展性**：支持自定义调整，灵活满足需求。
- **组件预览**：具名导出便于预览组件效果（如下图所示）。

![readme.jpg](./.github/code.png)

## 如何使用

1. **复制你的 Symbol 字体图标的在线 JS 链接（确保可以访问）**

![readme.jpg](./.github/readme.jpg)

2. **运行命令**

```shell
npx @zd~/iconfont-cli@latest
```

3. **根据命令提示完成你的配置**

- 输入 Symbol 字体图标的在线 JS 链接
- 选择一个框架（React/Vue）
- 是否使用ts (yes / no)
- 请选择图标实现方式 (mask/background)
- 设置 Iconfont 组件路径文件夹（默认 src/components/iconfont）
- 是否具名导出每一个图标组件 (仅 React 可用)
- 设置具名导出组件的组件前缀（仅 React 可用）

配置完成后，工具会在当前目录下生成一个 iconfont-cli-config.json 文件，内容示例如下:

```json
{
  "jsLink": "//at.alicdn.com/t/c/你的链接.js", // Symbol字体图标的在线js链接
  "framework": "react", // 框架
  "useTs": true, // 是否使用 ts
  "achieve": "mask", // 实现方式 mask 遮罩 或 background 背景图
  "iconfontPath": "src/components/iconfont", // Iconfont 组件路径文件夹
  "set": true, // 是否具名导出每一个图标组件 (仅 react 可用)
  "iconPrefix": "icon" // 具名导出组件的组件前缀 (仅 react 可用)
}
```

4. **生成组件文件**

工具会在 src/components/iconfont 目录下生成相应的组件文件，并提示操作成功。

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
export function IconfontLoading(props: CommonIconfontProps) {
  return <Iconfont name="loading" {...props} />
}
```

src/components/iconfont/iconfont-types.ts

```tsx
/**
 * 图标名称
 */
export type IconfontTypes = 'loading' // ....
```

src/components/iconfont/iconfont.tsx

```tsx
import type { CSSProperties, HTMLAttributes } from 'react'
import type { IconfontTypes } from './iconfont-types'
import clsx from 'clsx'
import { useMemo } from 'react'
import data from './iconfont-data'

interface IconfontProps extends HTMLAttributes<HTMLDivElement> {
  size?: number
  color?: string
  name: IconfontTypes
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
      'width': _size,
      'height': _size,
      'display': 'inline-block',
      'maskImage': mask,
      // eslint-disable-next-line ts/ban-ts-comment
      // @ts-expect-error
      '-webkit-mask-image': mask,
      'mask-size': _size,
      '-webkit-mask-size': _size,
      'backgroundColor': color,
      'maskRepeat': 'no-repeat',
      '-webkit-mask-repeat': 'no-repeat',
    } satisfies CSSProperties
  }, [mask, color, size, style])
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

5. **更新在线图标**

更新在线图标后，只需再次运行以下命令即可同步更新：

```shell
npx @zd~/iconfont-cli@latest
```

6.  **推荐脚本配置**

为方便使用，可以将以下命令添加到项目的 package.json 中：

```json
{
  "scripts": {
    "update-iconfont": "npx @zd~/iconfont-cli@latest",
    "update-iconfont:force": "npx @zd~/iconfont-cli@latest --force"
  }
}
```

## 注意

- 组件文件（React：`iconfont.jsx` 或 `iconfont.tsx`，Vue：`iconfont.vue`）默认只会创建一次。

  这样设计的目的是支持用户自定义修改组件细节。例如，在小程序环境中，用户可以将 `size` 单位调整为 `rpx`，或修改组件的默认颜色。

  如果需要覆盖文件并重新创建，请使用以下命令：

  ```shell
  npx @zd~/iconfont-cli@latest --force
  ```

- 实现方式

  - [MDN/mask](https://developer.mozilla.org/zh-CN/docs/Web/CSS/mask)

    `mask` 属性最早由 WebKit 于 2012 年引入，当时以 `-webkit-` 前缀存在。随后，在 2014 年，它被纳入了 CSS Masking Module Level 1 规范草案中。自 2023 年 12 月起，最新的设备和浏览器版本开始支持这一功能。然而，较旧的设备或浏览器可能无法使用此功能。值得注意的是，在微信小程序的 非 Skyline 渲染模式 下，mask 属性可以正常使用，而在 Skyline 渲染模式 下只能使用 background 属性。

  - [MDN/background](https://developer.mozilla.org/zh-CN/docs/Web/CSS/background)

    相比于 `mask` 属性，`background` 属性的兼容性要更好。

感谢您的使用。如果你有任何问题或建议，请随时联系我。
