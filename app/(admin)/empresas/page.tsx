'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Power, MoreHorizontal } from 'lucide-react'
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
import { CompanyForm } from '@/components/admin/company-form'
import { CompanyDetail } from '@/components/admin/company-detail'
import { companiesClient } from '@/lib/clients/companies'
import type { Company, CompanyCreate, CompanyUpdate } from '@/lib/types'

export default function EmpresasPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10
  const [totalItems, setTotalItems] = useState(0)

  // Modal states
  const [formOpen, setFormOpen] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadCompanies()
  }, [searchQuery, statusFilter, currentPage])

  const loadCompanies = async () => {
    setIsLoading(true)
    try {
      const response = await companiesClient.list({
        search: searchQuery || undefined,
        is_active: statusFilter === 'all' ? undefined : statusFilter === 'active',
        page: currentPage,
        size: pageSize
      })
      setCompanies(response.items)
      setTotalItems(response.total)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao carregar empresas'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = () => {
    setSelectedCompany(null)
    setFormOpen(true)
  }

  const handleEdit = (company: Company) => {
    setSelectedCompany(company)
    setFormOpen(true)
  }

  const handleView = (company: Company) => {
    setSelectedCompany(company)
    setDetailOpen(true)
  }

  const handleDelete = (company: Company) => {
    setCompanyToDelete(company)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!companyToDelete) return

    setIsSubmitting(true)
    try {
      await companiesClient.remove(companyToDelete.id)
      toast.success('Empresa excluída com sucesso')
      setDeleteDialogOpen(false)
      setCompanyToDelete(null)
      await loadCompanies()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao excluir empresa'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleStatus = (company: Company) => {
    setIsSubmitting(true)
    companiesClient.update(company.id, { is_active: !company.is_active })
      .then(() => {
        toast.success(`Empresa ${company.is_active ? 'desativada' : 'ativada'} com sucesso`)
        return loadCompanies()
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : 'Erro ao atualizar empresa'
        toast.error(message)
      })
      .finally(() => setIsSubmitting(false))
  }

  const handleSubmit = async (data: CompanyCreate & CompanyUpdate) => {
    setIsSubmitting(true)

    try {
      const normalizedData = {
        ...data,
        cnpj: data.cnpj?.trim() ? data.cnpj : undefined,
        phone: data.phone?.trim() ? data.phone : undefined,
        address: data.address?.trim() ? data.address : undefined,
        notes: data.notes?.trim() ? data.notes : undefined,
      }

      if (selectedCompany) {
        await companiesClient.update(selectedCompany.id, normalizedData)
        toast.success('Empresa atualizada com sucesso')
      } else {
        const { is_active, ...payload } = normalizedData
        await companiesClient.create(payload)
        toast.success('Empresa criada com sucesso')
      }
      setFormOpen(false)
      await loadCompanies()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao salvar empresa'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const columns = [
    {
      key: 'trading_name',
      header: 'Nome',
      render: (company: Company) => (
        <div>
          <span className="font-medium">{company.trading_name}</span>
          <p className="text-xs text-muted-foreground">{company.legal_name}</p>
        </div>
      )
    },
    {
      key: 'cnpj',
      header: 'CNPJ',
      render: (company: Company) => (
        <span className="text-muted-foreground font-mono text-sm">
          {company.cnpj || '-'}
        </span>
      )
    },
    {
      key: 'email',
      header: 'E-mail',
      render: (company: Company) => (
        <span className="text-muted-foreground">{company.email}</span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (company: Company) => (
        <Badge
          variant={company.is_active ? 'default' : 'secondary'}
          className={company.is_active ? 'bg-[oklch(0.55_0.15_145)] text-white' : ''}
        >
          {company.is_active ? 'Ativa' : 'Inativa'}
        </Badge>
      )
    },
    {
      key: 'criadaEm',
      header: 'Criada em',
      render: (company: Company) => (
        <span className="text-muted-foreground text-sm">
          {new Date(company.created_at).toLocaleDateString('pt-BR')}
        </span>
      )
    },
    {
      key: 'actions',
      header: '',
      className: 'w-[50px]',
      render: (company: Company) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(company); }}>
              <Pencil className="w-4 h-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleToggleStatus(company); }}>
              <Power className="w-4 h-4 mr-2" />
              {company.is_active ? 'Desativar' : 'Ativar'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive focus:text-destructive"
              onClick={(e) => { e.stopPropagation(); handleDelete(company); }}
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
            <h1 className="text-2xl font-semibold text-foreground">Empresas</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gerencie as empresas cadastradas no sistema
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Empresa
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <Input
            placeholder="Buscar por nome, CNPJ ou e-mail..."
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
              <SelectItem value="inactive">Inativas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={companies}
          isLoading={isLoading}
          onRowClick={handleView}
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={setCurrentPage}
          emptyMessage="Nenhuma empresa encontrada"
        />
      </motion.div>

      {/* Modals */}
      <CompanyForm
        open={formOpen}
        onOpenChange={setFormOpen}
        company={selectedCompany}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      />

      <CompanyDetail
        company={selectedCompany}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir empresa?</AlertDialogTitle>
          <AlertDialogDescription>
              Tem certeza que deseja excluir a empresa <strong>{companyToDelete?.trading_name}</strong>?
              Esta ação não pode ser desfeita.
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
