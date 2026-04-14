// ============================================================
// Rate Limiter — Protección contra abuso en endpoints públicos
// In-memory store (se reinicia con cada deploy, pero suficiente para Vercel)
// ============================================================

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// Limpiar entradas expiradas cada 5 minutos
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key)
  }
}, 5 * 60 * 1000)

interface RateLimitConfig {
  maxRequests: number
  windowMs: number // ventana de tiempo en ms
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
}

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now()
  const key = identifier
  const entry = store.get(key)

  // Si no hay entrada o expiró, crear nueva
  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + config.windowMs })
    return { allowed: true, remaining: config.maxRequests - 1, resetAt: now + config.windowMs }
  }

  // Incrementar contador
  entry.count++

  if (entry.count > config.maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }

  return { allowed: true, remaining: config.maxRequests - entry.count, resetAt: entry.resetAt }
}

// Extraer IP del request — usar SOLO headers que setea Vercel directamente
// (no x-forwarded-for: ese viene del cliente y es spoofable).
// Ver: https://vercel.com/docs/edge-network/headers/request-headers
export function getClientIP(request: Request): string {
  const vercelFwd = request.headers.get('x-vercel-forwarded-for')
  if (vercelFwd) return vercelFwd.split(',')[0]?.trim() || 'unknown'

  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp

  return 'unknown'
}

// Configs predefinidas
export const RATE_LIMITS = {
  // Consultar disponibilidad: 30 por minuto por IP
  availability: { maxRequests: 30, windowMs: 60 * 1000 },
  // Crear cita: 5 por hora por IP
  booking: { maxRequests: 5, windowMs: 60 * 60 * 1000 },
  // Webhook: 100 por minuto (Huli puede enviar varios seguidos)
  webhook: { maxRequests: 100, windowMs: 60 * 1000 },
}
