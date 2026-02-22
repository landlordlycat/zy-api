import { Elysia, t } from 'elysia'
import { createApiSource, getAllApiSources, getEnabledApiSources, getApiSourceByName, getDefaultApiSource, updateApiSource, deleteApiSource, type ApiSource } from '../db'

const getEnv = (key: string, defaultValue: string = ''): string => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || defaultValue
  }
  return defaultValue
}

const API_ADMIN_KEY = getEnv('API_ADMIN_KEY', 'admin123')

/**
 * 鉴权检查函数
 */
const checkAuth = (request: Request): void => {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader || authHeader !== `Bearer ${API_ADMIN_KEY}`) {
    throw {
      status: 401,
      message: '未授权：请提供有效的 API Key',
    }
  }
}

/**
 * API 源管理路由
 */
export const sourcesRoutes = new Elysia({ prefix: '/sources' })
  .get(
    '/',
    () => {
      const sources = getAllApiSources()
      return {
        success: true,
        data: sources,
        total: sources.length,
      }
    },
    {
      detail: {
        summary: '获取所有 API 源',
        tags: ['API 源管理'],
      },
    },
  )

  .get(
    '/enabled',
    () => {
      const sources = getEnabledApiSources()
      return {
        success: true,
        data: sources,
        total: sources.length,
      }
    },
    {
      detail: {
        summary: '获取启用的 API 源',
        tags: ['API 源管理'],
      },
    },
  )

  .get(
    '/default',
    () => {
      const source = getDefaultApiSource()
      if (!source) {
        return {
          success: false,
          message: '未找到默认 API 源',
        }
      }
      return {
        success: true,
        data: source,
      }
    },
    {
      detail: {
        summary: '获取默认 API 源',
        tags: ['API 源管理'],
      },
    },
  )

  .get(
    '/:name',
    ({ params }) => {
      const source = getApiSourceByName(params.name)
      if (!source) {
        return {
          success: false,
          message: `未找到名称为 ${params.name} 的 API 源`,
        }
      }
      return {
        success: true,
        data: source,
      }
    },
    {
      detail: {
        summary: '根据名称获取 API 源',
        tags: ['API 源管理'],
      },
      params: t.Object({
        name: t.String(),
      }),
    },
  )
  .guard(
    {
      beforeHandle({ request }) {
        checkAuth(request)
      },
    },
    (app) =>
      app
        .post(
          '/',
          ({ request, body }) => {
            try {
              const source = createApiSource(body.name, body.url, body.timeout || 10000, body.remark || '')
              return {
                success: true,
                message: 'API 源创建成功',
                data: source,
              }
            } catch (error: any) {
              if (error.message?.includes('UNIQUE constraint failed')) {
                return {
                  success: false,
                  message: `名称 ${body.name} 已存在`,
                }
              }
              throw error
            }
          },
          {
            detail: {
              summary: '创建 API 源',
              tags: ['API 源管理'],
            },
            body: t.Object({
              name: t.String({ minLength: 1, maxLength: 50 }),
              url: t.String({ format: 'uri' }),
              timeout: t.Optional(t.Number({ minimum: 1000, maximum: 60000 })),
              remark: t.Optional(t.String({ maxLength: 200 })),
            }),
          },
        )
        .put(
          '/:id',
          ({ request, params, body }) => {
            const id = parseInt(params.id, 10)
            if (isNaN(id)) {
              return {
                success: false,
                message: '无效的 ID',
              }
            }

            try {
              const updated = updateApiSource(id, body)
              if (!updated) {
                return {
                  success: false,
                  message: 'API 源不存在或未更新',
                }
              }

              const source = getApiSourceByName(body.name || '')
              return {
                success: true,
                message: 'API 源更新成功',
                data: source,
              }
            } catch (error: any) {
              if (error.message?.includes('UNIQUE constraint failed')) {
                return {
                  success: false,
                  message: `名称 ${body.name} 已存在`,
                }
              }
              throw error
            }
          },
          {
            detail: {
              summary: '更新 API 源',
              tags: ['API 源管理'],
            },
            params: t.Object({
              id: t.String(),
            }),
            body: t.Object({
              name: t.Optional(t.String({ minLength: 1, maxLength: 50 })),
              url: t.Optional(t.String({ format: 'uri' })),
              is_enabled: t.Optional(t.Number({ enum: [0, 1] })),
              is_default: t.Optional(t.Number({ enum: [0, 1] })),
              timeout: t.Optional(t.Number({ minimum: 1000, maximum: 60000 })),
              remark: t.Optional(t.String({ maxLength: 200 })),
            }),
          },
        )
        .delete(
          '/:id',
          ({ request, params }) => {
            const id = parseInt(params.id, 10)
            if (isNaN(id)) {
              return {
                success: false,
                message: '无效的 ID',
              }
            }

            const deleted = deleteApiSource(id)
            if (!deleted) {
              return {
                success: false,
                message: 'API 源不存在',
              }
            }

            return {
              success: true,
              message: 'API 源删除成功',
            }
          },
          {
            detail: {
              summary: '删除 API 源',
              tags: ['API 源管理'],
            },
            params: t.Object({
              id: t.String(),
            }),
          },
        ),
  )
