import { apiRequest } from '../api-client'
import { getItem, removeItem, setItem, STORAGE_KEYS } from '../storage'
import type { AdminUserResponse, TokenResponse } from '../types'

export const authClient = {
  async login(email: string, password: string): Promise<{ token: TokenResponse; user: AdminUserResponse }> {
    const token = await apiRequest<TokenResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: { email, password },
      auth: false
    })

    setItem(STORAGE_KEYS.AUTH_TOKEN, token.access_token)
    const user = await this.getMe()
    setItem(STORAGE_KEYS.AUTH_USER, user)
    return { token, user }
  },

  async getMe(): Promise<AdminUserResponse> {
    return apiRequest<AdminUserResponse>('/api/v1/auth/me')
  },

  getStoredUser(): AdminUserResponse | null {
    return getItem<AdminUserResponse>(STORAGE_KEYS.AUTH_USER)
  },

  getAccessToken(): string | null {
    return getItem<string>(STORAGE_KEYS.AUTH_TOKEN)
  },

  isAuthenticated(): boolean {
    return Boolean(this.getAccessToken())
  },

  async logout(): Promise<void> {
    try {
      await apiRequest<void>('/api/v1/auth/logout', { method: 'POST' })
    } finally {
      removeItem(STORAGE_KEYS.AUTH_TOKEN)
      removeItem(STORAGE_KEYS.AUTH_USER)
    }
  }
}
