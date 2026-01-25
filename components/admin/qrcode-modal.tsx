'use client'

import { QrCode, Copy, Check, Download } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import type { License } from '@/lib/types'
import { licensesClient } from '@/lib/clients/licenses'

interface QRCodeModalProps {
  license: License | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function QRCodeModal({ license, open, onOpenChange }: QRCodeModalProps) {
  const [copied, setCopied] = useState(false)
  const [qrUrl, setQrUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!open || !license) return
    setIsLoading(true)
    setQrUrl(null)
    let objectUrl: string | null = null
    licensesClient
      .getQrCode(license.id, 300)
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob)
        setQrUrl(objectUrl)
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : 'Erro ao carregar QR Code'
        toast.error(message)
      })
      .finally(() => setIsLoading(false))

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [license?.id, open])

  if (!license) return null

  const handleCopy = async () => {
    await navigator.clipboard.writeText(license.code)
    setCopied(true)
    toast.success('Código copiado!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadPdf = async () => {
    try {
      const blob = await licensesClient.getPdf(license.id)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `license_${license.code}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao baixar PDF'
      toast.error(message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            QR Code da Licença
          </DialogTitle>
          <DialogDescription>
            Escaneie o QR Code ou copie o código para ativar a licença.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center py-6">
          <div className="p-4 bg-background border rounded-lg mb-4 w-full flex items-center justify-center min-h-[220px]">
            {isLoading && (
              <span className="text-sm text-muted-foreground">Carregando QR Code...</span>
            )}
            {!isLoading && qrUrl && (
              <img src={qrUrl} alt="QR Code" className="max-w-[240px]" />
            )}
          </div>

          {/* License Code */}
          <div className="w-full">
            <p className="text-xs text-muted-foreground text-center mb-2">Código da Licença</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 p-3 bg-muted rounded-lg text-xs font-mono text-center break-all">
                {license.code}
              </code>
              <Button variant="outline" size="icon" onClick={handleCopy}>
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <Button variant="outline" className="w-full mt-3" onClick={handleDownloadPdf}>
              <Download className="w-4 h-4 mr-2" />
              Baixar PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
