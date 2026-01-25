'use client'

import { motion } from 'framer-motion'
import { Smartphone, Calendar, Cpu, Activity, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import type { DeviceActivationDetail } from '@/lib/types'

interface DeviceDetailProps {
  device: DeviceActivationDetail | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const statusConfig = {
  active: { color: 'bg-[oklch(0.55_0.15_145)] text-white', icon: CheckCircle, label: 'Ativo' },
  inactive: { color: 'bg-muted text-muted-foreground', icon: XCircle, label: 'Inativo' },
  revoked: { color: 'bg-destructive text-destructive-foreground', icon: AlertTriangle, label: 'Revogado' }
}

export function DeviceDetail({ device, open, onOpenChange }: DeviceDetailProps) {
  if (!device) return null

  const lastValidated = device.last_validated_at ? new Date(device.last_validated_at) : null
  const isOnline = lastValidated ? (Date.now() - lastValidated.getTime()) / (1000 * 60 * 60) < 24 : false
  const statusKey = device.is_revoked ? 'revoked' : device.is_active ? 'active' : 'inactive'
  const config = statusConfig[statusKey]
  const StatusIcon = config.icon

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-primary" />
            </div>
            {device.device_name || device.device_model || 'Dispositivo'}
          </SheetTitle>
          <SheetDescription>
            Informações detalhadas do dispositivo
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="flex items-center gap-3">
            <Badge className={config.color}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {config.label}
            </Badge>
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className="text-xs text-muted-foreground">
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-3"
            >
              <Cpu className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Modelo / ID</p>
                <p className="text-sm font-medium">{device.device_model || '-'}</p>
                <p className="text-xs text-muted-foreground font-mono">{device.device_id}</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="flex items-center gap-3"
            >
              <Activity className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Versões</p>
                <p className="text-sm font-medium">Android {device.android_version || '-'}</p>
                <p className="text-xs text-muted-foreground">App v{device.app_version || '-'}</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3"
            >
              <Smartphone className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Fabricante</p>
                <p className="text-sm font-medium">{device.device_manufacturer || '-'}</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className="flex items-center gap-3"
            >
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Ativado em</p>
                <p className="text-sm font-medium">
                  {new Date(device.activated_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-3"
            >
              <Clock className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Último check-in</p>
                <p className="text-sm font-medium">
                  {device.last_validated_at
                    ? new Date(device.last_validated_at).toLocaleString('pt-BR')
                    : '-'}
                </p>
              </div>
            </motion.div>
          </div>

          <Separator />

          <div className="space-y-3">
            <p className="text-sm font-medium">Status de revogacao</p>
            <div className="rounded-lg border p-3 text-sm text-muted-foreground">
              {device.is_revoked
                ? `Revogado em ${device.revoked_at ? new Date(device.revoked_at).toLocaleString('pt-BR') : '-'}`
                : 'Nao revogado'}
              {device.revoke_reason ? ` - Motivo: ${device.revoke_reason}` : ''}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
