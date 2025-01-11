import { cyan, gray } from 'kolorist'
import { name, version } from '../package.json'

const bannerMessage = `${cyan(`欢迎使用${name}@${version}`)}
${gray('如果您使用中遇到任何问题，请联系我！')}
`

export const banner = () => console.log((bannerMessage))
