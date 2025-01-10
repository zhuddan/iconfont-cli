// import type { Options } from 'boxen'
// import boxen from 'boxen'
import { bgRed, cyan, gray, red } from 'kolorist'

import { name, version } from '../package.json'

const bannerMessage = `${cyan(`欢迎使用${name}@${version}`)}
${gray('如果您使用中遇到任何问题，请联系我！')}
`

// const boxenOptions: Options = {
//   padding: 1,
//   margin: 1,
//   borderColor: '#00FFFF',
//   borderStyle: 'round',
//   align: 'center',
// }

export const banner = () => console.log((bannerMessage))
