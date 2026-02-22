import { Elysia, t } from 'elysia'
import { API_CONFIG } from '../config'
import { handleApiRequest, ErrorCode } from '../utils/errorHandler'
import { fetchApi, type TypesApiResponse } from '../utils/apiClient'
import { transformCategories } from '../utils/dataTransform'

export const typesRoutes = new Elysia({ prefix: '/types' }).get(
  '/',
  async ({ query, set }) => {
    const source = query.source

    const result = await handleApiRequest(
      async () => {
        const data = await fetchApi<TypesApiResponse>({ ac: 'type' }, source)

        return {
          total: data.class.length,
          types: transformCategories(data.class),
        }
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
    detail: {
      summary: '获取分类列表',
      description: '获取分类列表，例如: 58 为短剧大全，72 为古装仙侠',
    },

    query: t.Object({
      source: t.Optional(
        t.String({
          description: 'API 源（可选，默认使用数据库中配置的默认源）',
        }),
      ),
    }),
  },
)
