import { apiRequestFormData } from '../api-client'
import type { RFlexApkUploadResponse } from '../types'

export interface RFlexApkUploadInput {
  version: string
  notes?: string
  file: File
}

export const downloadsClient = {
  async uploadRFlexApk(data: RFlexApkUploadInput): Promise<RFlexApkUploadResponse> {
    const formData = new FormData()
    formData.append('version', data.version)

    if (data.notes?.trim()) {
      formData.append('notes', data.notes.trim())
    }

    formData.append('file', data.file)

    return apiRequestFormData<RFlexApkUploadResponse>('/api/v1/downloads/rflex', {
      method: 'POST',
      body: formData,
    })
  },
}
