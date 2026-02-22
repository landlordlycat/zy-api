import { Elysia, t } from 'elysia'
import { handleApiRequest, ErrorCode } from '../utils/errorHandler'
import { API_CONFIG } from '../config'
import { fetchApi, type ListApiResponse } from '../utils/apiClient'
import { transformVideoList } from '../utils/dataTransform'

export const hotRoutes = new Elysia({ prefix: '/hot' }).get(
  '/',
  async ({ query, set }) => {
    const { limit = API_CONFIG.DEFAULT_PAGE_SIZE, page = 1, typeId = 58, source } = query
    const actualLimit = Math.min(limit, API_CONFIG.MAX_PAGE_SIZE)

    const result = await handleApiRequest(
      async () => {
        const data = await fetchApi<ListApiResponse>(
          {
            ac: 'list',
            t: String(typeId),
            h: '24',
            pg: String(page),
          },
          source,
        )

        return transformVideoList(data.list, actualLimit)
      },
      { timeout: API_CONFIG.TIMEOUT },
    )

    if ('error' in result) {
      set.status = result.code === ErrorCode.TIMEOUT ? 504 : 502
      return result
    }

    return result.data
  },
  {
    query: t.Object(
      {
        typeId: t.Optional(t.Number({ default: 58, description: '分类 ID' })),
        page: t.Optional(t.Number({ default: 1, description: '页码' })),
        limit: t.Optional(t.Number({ default: 20, description: '分页数量' })),
        source: t.Optional(
          t.String({
            description: 'API 源（可选，默认使用数据库中配置的默认源）',
          }),
        ),
      },
      {
        title: '获取热门视频',
        description: '获取最近 24 小时的热门视频',
      },
    ),
    detail: {
      summary: '获取热门视频',
      description: '获取最近 24 小时的热门视频',
    },
  },
)
