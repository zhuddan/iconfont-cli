import type { CSSProperties, HTMLAttributes } from 'react'
import type { IconfontType } from './iconfont-types'
import clsx from 'clsx'
import { useMemo } from 'react'
import data from './iconfont-data'

export interface IconfontCommonProps extends HTMLAttributes<HTMLDivElement> {
  size?: number
  color?: string
}

interface IconfontProps extends IconfontCommonProps {
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
    return {
      ...style,
      'mask': mask,
      // eslint-disable-next-line ts/ban-ts-comment
      // @ts-expect-error
      '-webkit-mask': mask,
      'backgroundColor': color,
      'width': size ? `${size}rpx` : '1em',
      'height': size ? `${size}rpx` : '1em',
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
