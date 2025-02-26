// #!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import process, { config } from 'node:process'
import * as p from '@clack/prompts'
import * as cheerio from 'cheerio'
import * as ejs from 'ejs'
import { ensureDir } from 'fs-extra'
import * as c from 'kolorist'
import { values } from './args'
import { banner } from './banner'
import { FRAMEWORK_OPTIONS, SVG_BASE64_PERFIX } from './constants'
import { fileExists, toPascalCase } from './utils'

const cwd = process.cwd()

interface Config {
  jsLink: string
  framework: 'vue' | 'react'
  useTs: boolean
  iconfontPath: string
  achieve: 'mask' | 'bg'
  set?: boolean
  iconPrefix?: string
}

const configFilePath = path.resolve(cwd, 'iconfont-cli-config.json')
async function init() {
  banner()
  try {
    const hasConfig = fileExists(configFilePath)
    if (!hasConfig) {
      const config = await p.group(
        {
          jsLink: () => p.text({
            message: '请输入 Symbol 字体图标的在线 JS 链接(参考readme文件)',
            placeholder: '例如: //at.alicdn.com/t/c/font_4807277_enrwdyz7swf.js',
            validate(value) {
              if (value === '') {
                return '在线js链接不能为空'
              }
              if (!value.endsWith('.js') || !value.startsWith('//')) {
                return '在线js链接不正确'
              }
            },
          }),
          framework: () => p.select({
            message: '请选择一个框架',
            options: FRAMEWORK_OPTIONS,
          }),
          useTs: () => p.confirm({
            message: '是否使用ts',
            initialValue: true,
          }),
          achieve: () => p.select({
            message: '请选择图标实现方式',
            options: [
              { value: 'mask', label: 'mask 遮罩(新特性)' },
              { value: 'bg', label: 'background-image 背景图(兼容性好)' },
            ],
          }),
          iconfontPath: () => p.text({
            message: '设置 Iconfont 组件路径文件夹',
            initialValue: 'src/components/iconfont',
            defaultValue: 'src/components/iconfont',
            placeholder: 'src/components/iconfont',
          }),
        },
        {
          onCancel: () => {
            p.cancel('Operation cancelled.')
            process.exit(0)
          },
        },
      )

      const setConfig = config.framework === 'react'
        ? await p.group(
          {
            set: () => {
              return p.confirm({
                message: '是否具名导出每一个图标组件',
                initialValue: true,
              })
            },
            iconPrefix: () => {
              return p.text({
                message: '设置具名导出组件的组件前缀',
                initialValue: 'iconfont',
                defaultValue: '',
              })
            },
          },
          {
            onCancel: () => {
              p.cancel('Operation cancelled.')
              process.exit(0)
            },
          },
        )
        : {}
      fs.writeFileSync(configFilePath, JSON.stringify(Object.assign(config, setConfig), null, 2))
    }

    const _config = JSON.parse(fs.readFileSync(configFilePath).toString()) as Config

    await run(_config)
    console.log(c.green('✨✨✨ 操作成功'))
  }
  catch (error) {
    console.warn(error)
    process.exit('')
  }
}

interface Options {
  config: Config
  types: string[]
  data: Record<string, string>
}

async function run(config: Config) {
  const json = await fetch(`https://${config.jsLink}`).then(res => res.text())
  const ic_path = path.resolve(cwd, config.iconfontPath)
  await ensureDir(ic_path)
  config.iconfontPath = ic_path
  const svgRegex = /<svg[^>]*>([\s\S]*?)<\/svg>/
  const x = json.match(svgRegex)?.[1] ?? ''
  const $ = cheerio.load(`<div>${x}<div/>`)
  const data: Record<string, string> = {}
  const types: string[] = []
  $('symbol').each((index, element) => {
    const id = $(element).attr('id')?.replace('icon-', '') ?? ''
    $('path').attr('fill', `currentColor`)
    $(element).attr('width', `1em`)
    $(element).attr('height', `1em`)
    $(element).attr('xmlns', `http://www.w3.org/2000/svg`)
    const outerHTML = $(element).prop('outerHTML') ?? ''
    data[id] = outerHTML.replace(/symbol/g, 'svg').replace(/viewbox/gi, 'viewBox')
    types.push(id)
  })
  const options: Options = {
    data,
    config,
    types,
  }
  updateIconfontData(options)
  updateIconfontType(options)
  updateIconfontComponent(options)
  updateIconfontSet(options)
}

function updateIconfontData({ data, config: { iconfontPath, useTs, achieve } }: Options) {
  const filename = achieve === 'bg' ? `iconfont-data` : 'iconfont-css'

  const renderData = achieve === 'bg'
    ? decodeURIComponent(JSON.stringify(data, null, 2))
    : `${Object.entries(data).map(([name, value]) => {
      return `.iconfont.${name} { \n  mask-image: url('data:image/svg+xml;charset=utf-8,${encodeURIComponent(value)}');\n  -webkit-mask-image: url('data:image/svg+xml;charset=utf-8,${encodeURIComponent(value)}');\n}`
    }).join('\n\n')}`

  const context = ejs.render(
    fs.readFileSync(path.resolve(__dirname, `../template/${filename}.ejs`), 'utf-8'),
    {
      data: renderData,
    },
  )
  const _ = `${filename}${achieve === 'bg' ? useTs ? '.ts' : '.js' : '.css'}`
  fs.writeFileSync(path.resolve(iconfontPath, _), context)
}

function updateIconfontType({ config: { useTs, iconfontPath }, types }: Options) {
  if (!useTs) {
    return
  }
  const filename = `iconfont-types.ts`
  const context = ejs.render(
    fs.readFileSync(path.resolve(__dirname, `../template/${filename}.ejs`), 'utf-8'),
    {
      types: types.map(e => `"${e}"`).join(' | '),
    },
  )
  fs.writeFileSync(
    path.resolve(iconfontPath, filename),
    context,
  )
}

function updateIconfontComponent(
  { config: { useTs, framework, iconfontPath, achieve }, types }: Options,
) {
  const fileExtension = useTs ? 'ts' : 'js'
  const ext = framework === 'react'
    ? useTs ? '.tsx' : '.jsx'
    : '.vue'
  const componentName = `iconfont${ext}`

  const componentFilePath = path.resolve(iconfontPath, componentName)

  const showOverwrite
  = fileExists(componentFilePath) === false
  || values.force

  const typeStr = types.map(e => `"${e}"`).join(' | ')

  if (!showOverwrite) {
    console.log('\n')
    console.log(c.bgGray('提示'))
    console.log(
      c.gray(`组件 ${componentFilePath} 已存在!\n当前操作只会替换当前组件的"IconfontTypes"的类型声明和其他文件\n如果需要覆盖重新生成请使用 --force 或者 -f 参数\n`),
    )
    if (
      fileExtension === 'js'
      && fileExists(componentFilePath)
    ) {
      const file = fs.readFileSync(componentFilePath).toString()
      const updatedString = file.replace(
        /@typedef\s*\{[^}]+\}\s*IconfontTypes/,
        `@typedef { ${typeStr} } IconfontTypes`,
      )
      fs.writeFileSync(
        componentFilePath,
        updatedString,
      )
    }
    return
  }

  const filename = `iconfont_${framework}_${fileExtension}.ejs`
  const context = ejs.render(
    fs.readFileSync(path.resolve(__dirname, `../template/${filename}`), 'utf-8'),
    {
      types: typeStr,
      achieve,
    },
  )

  fs.writeFileSync(
    componentFilePath,
    context,
  )
}

function updateIconfontSet(
  {
    data,
    config: { set, framework, iconfontPath, useTs, iconPrefix },
    types,
  }: Options,
) {
  if (!set)
    return

  const filename = `iconfont_${framework}_set.ejs`
  if (framework === 'react') {
    const context = ejs.render(
      fs.readFileSync(path.resolve(__dirname, `../template/${filename}`), 'utf-8'),
      {
        useTs,
        sets: types.map((name) => {
          const svg = data[name].replace(/currentColor/g, '#ffffff')
          const _iconPrefix = iconPrefix ? `${iconPrefix.replace(/[^a-z0-9]/gi, '')}-` : ''
          const componentName = toPascalCase(_iconPrefix + name)
          const svgImage = `${SVG_BASE64_PERFIX}${encodeURIComponent(svg)}`
          return {
            componentName,
            name,
            svgImage,
          }
        }),
      },
    )

    fs.writeFileSync(
      path.resolve(iconfontPath, `iconfont-set${useTs ? '.tsx' : '.jsx'}`),
      context,
    )
  }
}

init()
