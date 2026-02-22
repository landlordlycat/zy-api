import type { RawVideoData } from '../types'
import { API_CONFIG, API_SOURCES } from '../config'

/**
 * 获取 API 源 URL
 */
const getApiSource = async (source?: string): Promise<string> => {
  // 动态导入 db 模块
  const { getApiSourceByName, getEnabledApiSources } = await import('../db')

  // 如果没有指定源，使用默认源
  if (!source) {
    source = API_CONFIG.DEFAULT_SOURCE
  }

  // 检查源是否存在且启用
  const apiSource = getApiSourceByName(source)
  if (!apiSource) {
    throw new Error(`API 源 "${source}" 不存在`)
  }

  if (apiSource.is_enabled !== 1) {
    throw new Error(`API 源 "${source}" 已禁用`)
  }

  return apiSource.url
}

/**
 * 构建 API URL
 */
export const buildApiUrl = async (params?: Record<string, string | number>, source?: string): Promise<URL> => {
  const apiBaseUrl = await getApiSource(source)
  const url = new URL(apiBaseUrl)

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, String(value))
    })
  }

  return url
}

/**
 * 发起 API 请求
 */
export const fetchApi = async <T>(params?: Record<string, string | number>, source?: string): Promise<T> => {
  const url = await buildApiUrl(params, source)

  try {
    const response = await fetch(url.toString(), {
      signal: AbortSignal.timeout(API_CONFIG.TIMEOUT),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        Referer: url.origin,
      },
    })

    if (response.redirected && response.url.includes('/WAF/')) {
      throw new Error('请求被WAF拦截,这个破逼非凡')
    }

    if (!response.ok) {
      throw new Error(`API 请求失败: ${response.status} ${response.statusText}`)
    }

    return (await response.json()) as T
  } catch (error) {
    if (error instanceof Error && error.name === 'TimeoutError') {
      throw new Error('请求超时')
    }
    throw error
  }
}

/**
 * API 响应类型定义
 */
export interface ListApiResponse {
  page: number
  pagecount: number
  total: number
  list: RawVideoData[]
}

export interface DetailApiResponse {
  list: RawVideoData[]
}

export interface TypesApiResponse {
  class: Array<{
    type_id: number
    type_name: string
    type_pid: number
  }>
}
