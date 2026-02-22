import { Elysia, t } from 'elysia'
import type { VideoListResponse } from '../types'

import { handleApiRequest, createErrorResponse, ErrorCode, ErrorResponse } from '../utils/errorHandler'
import { API_CONFIG } from '../config'
import { fetchApi, type ListApiResponse } from '../utils/apiClient'
import { transformVideoList, transformVideoListWithoutTypeName } from '../utils/dataTransform'

export const searchRoutes = new Elysia({ prefix: '/search' }).get(
  '/',
  async ({ query, set }): Promise<VideoListResponse | ErrorResponse> => {
    const wd = query.wd
    const limit = Math.min(query.limit ?? API_CONFIG.DEFAULT_PAGE_SIZE, API_CONFIG.MAX_PAGE_SIZE)
    const pg = query.page ?? 1

    const source = query.source

    if (!wd) {
      set.status = 400
      return createErrorResponse(ErrorCode.MISSING_KEYWORD)
    }

    const result = await handleApiRequest(
      async () => {
        const data = await fetchApi<ListApiResponse>(
          {
            wd,
            pg: String(pg),
          },
          source,
        )

        return {
          page: data.page,
          pageCount: data.pagecount,
          total: data.total,
          // typeName: data.list[0]?.type_name ?? '',
          list: transformVideoList(data.list, limit),
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
    query: t.Object(
      {
        wd: t.String({
          description: '搜索关键词',
          default: '十八岁太奶奶驾到',
        }),
        page: t.Optional(t.Number({ default: 1, description: '页码' })),
        limit: t.Optional(t.Number({ default: 20, description: '分页数量' })),
        source: t.Optional(
          t.String({
            description: 'API 源（可选，默认使用数据库中配置的默认源）',
          }),
        ),
      },
      {
        title: '搜索视频',
        description: '根据关键词搜索视频，返回分页结果',
      },
    ),
    detail: {
      summary: '搜索视频',
      description: '根据关键词搜索视频，返回分页结果',
    },
  },
)
