'use client'

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Plan, PlanCreate } from '@/lib/types'

interface PlanFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  plan?: Plan | null
  onSubmit: (data: PlanCreate & { is_active?: boolean }) => void
  isLoading?: boolean
}

export function PlanForm({ open, onOpenChange, plan, onSubmit, isLoading }: PlanFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    max_devices: 5,
    price_per_device: 0,
    description: '',
    features: '',
    is_enterprise: false,
    is_active: true
  })

  useEffect(() => {
    if (plan) {
      setFormData({
        name: plan.name,
        max_devices: plan.max_devices,
        price_per_device: plan.price_per_device,
        description: plan.description || '',
        features: plan.features || '',
        is_enterprise: plan.is_enterprise,
        is_active: plan.is_active
      })
    } else {
      setFormData({
        name: '',
        max_devices: 5,
        price_per_device: 0,
        description: '',
        features: '',
        is_enterprise: false,
        is_active: true
      })
    }
  }, [plan, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{plan ? 'Editar Plano' : 'Novo Plano'}</DialogTitle>
          <DialogDescription>
            {plan ? 'Atualize as informações do plano.' : 'Configure um novo plano de licenciamento.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Plano</Label>
                <Input
                  id="name"
                  placeholder="Ex: Pro"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_devices">Limite de Dispositivos</Label>
                <Input
                  id="max_devices"
                  type="number"
                  min={-1}
                  value={formData.max_devices}
                  onChange={(e) => setFormData({ ...formData, max_devices: Number(e.target.value) || 0 })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descricao (opcional)</Label>
              <Textarea
                id="description"
                placeholder="Descreva as características do plano..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price_per_device">Preco por Dispositivo (R$)</Label>
                <Input
                  id="price_per_device"
                  type="number"
                  min={0}
                  step="0.01"
                  value={formData.price_per_device}
                  onChange={(e) => setFormData({ ...formData, price_per_device: Number(e.target.value) || 0 })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="features">Features (JSON opcional)</Label>
                <Input
                  id="features"
                  placeholder='{"support":"24/7"}'
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Plano Enterprise</p>
                <p className="text-xs text-muted-foreground">Marca o plano como enterprise</p>
              </div>
              <Switch
                checked={formData.is_enterprise}
                onCheckedChange={(checked) => setFormData({ ...formData, is_enterprise: checked })}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Plano Ativo</p>
                <p className="text-xs text-muted-foreground">
                  Controla se o plano pode ser usado para novas licencas
                </p>
              </div>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {plan ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
