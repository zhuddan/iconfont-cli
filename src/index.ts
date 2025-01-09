// #!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import * as p from '@clack/prompts'
import * as cheerio from 'cheerio'
import * as ejs from 'ejs'
import { ensureDir } from 'fs-extra'
import { achieveOptions, frameworkOptions } from './constants'
import { fileExists } from './utils'

const cwd = process.cwd()

interface Config {
  js: string
  framework: 'vue' | 'react'
  mini: boolean
  iconfontPath: string
  achieve: 'mask' | 'backgroundImage'
  unit: string
  color: string
}
const configFilePath = path.resolve(cwd, 'iconfont-cli-config.json')
async function init() {
  try {
    const hasConfig = fileExists(configFilePath)
    if (!hasConfig) {
      const config = await p.group(
        {
          js: () => p.text({
            message: '请输入Symbol字体图标的在线js链接(参考readme文件)',
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
            options: frameworkOptions,
          }),
          mini: ({ results }) => {
            return p.confirm({
              message: results.framework === 'react' ? '是否使用tarojs' : '是否使用uniapp',
              initialValue: false,
            })
          },
          iconfontPath: () => p.text({
            message: 'Iconfont 组件路径文件夹',
            initialValue: 'src/components/iconfont',
            defaultValue: 'src/components/iconfont',
            placeholder: 'src/components/iconfont',
          }),
          achieve: () => p.select({
            message: '图标实现方式',
            options: achieveOptions,
          }),
          unit: () => p.text({
            message: '图标大小单位(小程序可以选择rpx)',
            initialValue: 'px',
            defaultValue: 'px',
            placeholder: 'px',
          }),
          color: () => p.text({
            message: '图标默认颜色',
            initialValue: '#000000',
            defaultValue: '#000000',
          }),
        },
        {
          onCancel: () => {
            p.cancel('Operation cancelled.')
            process.exit(0)
          },
        },
      )
      fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2))
    }
    const _config = JSON.parse(fs.readFileSync(configFilePath).toString()) as Config
    await run(_config)
  }
  catch (error) {
    console.warn(error)
    process.exit('')
  }
}

async function run(config: Config) {
  const json = await fetch(`https://${config.js}`).then(res => res.text())
  const ic_path = path.resolve(cwd, config.iconfontPath)
  await ensureDir(ic_path)
  config.iconfontPath = ic_path
  const svgRegex = /<svg[^>]*>([\s\S]*?)<\/svg>/
  const x = json.match(svgRegex)?.[1] ?? ''
  const $ = cheerio.load(`<div>${x}<div/>`)
  const data: Record<string, any> = {}
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
  updateIconfontData(data, config)
  updateIconfontType(types, config)
  updateIconfontComponent(config)
}

function updateIconfontData(data: any, { iconfontPath }: Config) {
  const filename = `iconfont-data.js`
  const context = ejs.render(
    fs.readFileSync(path.resolve(__dirname, `../template/${filename}.ejs`), 'utf-8'),
    {
      data: decodeURIComponent(JSON.stringify(data, null, 2)),
    },
  )
  fs.writeFileSync(
    path.resolve(iconfontPath, filename),
    context,
  )
}

function updateIconfontType(data: string[], { iconfontPath }: Config) {
  const filename = `iconfont-types.ts`
  const context = ejs.render(
    fs.readFileSync(path.resolve(__dirname, `../template/${filename}.ejs`), 'utf-8'),
    {
      data: data.map(e => `"${e}"`).join(' | '),
    },
  )
  fs.writeFileSync(
    path.resolve(iconfontPath, filename),
    context,
  )
}

function updateIconfontComponent(config: Config) {
  const ext = config.framework === 'react' ? '.tsx' : '.vue'
  const componentName = `iconfont${ext}`
  const filename = `iconfont_${config.framework}_${config.mini ? 'mini' : 'default'}${ext}`
  const context = ejs.render(
    fs.readFileSync(path.resolve(__dirname, `../template/${filename}.ejs`), 'utf-8'),
    {
      data: config,
    },
  )
  fs.writeFileSync(
    path.resolve(config.iconfontPath, componentName),
    context,
  )
  console.log(filename)
}

init()
