'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { ShieldOff, ShieldCheck, MoreHorizontal, Wifi, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { AdminTopbar } from '@/components/admin/topbar'
import { DataTable } from '@/components/admin/data-table'
import { DeviceDetail } from '@/components/admin/device-detail'
import { DeviceEditForm } from '@/components/admin/device-edit-form'
import { devicesClient } from '@/lib/clients/devices'
import type { DeviceActivationDetail } from '@/lib/types'

type DeviceStatusFilter = 'all' | 'active' | 'inactive' | 'revoked'

export default function DispositivosPage() {
  const [devices, setDevices] = useState<DeviceActivationDetail[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<DeviceStatusFilter>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10
  const [totalItems, setTotalItems] = useState(0)

  const [selectedDevice, setSelectedDevice] = useState<DeviceActivationDetail | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [revokeOpen, setRevokeOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deviceToDelete, setDeviceToDelete] = useState<DeviceActivationDetail | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadData()
  }, [statusFilter, currentPage])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const isActive = statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined
      const response = await devicesClient.list({
        is_active: isActive,
        page: currentPage,
        size: pageSize
      })
      setDevices(response.items)
      setTotalItems(response.total)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao carregar dispositivos'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredDevices = useMemo(() => {
    let filtered = devices
    if (statusFilter === 'revoked') {
      filtered = filtered.filter(device => device.is_revoked)
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(device =>
        (device.device_name || '').toLowerCase().includes(query) ||
        (device.device_model || '').toLowerCase().includes(query) ||
        device.device_id.toLowerCase().includes(query)
      )
    }
    return filtered
  }, [devices, searchQuery, statusFilter])

  const handleView = (device: DeviceActivationDetail) => {
    setSelectedDevice(device)
    setDetailOpen(true)
  }

  const handleRevoke = (device: DeviceActivationDetail) => {
    setSelectedDevice(device)
    setRevokeOpen(true)
  }

  const handleReactivate = (device: DeviceActivationDetail) => {
    setIsSubmitting(true)
    devicesClient.reactivate(device.id)
      .then(() => {
        toast.success('Dispositivo reativado')
        return loadData()
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : 'Erro ao reativar dispositivo'
        toast.error(message)
      })
      .finally(() => setIsSubmitting(false))
  }

  const handleDelete = (device: DeviceActivationDetail) => {
    setDeviceToDelete(device)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!deviceToDelete) return
    setIsSubmitting(true)
    try {
      await devicesClient.revoke(deviceToDelete.id, { reason: 'Removido pelo admin' })
      toast.success('Dispositivo revogado com sucesso')
      setDeleteDialogOpen(false)
      setDeviceToDelete(null)
      await loadData()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao revogar dispositivo'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRevokeSubmit = async (reason: string) => {
    if (!selectedDevice) return

    setIsSubmitting(true)
    try {
      await devicesClient.revoke(selectedDevice.id, { reason: reason || undefined })
      toast.success('Dispositivo revogado')
      setRevokeOpen(false)
      await loadData()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao revogar dispositivo'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isOnline = (device: DeviceActivationDetail) => {
    if (!device.last_validated_at) return false
    const lastValidated = new Date(device.last_validated_at)
    return (Date.now() - lastValidated.getTime()) / (1000 * 60 * 60) < 24
  }

  const columns = [
    {
      key: 'device',
      header: 'Dispositivo',
      render: (device: DeviceActivationDetail) => {
        const online = isOnline(device)
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
              {online ? (
                <Wifi className="w-5 h-5 text-green-600" />
              ) : (
                <WifiOff className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="font-medium">{device.device_name || 'Dispositivo'}</p>
              <p className="text-xs text-muted-foreground">{device.device_model || '-'}</p>
            </div>
          </div>
        )
      }
    },
    {
      key: 'device_id',
      header: 'Device ID',
      render: (device: DeviceActivationDetail) => (
        <code className="text-xs font-mono bg-muted px-2 py-1 rounded">
          {device.device_id}
        </code>
      )
    },
    {
      key: 'versions',
      header: 'Versoes',
      render: (device: DeviceActivationDetail) => (
        <div className="text-sm text-muted-foreground">
          <p>Android {device.android_version || '-'}</p>
          <p>App {device.app_version || '-'}</p>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (device: DeviceActivationDetail) => {
        const label = device.is_revoked ? 'Revogado' : device.is_active ? 'Ativo' : 'Inativo'
        const badgeClass = device.is_revoked
          ? 'bg-destructive text-destructive-foreground'
          : device.is_active
            ? 'bg-[oklch(0.55_0.15_145)] text-white'
            : 'bg-muted text-muted-foreground'
        return (
          <Badge className={badgeClass}>
            {label}
          </Badge>
        )
      }
    },
    {
      key: 'actions',
      header: '',
      className: 'w-[50px]',
      render: (device: DeviceActivationDetail) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleView(device); }}>
              Detalhes
            </DropdownMenuItem>
            {!device.is_revoked && (
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleRevoke(device); }}>
                <ShieldOff className="w-4 h-4 mr-2" />
                Revogar
              </DropdownMenuItem>
            )}
            {device.is_revoked && (
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleReactivate(device); }}>
                <ShieldCheck className="w-4 h-4 mr-2" />
                Reativar
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={(e) => { e.stopPropagation(); handleDelete(device); }}
            >
              Remover
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ]

  return (
    <div className="flex flex-col min-h-screen">
      <AdminTopbar />
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex-1 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Dispositivos</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Visualize os dispositivos ativados nas licencas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <Input
            placeholder="Buscar por nome, modelo ou device ID..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            className="max-w-sm"
          />
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v as DeviceStatusFilter)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Ativos</SelectItem>
              <SelectItem value="inactive">Inativos</SelectItem>
              <SelectItem value="revoked">Revogados</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DataTable
          columns={columns}
          data={filteredDevices}
          isLoading={isLoading}
          onRowClick={handleView}
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={setCurrentPage}
          emptyMessage="Nenhum dispositivo encontrado"
        />
      </motion.div>

      <DeviceDetail
        device={selectedDevice}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />

      <DeviceEditForm
        open={revokeOpen}
        onOpenChange={setRevokeOpen}
        device={selectedDevice}
        onSubmit={handleRevokeSubmit}
        isLoading={isSubmitting}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover dispositivo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acao revoga a ativacao do dispositivo selecionado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Revogar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
