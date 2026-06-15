import { apiRequest, API_BASE_URL } from '../api-client'
import { getItem, STORAGE_KEYS } from '../storage'
import type { RFlexApkListResponse, RFlexApkUploadProgress, RFlexApkUploadResponse } from '../types'

export interface RFlexApkUploadInput {
  version: string
  notes?: string
  file: File
  uploadId?: string
  onUploadProgress?: (percent: number, loaded: number, total: number) => void
}

function buildUrl(path: string): string {
  const baseUrl = API_BASE_URL.replace(/\/$/, '')
  return baseUrl ? `${baseUrl}${path}` : path
}

function parseUploadError(xhr: XMLHttpRequest): string {
  try {
    const data = JSON.parse(xhr.responseText) as { detail?: string }
    if (data.detail) return data.detail
  } catch {
    // Fall back to the status text below.
  }

  return xhr.statusText || 'Erro ao enviar APK'
}

export const downloadsClient = {
  listRFlexApks(): Promise<RFlexApkListResponse> {
    return apiRequest<RFlexApkListResponse>('/api/v1/downloads/rflex')
  },

  createRFlexUpload(): Promise<{ upload_id: string }> {
    return apiRequest<{ upload_id: string }>('/api/v1/downloads/rflex/uploads', { method: 'POST' })
  },

  getRFlexUploadProgress(uploadId: string): Promise<RFlexApkUploadProgress> {
    return apiRequest<RFlexApkUploadProgress>(`/api/v1/downloads/rflex/uploads/${uploadId}`)
  },

  deleteRFlexApk(version: string): Promise<void> {
    return apiRequest<void>(`/api/v1/downloads/rflex/${encodeURIComponent(version)}`, { method: 'DELETE' })
  },

  async uploadRFlexApk(data: RFlexApkUploadInput): Promise<RFlexApkUploadResponse> {
    const formData = new FormData()
    formData.append('version', data.version)

    if (data.notes?.trim()) {
      formData.append('notes', data.notes.trim())
    }

    if (data.uploadId) {
      formData.append('upload_id', data.uploadId)
    }

    formData.append('file', data.file)

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      const token = getItem<string>(STORAGE_KEYS.AUTH_TOKEN)

      xhr.open('POST', buildUrl('/api/v1/downloads/rflex'))

      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`)
      }

      if (data.uploadId) {
        xhr.setRequestHeader('X-Upload-Id', data.uploadId)
      }

      xhr.upload.onprogress = (event) => {
        if (!event.lengthComputable || !data.onUploadProgress) return
        const percent = Math.round((event.loaded / event.total) * 100)
        data.onUploadProgress(percent, event.loaded, event.total)
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText) as RFlexApkUploadResponse)
          return
        }

        reject(new Error(parseUploadError(xhr)))
      }

      xhr.onerror = () => reject(new Error('Erro de rede ao enviar APK'))
      xhr.send(formData)
    })
  },
}
