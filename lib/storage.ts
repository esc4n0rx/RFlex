// LocalStorage utilities for RFlex Admin Console

const STORAGE_KEYS = {
  AUTH_TOKEN: 'rflex_auth_token',
  AUTH_USER: 'rflex_auth_user'
}

export function getItem<T>(key: string): T | null {
  if (typeof window === 'undefined') return null
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : null
  } catch {
    return null
  }
}

export function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error('Error saving to localStorage:', error)
  }
}

export function removeItem(key: string): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(key)
}

export { STORAGE_KEYS }
