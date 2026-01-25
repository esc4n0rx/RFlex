'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Power, MoreHorizontal, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { PlanForm } from '@/components/admin/plan-form'
import { plansClient } from '@/lib/clients/plans'
import type { Plan, PlanCreate, PlanUpdate } from '@/lib/types'

export default function PlanosPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10
  const [totalItems, setTotalItems] = useState(0)

  const [formOpen, setFormOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [planToDelete, setPlanToDelete] = useState<Plan | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadPlans()
  }, [currentPage])

  const loadPlans = async () => {
    setIsLoading(true)
    try {
      const response = await plansClient.list({ page: currentPage, size: pageSize })
      setPlans(response.items)
      setTotalItems(response.total)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao carregar planos'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const handleCreate = () => {
    setSelectedPlan(null)
    setFormOpen(true)
  }

  const handleEdit = (plan: Plan) => {
    setSelectedPlan(plan)
    setFormOpen(true)
  }

  const handleDelete = (plan: Plan) => {
    setPlanToDelete(plan)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!planToDelete) return

    setIsSubmitting(true)
    try {
      await plansClient.remove(planToDelete.id)
      toast.success('Plano excluido com sucesso')
      setDeleteDialogOpen(false)
      setPlanToDelete(null)
      await loadPlans()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao excluir plano'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleActive = (plan: Plan) => {
    setIsSubmitting(true)
    plansClient.update(plan.id, { is_active: !plan.is_active })
      .then(() => {
        toast.success(`Plano ${plan.is_active ? 'desativado' : 'ativado'} com sucesso`)
        return loadPlans()
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : 'Erro ao atualizar plano'
        toast.error(message)
      })
      .finally(() => setIsSubmitting(false))
  }

  const handleSubmit = async (data: PlanCreate & PlanUpdate & { is_active?: boolean }) => {
    setIsSubmitting(true)
    try {
      const normalizedData = {
        ...data,
        description: data.description?.trim() ? data.description : undefined,
        features: data.features?.trim() ? data.features : undefined,
      }
      if (selectedPlan) {
        await plansClient.update(selectedPlan.id, normalizedData)
        toast.success('Plano atualizado com sucesso')
      } else {
        const { is_active, ...payload } = normalizedData
        await plansClient.create(payload)
        toast.success('Plano criado com sucesso')
      }
      setFormOpen(false)
      await loadPlans()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao salvar plano'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const columns = [
    {
      key: 'name',
      header: 'Nome',
      render: (plan: Plan) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-semibold text-sm">
              {plan.name.charAt(0)}
            </span>
          </div>
          <div>
            <span className="font-medium">{plan.name}</span>
            <p className="text-xs text-muted-foreground">{plan.description || '-'}</p>
          </div>
        </div>
      )
    },
    {
      key: 'max_devices',
      header: 'Dispositivos',
      render: (plan: Plan) => (
        <div className="flex items-center gap-1.5">
          <Smartphone className="w-4 h-4 text-muted-foreground" />
          <span>{plan.max_devices}</span>
        </div>
      )
    },
    {
      key: 'price_per_device',
      header: 'Preco/Dispositivo',
      render: (plan: Plan) => (
        <span className="font-medium">{formatCurrency(plan.price_per_device)}</span>
      )
    },
    {
      key: 'enterprise',
      header: 'Enterprise',
      render: (plan: Plan) => (
        <Badge variant={plan.is_enterprise ? 'default' : 'secondary'}>
          {plan.is_enterprise ? 'Sim' : 'Nao'}
        </Badge>
      )
    },
    {
      key: 'features',
      header: 'Recursos',
      render: (plan: Plan) => (
        <span className="text-xs text-muted-foreground line-clamp-2">
          {plan.features || '-'}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (plan: Plan) => (
        <Badge
          variant={plan.is_active ? 'default' : 'secondary'}
          className={plan.is_active ? 'bg-[oklch(0.55_0.15_145)] text-white' : ''}
        >
          {plan.is_active ? 'Ativo' : 'Inativo'}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: '',
      className: 'w-[50px]',
      render: (plan: Plan) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(plan); }}>
              <Pencil className="w-4 h-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleToggleActive(plan); }}>
              <Power className="w-4 h-4 mr-2" />
              {plan.is_active ? 'Desativar' : 'Ativar'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={(e) => { e.stopPropagation(); handleDelete(plan); }}
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
            <h1 className="text-2xl font-semibold text-foreground">Planos</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gerencie os planos de licenciamento disponíveis
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Plano
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={plans}
          isLoading={isLoading}
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={setCurrentPage}
          emptyMessage="Nenhum plano cadastrado"
        />
      </motion.div>

      <PlanForm
        open={formOpen}
        onOpenChange={setFormOpen}
        plan={selectedPlan}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir plano?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o plano <strong>{planToDelete?.name}</strong>?
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
