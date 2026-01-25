import { apiRequest } from '../api-client'
import type { PublicLicenseInfo } from '../types'

export interface DeviceActivationRequest {
  license_code: string
  device_id: string
  device_name?: string | null
  device_manufacturer?: string | null
  device_model?: string | null
  android_version?: string | null
  app_version?: string | null
  hardware_info?: Record<string, unknown> | null
}

export interface DeviceActivationResponse {
  success: boolean
  message: string
  activation_token: string
  license_expires_at: string
  company_name: string
  plan_name: string
}

export interface DeviceValidationRequest {
  activation_token: string
  device_id: string
  is_offline?: boolean
}

export interface DeviceValidationResponse {
  valid: boolean
  message: string
  license_expires_at?: string | null
  grace_period_until?: string | null
  company_name?: string | null
  plan_name?: string | null
}

export const publicClient = {
  async activateDevice(data: DeviceActivationRequest): Promise<DeviceActivationResponse> {
    return apiRequest<DeviceActivationResponse>('/api/v1/public/activate', {
      method: 'POST',
      body: data,
      auth: false
    })
  },

  async validateDevice(data: DeviceValidationRequest): Promise<DeviceValidationResponse> {
    return apiRequest<DeviceValidationResponse>('/api/v1/public/validate', {
      method: 'POST',
      body: data,
      auth: false
    })
  },

  async licenseInfo(licenseCode: string): Promise<PublicLicenseInfo> {
    return apiRequest<PublicLicenseInfo>(`/api/v1/public/license/${licenseCode}/info`, {
      auth: false
    })
  }
}
