// ============================================================
// HuliClient — REST client para HuliPractice API v2
// Auth: API Key → JWT token (POST /practice/v2/authorization/token)
// Todas las requests requieren header id_organization
// ============================================================

import type { HuliApiError, HuliAuthResponse, HuliConfig } from './huli-types'

export class HuliClient {
  private config: HuliConfig
  private jwt: string | null = null
  private jwtExpiresAt: number = 0

  constructor(config: HuliConfig) {
    this.config = config
  }

  // ── JWT Token Management ────────────────────────────────────

  private async getJwt(): Promise<string> {
    // Reusar JWT si no ha expirado (margen de 5 min)
    if (this.jwt && Date.now() < this.jwtExpiresAt - 300_000) {
      return this.jwt
    }

    const response = await fetch(`${this.baseUrl}/practice/v2/authorization/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: this.config.apiKey }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new HuliApiRequestError({
        status: response.status,
        message: `JWT token error: ${errorText}`,
        code: 'auth_error',
      })
    }

    const result: HuliAuthResponse = await response.json()
    this.jwt = result.data.jwt

    // JWT típicamente expira en 1h, asumimos 55 min por seguridad
    this.jwtExpiresAt = Date.now() + 55 * 60 * 1000

    return this.jwt
  }

  private async getHeaders(): Promise<Record<string, string>> {
    const jwt = await this.getJwt()
    return {
      'Authorization': `Bearer ${jwt}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'id_organization': String(this.config.idOrganization),
    }
  }

  // ── HTTP Methods ────────────────────────────────────────────

  async get<T>(path: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`)
    if (params) {
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: await this.getHeaders(),
    })

    return this.handleResponse<T>(response)
  }

  async post<T>(path: string, body: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: await this.getHeaders(),
      body: JSON.stringify(body),
    })

    return this.handleResponse<T>(response)
  }

  async put<T>(path: string, body?: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'PUT',
      headers: await this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    })

    return this.handleResponse<T>(response)
  }

  // ── Helpers ─────────────────────────────────────────────────

  private get baseUrl(): string {
    return this.config.apiUrl.replace(/\/$/, '')
  }

  invalidateToken(): void {
    this.jwt = null
    this.jwtExpiresAt = 0
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (response.status === 401 && this.jwt) {
      this.invalidateToken()
    }

    if (!response.ok) {
      const errorBody = await response.text()
      let parsed: Partial<HuliApiError> = {}
      try { parsed = JSON.parse(errorBody) } catch { /* raw text */ }

      throw new HuliApiRequestError({
        status: response.status,
        message: parsed.message || errorBody || response.statusText,
        code: parsed.code,
      })
    }

    return response.json() as Promise<T>
  }
}

export class HuliApiRequestError extends Error {
  status: number
  code?: string

  constructor(error: HuliApiError) {
    super(`Huli API [${error.status}]: ${error.message}`)
    this.name = 'HuliApiRequestError'
    this.status = error.status
    this.code = error.code
  }
}
