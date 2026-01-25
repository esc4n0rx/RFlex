import { apiRequest } from '../api-client'
import type { DeviceActivationDetail, DeviceListResponse, DeviceRevocationRequest } from '../types'

export interface DevicesListParams {
  license_id?: string
  is_active?: boolean
  page?: number
  size?: number
}

export const devicesClient = {
  async list(params: DevicesListParams = {}): Promise<DeviceListResponse> {
    return apiRequest<DeviceListResponse>('/api/v1/devices', { query: params })
  },

  async getById(activationId: string): Promise<DeviceActivationDetail> {
    return apiRequest<DeviceActivationDetail>(`/api/v1/devices/${activationId}`)
  },

  async revoke(activationId: string, data: DeviceRevocationRequest = {}): Promise<DeviceActivationDetail> {
    return apiRequest<DeviceActivationDetail>(`/api/v1/devices/${activationId}/revoke`, {
      method: 'POST',
      body: data
    })
  },

  async reactivate(activationId: string): Promise<DeviceActivationDetail> {
    return apiRequest<DeviceActivationDetail>(`/api/v1/devices/${activationId}/reactivate`, {
      method: 'POST'
    })
  },

  async logs(activationId: string, page?: number, size?: number): Promise<{ activation_id: string; total: number; page: number; size: number; items: unknown[] }> {
    return apiRequest<{ activation_id: string; total: number; page: number; size: number; items: unknown[] }>(
      `/api/v1/devices/${activationId}/logs`,
      { query: { page, size } }
    )
  }
}
