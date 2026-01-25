'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Building2, KeyRound, Smartphone, AlertTriangle } from 'lucide-react'
import { AdminTopbar } from '@/components/admin/topbar'
import { MetricCard } from '@/components/admin/metric-card'
import { ActivationsChart } from '@/components/admin/activations-chart'
import { RecentActivations } from '@/components/admin/recent-activations'
import { dashboardClient } from '@/lib/clients/dashboard'
import type { DashboardStats, PlanUsageStats, RecentActivation } from '@/lib/types'

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activations, setActivations] = useState<RecentActivation[]>([])
  const [planUsage, setPlanUsage] = useState<PlanUsageStats[]>([])

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const [statsResponse, activationsResponse, plansResponse] = await Promise.all([
          dashboardClient.stats(),
          dashboardClient.recentActivations(10),
          dashboardClient.plansUsage()
        ])
        setStats(statsResponse)
        setActivations(activationsResponse)
        setPlanUsage(plansResponse)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  return (
    <div className="flex flex-col min-h-screen">
      <AdminTopbar />
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex-1 p-6"
      >
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visão geral do sistema RFlex
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <MetricCard
            title="Empresas Ativas"
            value={stats?.active_companies ?? 0}
            icon={Building2}
            description="Total de empresas ativas"
            isLoading={isLoading}
            delay={0}
          />
          <MetricCard
            title="Licencas Ativas"
            value={stats?.active_licenses ?? 0}
            icon={KeyRound}
            description="Licencas em uso"
            isLoading={isLoading}
            delay={1}
          />
          <MetricCard
            title="Dispositivos Ativos"
            value={stats?.active_devices ?? 0}
            icon={Smartphone}
            description="Coletores validos"
            isLoading={isLoading}
            delay={2}
          />
          <MetricCard
            title="Licencas Expiradas"
            value={stats?.expired_licenses ?? 0}
            icon={AlertTriangle}
            description="Licencas vencidas"
            isLoading={isLoading}
            delay={3}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ActivationsChart data={planUsage} isLoading={isLoading} />
          <RecentActivations activations={activations} isLoading={isLoading} />
        </div>
      </motion.div>
    </div>
  )
}
