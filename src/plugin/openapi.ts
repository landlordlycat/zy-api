import { openapi } from '@elysiajs/openapi'

export default openapi({
  path: '/docs',
  documentation: {
    info: {
      title: '视频资源网 API',
      version: '1.0.0',
      description: '资源网 / 视频聚合接口 可用于量子/暴风/非凡等视频源的搜索、详情 / 不再使用cms管理',
      contact: {
        name: '怪物泡泡面',
        email: 'duimiansima@outlook.com',
        url: 'https://space.bilibili.com/33384024',
      },
    },
  },
  exclude: {
    paths: ['/*', '/favicon.ico'],
  },
})
