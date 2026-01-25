import { apiRequest } from '../api-client'
import type { DashboardStats, ExpiringLicense, PlanUsageStats, RecentActivation } from '../types'

export const dashboardClient = {
  async stats(): Promise<DashboardStats> {
    return apiRequest<DashboardStats>('/api/v1/dashboard/stats')
  },

  async plansUsage(): Promise<PlanUsageStats[]> {
    return apiRequest<PlanUsageStats[]>('/api/v1/dashboard/plans-usage')
  },

  async recentActivations(limit?: number): Promise<RecentActivation[]> {
    return apiRequest<RecentActivation[]>('/api/v1/dashboard/recent-activations', {
      query: { limit }
    })
  },

  async expiringLicenses(days?: number): Promise<ExpiringLicense[]> {
    return apiRequest<ExpiringLicense[]>('/api/v1/dashboard/expiring-licenses', {
      query: { days }
    })
  }
}
