import { Elysia, t } from 'elysia'

import { handleApiRequest, ErrorCode } from '../utils/errorHandler'
import { API_CONFIG } from '../config'
import { fetchApi, type ListApiResponse } from '../utils/apiClient'
import { transformVideoListWithoutTypeName } from '../utils/dataTransform'

export const listRoutes = new Elysia({ prefix: '/list' }).get(
  '/',
  async ({ query, set }) => {
    const pg = query.page ?? 1
    const limit = Math.min(query.limit ?? API_CONFIG.DEFAULT_PAGE_SIZE, API_CONFIG.MAX_PAGE_SIZE)
    const type = query.typeId || ''
    const source = query.source

    const result = await handleApiRequest(
      async () => {
        const data = await fetchApi<ListApiResponse>(
          {
            ac: 'list',
            pg: String(pg),
            t: type,
          },
          source,
        )

        return {
          page: data.page,
          pageCount: data.pagecount,
          total: data.total,
          typeName: data.list[0]?.type_name ?? '',
          list: transformVideoListWithoutTypeName(data.list, limit),
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
      description: '分页查询视频列表，具体分类 typeId 可通过 /types 接口获取',
      summary: '获取视频列表',
    },

    query: t.Object(
      {
        page: t.Optional(t.Number({ default: 1, description: '页码' })),
        limit: t.Optional(t.Number({ default: 20, description: '分页数量' })),
        typeId: t.Optional(t.Number({ description: '分类 ID' })),
        source: t.Optional(
          t.String({
            description: 'API 源（可选，默认使用数据库中配置的默认源）',
          }),
        ),
      },
      {
        title: '获取视频列表',
        description: '分页查询视频列表，typeId 可选，表示分类 ID，具体分类 ID 可通过 /types 接口获取',
      },
    ),
  },
)
