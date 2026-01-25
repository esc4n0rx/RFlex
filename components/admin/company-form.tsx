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
import type { Company, CompanyCreate } from '@/lib/types'

interface CompanyFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  company?: Company | null
  onSubmit: (data: CompanyCreate & { is_active?: boolean }) => void
  isLoading?: boolean
}

export function CompanyForm({ open, onOpenChange, company, onSubmit, isLoading }: CompanyFormProps) {
  const [formData, setFormData] = useState({
    trading_name: '',
    legal_name: '',
    cnpj: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
    is_active: true
  })

  useEffect(() => {
    if (company) {
      setFormData({
        trading_name: company.trading_name,
        legal_name: company.legal_name,
        cnpj: company.cnpj || '',
        email: company.email,
        phone: company.phone || '',
        address: company.address || '',
        notes: company.notes || '',
        is_active: company.is_active
      })
    } else {
      setFormData({
        trading_name: '',
        legal_name: '',
        cnpj: '',
        email: '',
        phone: '',
        address: '',
        notes: '',
        is_active: true
      })
    }
  }, [company, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{company ? 'Editar Empresa' : 'Nova Empresa'}</DialogTitle>
          <DialogDescription>
            {company ? 'Atualize as informações da empresa.' : 'Preencha os dados para criar uma nova empresa.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="trading_name">Nome Fantasia</Label>
              <Input
                id="trading_name"
                placeholder="Ex: Tech Solutions Ltda"
                value={formData.trading_name}
                onChange={(e) => setFormData({ ...formData, trading_name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="legal_name">Razao Social</Label>
              <Input
                id="legal_name"
                placeholder="Ex: Tech Solutions LTDA"
                value={formData.legal_name}
                onChange={(e) => setFormData({ ...formData, legal_name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ (opcional)</Label>
              <Input
                id="cnpj"
                placeholder="00.000.000/0001-00"
                value={formData.cnpj}
                onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail de Contato</Label>
              <Input
                id="email"
                type="email"
                placeholder="contato@empresa.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone (opcional)</Label>
              <Input
                id="phone"
                placeholder="(11) 99999-9999"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Endereco (opcional)</Label>
              <Textarea
                id="address"
                placeholder="Rua Example, 123"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Observacoes (opcional)</Label>
              <Textarea
                id="notes"
                placeholder="Observacoes internas"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label htmlFor="is_active">Empresa ativa</Label>
                <p className="text-xs text-muted-foreground">Define o status de acesso</p>
              </div>
              <Switch
                id="is_active"
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
              {company ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
