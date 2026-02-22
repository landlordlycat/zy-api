import { rateLimit } from 'elysia-rate-limit'
import { API_CONFIG } from '../config'

const rateLimitPlugin = rateLimit({
  duration: API_CONFIG.RATE_LIMIT.DURATION,
  max: API_CONFIG.RATE_LIMIT.MAX,
  errorResponse: new Response(
    JSON.stringify({
      error: '请求过于频繁，请稍后再试',
      code: 429,
    }),
    {
      status: 429,
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
    },
  ),
})

export default rateLimitPlugin
