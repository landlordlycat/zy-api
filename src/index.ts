import { Elysia, redirect } from 'elysia'
import { openapi, rateLimit, logger, errorHandler, cors, staticFiles } from './plugin'
import { listRoutes, typesRoutes, searchRoutes, detailRoutes, hotRoutes, sourcesRoutes } from './routes'
import { SERVER_CONFIG, loadApiSourcesFromDb } from './config'
import { initDb } from './db'

// 初始化数据库
initDb()

// 加载 API 源配置
await loadApiSourcesFromDb()

const app = new Elysia().use(cors).use(errorHandler).use(openapi).use(rateLimit).use(logger).use(listRoutes).use(typesRoutes).use(searchRoutes).use(detailRoutes).use(hotRoutes).use(sourcesRoutes).use(staticFiles)

// 首页重定向到文档
app.get('/', () => redirect('/docs'), {
  detail: { hide: true },
})

app.listen(SERVER_CONFIG.PORT)

console.log(`🚀 API running on http://${SERVER_CONFIG.HOST}:${SERVER_CONFIG.PORT}`)
