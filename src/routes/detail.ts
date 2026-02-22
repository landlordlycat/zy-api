import { Elysia, t } from 'elysia'
import parsePlayUrl from '../utils/parsePlayUrl'
import type { VideoDetailResponse } from '../types'
import { handleApiRequest, ErrorCode, ErrorResponse } from '../utils/errorHandler'
import { fetchApi, type DetailApiResponse } from '../utils/apiClient'
import { API_CONFIG } from '../config'

export const detailRoutes = new Elysia({ prefix: '/detail' }).get(
  '/:id',

  async ({ params, query, set }): Promise<VideoDetailResponse | ErrorResponse> => {
    const source = query.source

    const result = await handleApiRequest(
      async () => {
        const data = await fetchApi<DetailApiResponse>(
          {
            ac: 'detail',
            ids: params.id,
          },

          source,
        )

        const vod = data.list?.[0]
        if (!vod) {
          throw new Error(ErrorCode.NOT_FOUND)
        }

        return {
          id: vod.vod_id,
          introduction: vod.vod_content,
          actors: vod.vod_actor,
          director: vod.vod_director,
          total: vod.vod_total,
          area: vod.vod_area,
          year: vod.vod_year,
          language: vod.vod_lang,
          cover: vod.vod_pic,
          typeId: vod.type_id,
          typeName: vod.vod_class,
          title: vod.vod_name,
          status: vod.vod_status,
          remarks: vod.vod_remarks,
          doubanUrl: `https://movie.douban.com/subject/${vod.vod_douban_id}/`,
          doubanScore: vod.vod_douban_score,
          time: vod.vod_time,
          episodes: parsePlayUrl(vod.vod_play_url),
        }
      },
      { timeout: API_CONFIG.TIMEOUT },
    )

    if ('error' in result) {
      set.status =
        result.code === ErrorCode.NOT_FOUND ? 404
        : result.code === ErrorCode.TIMEOUT ? 504
        : 502
      return result
    }

    return result.data
  },
  {
    params: t.Object({
      id: t.String({
        description: '视频 ID',
        default: '114532',
      }),
    }),
    query: t.Object({
      source: t.Optional(
        t.String({
          description: 'API 源（可选，默认使用数据库中配置的默认源）',
        }),
      ),
    }),
    detail: {
      summary: '获取视频详情',
      description: '根据视频 ID 获取视频详情信息，包含视频详情信息',
    },
  },
)
