import { getItem, STORAGE_KEYS } from './storage'
import type { ApiErrorResponse } from './types'

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE'

interface RequestOptions {
  method?: HttpMethod
  body?: unknown
  query?: Record<string, string | number | boolean | undefined | null>
  headers?: Record<string, string>
  auth?: boolean
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? ''

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const hasBase = API_BASE_URL.length > 0
  const baseUrl = hasBase ? API_BASE_URL.replace(/\/$/, '') : ''
  const rawPath = path.startsWith('/') ? path : `/${path}`
  const url = hasBase ? new URL(`${baseUrl}${rawPath}`) : new URL(rawPath, 'http://localhost')

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null) return
      url.searchParams.set(key, String(value))
    })
  }

  if (hasBase) {
    return url.toString()
  }

  return `${rawPath}${url.search}`
}

async function parseError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as ApiErrorResponse
    if (data?.detail) return data.detail
  } catch {
    return response.statusText || 'Erro na requisicao'
  }
  return response.statusText || 'Erro na requisicao'
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, query, headers, auth = true } = options
  const token = auth ? getItem<string>(STORAGE_KEYS.AUTH_TOKEN) : null

  const response = await fetch(buildUrl(path, query), {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers
    },
    body: body ? JSON.stringify(body) : undefined
  })

  if (!response.ok) {
    const message = await parseError(response)
    throw new Error(message)
  }

  if (response.status === 204) {
    return null as T
  }

  return response.json() as Promise<T>
}

export async function apiRequestBlob(
  path: string,
  options: RequestOptions = {}
): Promise<Blob> {
  const { method = 'GET', query, headers, auth = true } = options
  const token = auth ? getItem<string>(STORAGE_KEYS.AUTH_TOKEN) : null

  const response = await fetch(buildUrl(path, query), {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers
    }
  })

  if (!response.ok) {
    const message = await parseError(response)
    throw new Error(message)
  }

  return response.blob()
}

export { API_BASE_URL }
