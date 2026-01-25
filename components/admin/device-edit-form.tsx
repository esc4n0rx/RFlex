'use client'

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { DeviceActivationDetail } from '@/lib/types'

interface DeviceEditFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  device?: DeviceActivationDetail | null
  onSubmit: (reason: string) => void
  isLoading?: boolean
}

export function DeviceEditForm({ open, onOpenChange, device, onSubmit, isLoading }: DeviceEditFormProps) {
  const [reason, setReason] = useState('')

  useEffect(() => {
    if (device) {
      setReason('')
    } else {
      setReason('')
    }
  }, [device, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(reason)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Revogar dispositivo</DialogTitle>
          <DialogDescription>
            Informe o motivo para revogar o dispositivo selecionado.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Motivo (opcional)</Label>
              <Textarea
                id="reason"
                placeholder="Ex: Dispositivo perdido"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
            </div>
            {device && (
              <div className="p-3 bg-muted/50 rounded-lg space-y-1 text-sm">
                <p><span className="text-muted-foreground">Dispositivo:</span> {device.device_name || device.device_model || 'Sem nome'}</p>
                <p><span className="text-muted-foreground">ID:</span> <code className="text-xs">{device.device_id}</code></p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Revogar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
