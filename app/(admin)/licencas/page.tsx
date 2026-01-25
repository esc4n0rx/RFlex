'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Plus, RefreshCw, Pause, Play, QrCode, MoreHorizontal, Trash2 } from 'lucide-react'
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
import { LicenseForm } from '@/components/admin/license-form'
import { QRCodeModal } from '@/components/admin/qrcode-modal'
import { licensesClient } from '@/lib/clients/licenses'
import { companiesClient } from '@/lib/clients/companies'
import { plansClient } from '@/lib/clients/plans'
import type { License, LicenseStatus, Company, Plan } from '@/lib/types'

const statusLabels: Record<LicenseStatus, string> = {
  active: 'Ativa',
  expired: 'Expirada',
  inactive: 'Inativa',
  suspended: 'Suspensa'
}

const statusColors: Record<LicenseStatus, string> = {
  active: 'bg-[oklch(0.55_0.15_145)] text-white',
  expired: 'bg-[oklch(0.70_0.15_75)] text-[oklch(0.20_0_0)]',
  inactive: 'bg-muted text-muted-foreground',
  suspended: 'bg-destructive text-destructive-foreground'
}

export default function LicencasPage() {
  const searchParams = useSearchParams()
  const companyFilter = searchParams.get('empresa')

  const [licenses, setLicenses] = useState<License[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<LicenseStatus | 'all'>('all')
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(companyFilter || 'all')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10
  const [totalItems, setTotalItems] = useState(0)

  const [formOpen, setFormOpen] = useState(false)
  const [qrCodeOpen, setQRCodeOpen] = useState(false)
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [licenseToDelete, setLicenseToDelete] = useState<License | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setSelectedCompanyId(companyFilter || 'all')
  }, [companyFilter])

  useEffect(() => {
    loadData()
  }, [statusFilter, selectedCompanyId, currentPage])

  useEffect(() => {
    Promise.all([
      companiesClient.list({ page: 1, size: 100 }),
      plansClient.list({ page: 1, size: 100 })
    ])
      .then(([companiesResponse, plansResponse]) => {
        setCompanies(companiesResponse.items)
        setPlans(plansResponse.items)
      })
      .catch(() => null)
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const response = await licensesClient.list({
        status: statusFilter === 'all' ? undefined : statusFilter,
        company_id: selectedCompanyId === 'all' ? undefined : selectedCompanyId,
        page: currentPage,
        size: pageSize
      })
      setLicenses(response.items)
      setTotalItems(response.total)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao carregar licencas'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredLicenses = useMemo(() => {
    if (!searchQuery) return licenses
    const lowerQuery = searchQuery.toLowerCase()
    return licenses.filter((license) => license.code.toLowerCase().includes(lowerQuery))
  }, [licenses, searchQuery])

  const getCompanyName = (companyId: string) => {
    return companies.find(c => c.id === companyId)?.trading_name || 'Empresa nao encontrada'
  }

  const getPlanName = (planId: string) => {
    return plans.find(p => p.id === planId)?.name || 'Plano nao encontrado'
  }

  const handleCreate = () => {
    setFormOpen(true)
  }

  const handleShowQR = (license: License) => {
    setSelectedLicense(license)
    setQRCodeOpen(true)
  }

  const handleRenew = (license: License) => {
    setIsSubmitting(true)
    licensesClient.renew(license.id, { days: 30 })
      .then(() => {
        toast.success('Licenca renovada por mais 30 dias')
        return loadData()
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : 'Erro ao renovar licenca'
        toast.error(message)
      })
      .finally(() => setIsSubmitting(false))
  }

  const handleSuspend = (license: License) => {
    setIsSubmitting(true)
    licensesClient.suspend(license.id)
      .then(() => {
        toast.success('Licenca suspensa')
        return loadData()
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : 'Erro ao suspender licenca'
        toast.error(message)
      })
      .finally(() => setIsSubmitting(false))
  }

  const handleReactivate = (license: License) => {
    setIsSubmitting(true)
    licensesClient.activate(license.id)
      .then(() => {
        toast.success('Licenca ativada')
        return loadData()
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : 'Erro ao ativar licenca'
        toast.error(message)
      })
      .finally(() => setIsSubmitting(false))
  }

  const handleDelete = (license: License) => {
    setLicenseToDelete(license)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!licenseToDelete) return
    setIsSubmitting(true)
    try {
      await licensesClient.remove(licenseToDelete.id)
      toast.success('Licenca excluida com sucesso')
      setDeleteDialogOpen(false)
      setLicenseToDelete(null)
      await loadData()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao excluir licenca'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async (data: { company_id: string; plan_id: string; validity_days?: number; notes?: string }) => {
    setIsSubmitting(true)
    try {
      await licensesClient.create({
        ...data,
        notes: data.notes?.trim() ? data.notes : undefined
      })
      toast.success('Licenca criada com sucesso')
      setFormOpen(false)
      await loadData()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar licenca'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const columns = [
    {
      key: 'code',
      header: 'Codigo',
      render: (license: License) => (
        <code className="text-xs font-mono bg-muted px-2 py-1 rounded">
          {license.code.substring(0, 12)}...
        </code>
      )
    },
    {
      key: 'company',
      header: 'Empresa',
      render: (license: License) => (
        <span className="font-medium">{getCompanyName(license.company_id)}</span>
      )
    },
    {
      key: 'plan',
      header: 'Plano',
      render: (license: License) => (
        <Badge variant="outline">{getPlanName(license.plan_id)}</Badge>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (license: License) => (
        <Badge className={statusColors[license.status]}>
          {statusLabels[license.status]}
        </Badge>
      )
    },
    {
      key: 'expires',
      header: 'Expira em',
      render: (license: License) => (
        <span className="text-muted-foreground text-sm">
          {new Date(license.expires_at).toLocaleDateString('pt-BR')}
        </span>
      )
    },
    {
      key: 'devices',
      header: 'Dispositivos',
      render: (license: License) => (
        <span className="text-sm text-muted-foreground">
          {license.active_devices}/{license.max_devices}
        </span>
      )
    },
    {
      key: 'actions',
      header: '',
      className: 'w-[50px]',
      render: (license: License) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleShowQR(license); }}>
              <QrCode className="w-4 h-4 mr-2" />
              QR Code
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleRenew(license); }}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Renovar 30 dias
            </DropdownMenuItem>
            {license.status === 'active' && (
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleSuspend(license); }}>
                <Pause className="w-4 h-4 mr-2" />
                Suspender
              </DropdownMenuItem>
            )}
            {license.status !== 'active' && (
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleReactivate(license); }}>
                <Play className="w-4 h-4 mr-2" />
                Ativar
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive focus:text-destructive"
              onClick={(e) => { e.stopPropagation(); handleDelete(license); }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir
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
            <h1 className="text-2xl font-semibold text-foreground">Licencas</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gerencie as licencas emitidas para os clientes
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Licenca
          </Button>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <Input
            placeholder="Buscar por codigo..."
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
              setStatusFilter(v as typeof statusFilter)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Ativas</SelectItem>
              <SelectItem value="expired">Expiradas</SelectItem>
              <SelectItem value="inactive">Inativas</SelectItem>
              <SelectItem value="suspended">Suspensas</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedCompanyId} onValueChange={(value) => {
            setSelectedCompanyId(value)
            setCurrentPage(1)
          }}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Empresa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as empresas</SelectItem>
              {companies.map(company => (
                <SelectItem key={company.id} value={company.id}>
                  {company.trading_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DataTable
          columns={columns}
          data={filteredLicenses}
          isLoading={isLoading}
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={setCurrentPage}
          emptyMessage="Nenhuma licenca encontrada"
        />
      </motion.div>

      <LicenseForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
        preselectedCompanyId={selectedCompanyId !== 'all' ? selectedCompanyId : undefined}
      />

      <QRCodeModal
        license={selectedLicense}
        open={qrCodeOpen}
        onOpenChange={setQRCodeOpen}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir licenca?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a licenca <strong>{licenseToDelete?.code}</strong>?
              Esta acao nao pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
