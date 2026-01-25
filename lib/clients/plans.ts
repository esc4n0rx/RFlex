import { apiRequest } from '../api-client'
import type { Plan, PlanCreate, PlanListResponse, PlanUpdate } from '../types'

export interface PlansListParams {
  is_active?: boolean
  is_enterprise?: boolean
  page?: number
  size?: number
}

export const plansClient = {
  async list(params: PlansListParams = {}): Promise<PlanListResponse> {
    return apiRequest<PlanListResponse>('/api/v1/plans', { query: params })
  },

  async listActive(): Promise<Plan[]> {
    return apiRequest<Plan[]>('/api/v1/plans/active')
  },

  async getById(planId: string): Promise<Plan> {
    return apiRequest<Plan>(`/api/v1/plans/${planId}`)
  },

  async create(data: PlanCreate): Promise<Plan> {
    return apiRequest<Plan>('/api/v1/plans', {
      method: 'POST',
      body: data
    })
  },

  async update(planId: string, data: PlanUpdate): Promise<Plan> {
    return apiRequest<Plan>(`/api/v1/plans/${planId}`, {
      method: 'PATCH',
      body: data
    })
  },

  async remove(planId: string): Promise<void> {
    await apiRequest<void>(`/api/v1/plans/${planId}`, { method: 'DELETE' })
  }
}
