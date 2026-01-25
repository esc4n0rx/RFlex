import { apiRequest, apiRequestBlob } from '../api-client'
import type {
  License,
  LicenseCreate,
  LicenseListResponse,
  LicenseRenew,
  LicenseUpdate,
  LicenseWithDevices,
  DeviceActivationDetail,
  LicenseStatus
} from '../types'

export interface LicensesListParams {
  company_id?: string
  status?: LicenseStatus
  page?: number
  size?: number
}

export const licensesClient = {
  async list(params: LicensesListParams = {}): Promise<LicenseListResponse> {
    return apiRequest<LicenseListResponse>('/api/v1/licenses', { query: params })
  },

  async getById(licenseId: string): Promise<LicenseWithDevices> {
    return apiRequest<LicenseWithDevices>(`/api/v1/licenses/${licenseId}`)
  },

  async create(data: LicenseCreate): Promise<License> {
    return apiRequest<License>('/api/v1/licenses', {
      method: 'POST',
      body: data
    })
  },

  async update(licenseId: string, data: LicenseUpdate): Promise<License> {
    return apiRequest<License>(`/api/v1/licenses/${licenseId}`, {
      method: 'PATCH',
      body: data
    })
  },

  async renew(licenseId: string, data: LicenseRenew): Promise<License> {
    return apiRequest<License>(`/api/v1/licenses/${licenseId}/renew`, {
      method: 'POST',
      body: data
    })
  },

  async suspend(licenseId: string): Promise<License> {
    return apiRequest<License>(`/api/v1/licenses/${licenseId}/suspend`, {
      method: 'POST'
    })
  },

  async activate(licenseId: string): Promise<License> {
    return apiRequest<License>(`/api/v1/licenses/${licenseId}/activate`, {
      method: 'POST'
    })
  },

  async remove(licenseId: string): Promise<void> {
    await apiRequest<void>(`/api/v1/licenses/${licenseId}`, { method: 'DELETE' })
  },

  async listDevices(licenseId: string, isActive?: boolean): Promise<{ license_id: string; total: number; items: DeviceActivationDetail[] }> {
    return apiRequest<{ license_id: string; total: number; items: DeviceActivationDetail[] }>(
      `/api/v1/licenses/${licenseId}/devices`,
      { query: { is_active: isActive } }
    )
  },

  async getQrCode(licenseId: string, size?: number): Promise<Blob> {
    return apiRequestBlob(`/api/v1/licenses/${licenseId}/qrcode`, { query: { size } })
  },

  async getPdf(licenseId: string): Promise<Blob> {
    return apiRequestBlob(`/api/v1/licenses/${licenseId}/pdf`)
  }
}
