'use client'

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { companiesClient } from '@/lib/clients/companies'
import { plansClient } from '@/lib/clients/plans'
import type { Company, Plan, LicenseCreate } from '@/lib/types'
import { toast } from 'sonner'

interface LicenseFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: LicenseCreate) => void
  isLoading?: boolean
  preselectedCompanyId?: string
}

export function LicenseForm({ open, onOpenChange, onSubmit, isLoading, preselectedCompanyId }: LicenseFormProps) {
  const [companies, setCompanies] = useState<Company[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [formData, setFormData] = useState({
    company_id: '',
    plan_id: '',
    validity_days: 30,
    notes: ''
  })

  useEffect(() => {
    if (!open) return

    setFormData({
      company_id: preselectedCompanyId || '',
      plan_id: '',
      validity_days: 30,
      notes: ''
    })

    Promise.all([
      companiesClient.list({ is_active: true, page: 1, size: 100 }),
      plansClient.listActive()
    ])
      .then(([companyResponse, planResponse]) => {
        setCompanies(companyResponse.items)
        setPlans(planResponse)
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : 'Erro ao carregar dados'
        toast.error(message)
      })
  }, [open, preselectedCompanyId])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.company_id || !formData.plan_id) return
    onSubmit({
      company_id: formData.company_id,
      plan_id: formData.plan_id,
      validity_days: formData.validity_days,
      notes: formData.notes || undefined
    })
  }

  const selectedPlan = plans.find(p => p.id === formData.plan_id)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Nova Licenca</DialogTitle>
          <DialogDescription>
            Crie uma nova licenca associando uma empresa a um plano.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="company">Empresa</Label>
              <Select
                value={formData.company_id}
                onValueChange={(value) => setFormData({ ...formData, company_id: value })}
              >
                <SelectTrigger id="company">
                  <SelectValue placeholder="Selecione uma empresa" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map(company => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.trading_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan">Plano</Label>
              <Select
                value={formData.plan_id}
                onValueChange={(value) => setFormData({ ...formData, plan_id: value })}
              >
                <SelectTrigger id="plan">
                  <SelectValue placeholder="Selecione um plano" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map(plan => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name} - {formatCurrency(plan.price_per_device)}/dispositivo
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="validity_days">Validade (dias)</Label>
              <Input
                id="validity_days"
                type="number"
                min={1}
                max={365}
                value={formData.validity_days}
                onChange={(e) => setFormData({ ...formData, validity_days: Number(e.target.value) || 1 })}
              />
            </div>

            {selectedPlan && (
              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <p className="text-sm font-medium">Resumo do Plano</p>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Limite de dispositivos: <span className="text-foreground">{selectedPlan.max_devices}</span></p>
                  <p>Preco por dispositivo: <span className="text-foreground">{formatCurrency(selectedPlan.price_per_device)}</span></p>
                  <p>Enterprise: <span className="text-foreground">{selectedPlan.is_enterprise ? 'Sim' : 'Nao'}</span></p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Observacoes</Label>
              <Textarea
                id="notes"
                placeholder="Opcional"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || !formData.company_id || !formData.plan_id}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Criar Licenca
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
