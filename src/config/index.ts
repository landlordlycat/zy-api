// 环境变量获取工具
const getEnv = (key: string, defaultValue: string = ''): string => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || defaultValue
  }
  return defaultValue
}

// ============================================================
// API 源配置 - 从数据库动态获取
// ============================================================

/**
 * API 源定义（从数据库动态获取）
 */
export const API_SOURCES: Record<string, string> = {}

/**
 * 获取所有 API 源列表
 * 用于文档和验证
 */
export const API_SOURCE_KEYS: string[] = []

/**
 * 默认 API 源
 */
export let API_DEFAULT_SOURCE = 'bfzy'

/**
 * 从数据库加载 API 源配置
 * 需要在应用启动时调用此函数
 */
export const loadApiSourcesFromDb = async (): Promise<void> => {
  try {
    // 动态导入 db 模块（避免循环依赖）
    const { getEnabledApiSources, getDefaultApiSource } = await import('../db')

    // 清空现有配置
    Object.keys(API_SOURCES).forEach(key => delete API_SOURCES[key])
    API_SOURCE_KEYS.length = 0

    // 从数据库加载启用的 API 源
    const sources = getEnabledApiSources()
    sources.forEach(source => {
      API_SOURCES[source.name] = source.url
      API_SOURCE_KEYS.push(source.name)
    })

    // 设置默认源
    const defaultSource = getDefaultApiSource()
    if (defaultSource) {
      API_DEFAULT_SOURCE = defaultSource.name
    }
  } catch (error) {
    console.warn('从数据库加载 API 源配置失败，使用环境变量默认值:', error)

    // 回退到环境变量配置
    API_SOURCES.bfzy = getEnv('API_BFZY', 'https://bfzyapi.com/api.php/provide/vod/')
    API_SOURCES.ffzy = getEnv('API_FFZY', 'https://api.ffzyapi.com/api.php/provide/vod/at/json/')
    API_SOURCES.lzi = getEnv('API_LZI', 'https://cj.lziapi.com/api.php/provide/vod/at/json/')
    API_SOURCE_KEYS.push('bfzy', 'ffzy', 'lzi')
    API_DEFAULT_SOURCE = getEnv('API_DEFAULT_SOURCE', 'bfzy')
  }
}

// ============================================================

// API 配置
export const API_CONFIG = {
  // 默认 API 源
  DEFAULT_SOURCE: API_DEFAULT_SOURCE,

  // 第三方 API 地址（兼容旧配置）
  BFZY_API: getEnv('BFZY_API', 'https://bfzyapi.com/api.php/provide/vod/'),

  // 请求超时时间（毫秒）
  TIMEOUT: Number(getEnv('API_TIMEOUT', '10000')),

  // 默认分页数量
  DEFAULT_PAGE_SIZE: 20,

  // 最大分页数量
  MAX_PAGE_SIZE: 100,

  // Rate Limit 配置
  RATE_LIMIT: {
    DURATION: Number(getEnv('RATE_LIMIT_DURATION', '60000')), // 1分钟
    MAX: Number(getEnv('RATE_LIMIT_MAX', '100')), // 每个IP每分钟最多请求100次
  },
} as const

// 服务器配置
export const SERVER_CONFIG = {
  PORT: Number(process.env.PORT) || 3000,
  HOST: process.env.HOST || 'localhost',
} as const

// CORS 配置
export const CORS_CONFIG = {
  ORIGIN: process.env.CORS_ORIGIN || '*', // 生产环境设置为具体域名，如 'https://yourdomain.com'
  METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  ALLOWED_HEADERS: ['Content-Type', 'Authorization'],
  CREDENTIALS: true,
}
