// 错误类型枚举
export enum ErrorCode {
  NOT_FOUND = 'NOT_FOUND',
  BAD_REQUEST = 'BAD_REQUEST',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  MISSING_KEYWORD = 'MISSING_KEYWORD',
  API_ERROR = 'API_ERROR',
  TIMEOUT = 'TIMEOUT',
}

// 错误响应接口
export interface ErrorResponse {
  error: string
  code: ErrorCode
  message?: string
}

// HTTP 状态码映射
const statusMap: Record<ErrorCode, number> = {
  [ErrorCode.NOT_FOUND]: 404,
  [ErrorCode.BAD_REQUEST]: 400,
  [ErrorCode.INTERNAL_ERROR]: 500,
  [ErrorCode.MISSING_KEYWORD]: 400,
  [ErrorCode.API_ERROR]: 502,
  [ErrorCode.TIMEOUT]: 504,
}

// 错误消息映射
const messageMap: Record<ErrorCode, string> = {
  [ErrorCode.NOT_FOUND]: '资源未找到',
  [ErrorCode.BAD_REQUEST]: '请求参数错误',
  [ErrorCode.INTERNAL_ERROR]: '服务器内部错误',
  [ErrorCode.MISSING_KEYWORD]: '缺少搜索关键词',
  [ErrorCode.API_ERROR]: '第三方 API 错误',
  [ErrorCode.TIMEOUT]: '请求超时',
}

/**
 * 创建错误响应
 */
export function createErrorResponse(
  code: ErrorCode,
  customMessage?: string,
): ErrorResponse {
  return {
    error: code,
    code,
    message: customMessage || messageMap[code],
  }
}

/**
 * 获取 HTTP 状态码
 */
export function getHttpStatus(code: ErrorCode): number {
  return statusMap[code]
}

/**
 * Elysia 错误处理辅助函数
 */
export async function handleApiRequest<T>(
  requestFn: () => Promise<T>,
  options?: { timeout?: number },
): Promise<{ data: T } | ErrorResponse> {
  try {
    const timeout = options?.timeout || 10000
    const result = await Promise.race([
      requestFn(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), timeout),
      ),
    ])
    return { data: result }
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Timeout') {
        return createErrorResponse(ErrorCode.TIMEOUT)
      }
      // 网络错误或解析错误
      return createErrorResponse(ErrorCode.API_ERROR, error.message)
    }
    return createErrorResponse(ErrorCode.INTERNAL_ERROR)
  }
}