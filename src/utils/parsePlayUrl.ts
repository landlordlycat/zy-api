import type { Episode } from '../types'

function parsePlayUrl(playUrl?: string): Episode[] {
  if (!playUrl) return []

  return playUrl.split('#').map((item) => {
    const [name, url] = item.split('$')
    return { name, url }
  })
}

export default parsePlayUrl