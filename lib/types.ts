// RFlex Admin Console API Types

export type LicenseStatus = 'active' | 'expired' | 'inactive' | 'suspended'

export interface TokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}

export interface AdminUserResponse {
  id: string
  email: string
  full_name: string
  is_active: boolean
  is_superadmin: boolean
  created_at: string
  updated_at: string
}

export interface Company {
  id: string
  trading_name: string
  legal_name: string
  cnpj?: string | null
  email: string
  phone?: string | null
  address?: string | null
  notes?: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CompanyCreate {
  trading_name: string
  legal_name: string
  cnpj?: string | null
  email: string
  phone?: string | null
  address?: string | null
  notes?: string | null
}

export interface CompanyUpdate {
  trading_name?: string | null
  legal_name?: string | null
  cnpj?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
  notes?: string | null
  is_active?: boolean
}

export interface CompanyListResponse {
  items: Company[]
  total: number
  page: number
  size: number
  pages: number
}

export interface CompanyStats {
  company_id: string
  company_name: string
  total_licenses: number
  active_licenses: number
  total_devices: number
  active_devices: number
}

export interface Plan {
  id: string
  name: string
  max_devices: number
  price_per_device: number
  description?: string | null
  features?: string | null
  is_enterprise: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface PlanCreate {
  name: string
  max_devices: number
  price_per_device: number
  description?: string | null
  features?: string | null
  is_enterprise?: boolean
}

export interface PlanUpdate {
  name?: string | null
  max_devices?: number | null
  price_per_device?: number | null
  description?: string | null
  features?: string | null
  is_active?: boolean
  is_enterprise?: boolean
}

export interface PlanListResponse {
  items: Plan[]
  total: number
  page: number
  size: number
  pages: number
}

export interface License {
  id: string
  code: string
  status: LicenseStatus
  company_id: string
  plan_id: string
  expires_at: string
  created_at: string
  updated_at: string
  is_valid: boolean
  is_expired: boolean
  active_devices: number
  max_devices: number
  notes?: string | null
}

export interface LicenseCreate {
  company_id: string
  plan_id: string
  validity_days?: number
  notes?: string | null
}

export interface LicenseUpdate {
  status?: LicenseStatus
  notes?: string | null
}

export interface LicenseRenew {
  days: number
}

export interface LicenseListResponse {
  items: License[]
  total: number
  page: number
  size: number
  pages: number
}

export interface LicenseWithDevices extends License {
  devices: DeviceActivationDetail[]
}

export interface DeviceActivationDetail {
  id: string
  device_id: string
  device_name?: string | null
  device_manufacturer?: string | null
  device_model?: string | null
  android_version?: string | null
  app_version?: string | null
  activated_at: string
  last_validated_at?: string | null
  is_active: boolean
  is_revoked: boolean
  revoked_at?: string | null
  revoke_reason?: string | null
}

export interface DeviceListResponse {
  items: DeviceActivationDetail[]
  total: number
  page: number
  size: number
  pages: number
}

export interface DeviceRevocationRequest {
  reason?: string | null
}

export interface DashboardStats {
  total_companies: number
  active_companies: number
  total_licenses: number
  active_licenses: number
  expired_licenses: number
  inactive_licenses: number
  total_devices: number
  active_devices: number
  revoked_devices: number
}

export interface PlanUsageStats {
  plan_name: string
  plan_id: string
  total_licenses: number
  active_licenses: number
  total_devices: number
  active_devices: number
  occupancy_rate: number
}

export interface RecentActivation {
  id: string
  device_name?: string | null
  device_model?: string | null
  company_name: string
  plan_name: string
  activated_at: string
  is_active: boolean
}

export interface ExpiringLicense {
  id: string
  code: string
  company_name: string
  plan_name: string
  expires_at: string
  active_devices: number
  max_devices: number
}

export interface PublicLicenseInfo {
  code: string
  status: LicenseStatus
  expires_at: string
  is_valid: boolean
  plan_name: string
  company_name: string
  max_devices: number
  active_devices: number
  available_slots: number
}

export interface ApiErrorResponse {
  detail?: string
}
