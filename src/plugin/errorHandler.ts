import { Elysia } from 'elysia'
import { ErrorResponse, ErrorCode } from '../utils/errorHandler'
import { getHttpStatus } from '../utils/errorHandler'

export default new Elysia({
  name: 'error-handler',
}).onError(({ code, error, set }) => {
  // 设置默认错误响应
  let errorCode: ErrorCode = ErrorCode.INTERNAL_ERROR
  let message = error instanceof Error ? error.message : '未知错误'

  switch (code) {
    case 'NOT_FOUND':
      errorCode = ErrorCode.NOT_FOUND
      set.status = 404
      break
    case 'VALIDATION':
      errorCode = ErrorCode.BAD_REQUEST
      set.status = 400
      message = '请求参数验证失败'
      break
    case 'INTERNAL_SERVER_ERROR':
      errorCode = ErrorCode.INTERNAL_ERROR
      set.status = 500
      break
    default:
      if (error instanceof Error) {
        set.status = getHttpStatus(errorCode)
      }
  }

  const response: ErrorResponse = {
    error: errorCode,
    code: errorCode,
    message,
  }

  return response
})
