import { apiRequest } from '../api-client'
import type { Company, CompanyCreate, CompanyListResponse, CompanyStats, CompanyUpdate } from '../types'

export interface CompaniesListParams {
  is_active?: boolean
  search?: string
  page?: number
  size?: number
}

export const companiesClient = {
  async list(params: CompaniesListParams = {}): Promise<CompanyListResponse> {
    return apiRequest<CompanyListResponse>('/api/v1/companies', { query: params })
  },

  async getById(companyId: string): Promise<Company> {
    return apiRequest<Company>(`/api/v1/companies/${companyId}`)
  },

  async create(data: CompanyCreate): Promise<Company> {
    return apiRequest<Company>('/api/v1/companies', {
      method: 'POST',
      body: data
    })
  },

  async update(companyId: string, data: CompanyUpdate): Promise<Company> {
    return apiRequest<Company>(`/api/v1/companies/${companyId}`, {
      method: 'PATCH',
      body: data
    })
  },

  async remove(companyId: string): Promise<void> {
    await apiRequest<void>(`/api/v1/companies/${companyId}`, { method: 'DELETE' })
  },

  async stats(companyId: string): Promise<CompanyStats> {
    return apiRequest<CompanyStats>(`/api/v1/companies/${companyId}/stats`)
  }
}
