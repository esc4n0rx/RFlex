import { apiRequest } from '../api-client'

export interface HealthStatus {
  message?: string
  status: string
  version?: string
  environment?: string
  database?: string
}

export const healthClient = {
  async root(): Promise<HealthStatus> {
    return apiRequest<HealthStatus>('/', { auth: false })
  },

  async health(): Promise<HealthStatus> {
    return apiRequest<HealthStatus>('/health', { auth: false })
  }
}
