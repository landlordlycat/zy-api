import cors from '@elysiajs/cors'
import { CORS_CONFIG } from '../config'

export default cors({
  origin: CORS_CONFIG.ORIGIN,
  methods: CORS_CONFIG.METHODS,
  allowedHeaders: CORS_CONFIG.ALLOWED_HEADERS,
  credentials: CORS_CONFIG.CREDENTIALS,
})