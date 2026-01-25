'use client'

import { motion } from 'framer-motion'
import { ShieldCheck, ShieldOff } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import type { RecentActivation } from '@/lib/types'

interface RecentActivationsProps {
  activations: RecentActivation[]
  isLoading?: boolean
}

export function RecentActivations({ activations, isLoading = false }: RecentActivationsProps) {
  if (isLoading) {
    return (
      <Card className="border border-border">
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-5 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
    >
      <Card className="border border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Ativações recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {activations.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Nenhuma ativação recente
              </p>
            ) : (
              activations.map((activation, index) => {
                const Icon = activation.is_active ? ShieldCheck : ShieldOff
                const date = new Date(activation.activated_at)
                
                return (
                  <motion.div
                    key={activation.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="flex items-center justify-between py-2.5 border-b border-border last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {activation.device_name || activation.device_model || 'Dispositivo'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activation.company_name} · {activation.plan_name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">
                        {date.toLocaleDateString('pt-BR')} {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <Badge className={activation.is_active ? 'bg-[oklch(0.55_0.15_145)] text-white' : 'bg-destructive text-destructive-foreground'}>
                        {activation.is_active ? 'Ativo' : 'Revogado'}
                      </Badge>
                    </div>
                  </motion.div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
