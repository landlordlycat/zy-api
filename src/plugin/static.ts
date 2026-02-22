import { staticPlugin } from '@elysiajs/static'

const staticFiles = staticPlugin({
  assets: 'public',
  prefix: '',
})

export default staticFiles
