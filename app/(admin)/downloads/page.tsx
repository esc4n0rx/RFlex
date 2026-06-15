'use client'

import type { ChangeEvent, FormEvent } from 'react'
import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, ExternalLink, FileArchive, Loader2, UploadCloud } from 'lucide-react'
import { toast } from 'sonner'
import { AdminTopbar } from '@/components/admin/topbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { downloadsClient } from '@/lib/clients/downloads'
import type { RFlexApkUploadResponse } from '@/lib/types'

function formatFileSize(size: number) {
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

export default function DownloadsPage() {
  const [version, setVersion] = useState('')
  const [notes, setNotes] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [lastUpload, setLastUpload] = useState<RFlexApkUploadResponse | null>(null)

  const canSubmit = useMemo(() => version.trim().length > 0 && Boolean(file) && !isUploading, [file, isUploading, version])

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null

    if (selectedFile && !selectedFile.name.toLowerCase().endsWith('.apk')) {
      toast.error('Selecione um arquivo .apk válido')
      event.target.value = ''
      setFile(null)
      return
    }

    setFile(selectedFile)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!file) {
      toast.error('Selecione o APK para upload')
      return
    }

    setIsUploading(true)
    setLastUpload(null)

    try {
      const response = await downloadsClient.uploadRFlexApk({
        version: version.trim(),
        notes,
        file,
      })
      setLastUpload(response)
      toast.success('APK enviado com sucesso')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao enviar APK'
      toast.error(message)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AdminTopbar searchPlaceholder="Buscar downloads..." />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex-1 p-6"
      >
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground">Upload do APK</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Publique uma nova versão do aplicativo RFlex para download dos clientes.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UploadCloud className="h-5 w-5 text-primary" />
                Novo APK RFlex
              </CardTitle>
              <CardDescription>
                Envie um arquivo .apk com a versão obrigatória e notas opcionais de publicação.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="version">Versão</Label>
                  <Input
                    id="version"
                    placeholder="Ex.: 1.0.2"
                    value={version}
                    onChange={(event) => setVersion(event.target.value)}
                    disabled={isUploading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notas da versão</Label>
                  <Textarea
                    id="notes"
                    placeholder="Correções e melhorias"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    disabled={isUploading}
                    rows={5}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="file">Arquivo APK</Label>
                  <Input id="file" type="file" accept=".apk,application/vnd.android.package-archive" onChange={handleFileChange} disabled={isUploading} required />
                  {file && (
                    <div className="flex items-center gap-2 rounded-lg border bg-secondary/40 px-3 py-2 text-sm text-muted-foreground">
                      <FileArchive className="h-4 w-4" />
                      <span className="font-medium text-foreground">{file.name}</span>
                      <span>({formatFileSize(file.size)})</span>
                    </div>
                  )}
                </div>

                <Button type="submit" disabled={!canSubmit} className="w-full sm:w-auto">
                  {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                  {isUploading ? 'Enviando...' : 'Enviar APK'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status do último envio</CardTitle>
              <CardDescription>Resultado retornado pela API de downloads.</CardDescription>
            </CardHeader>
            <CardContent>
              {lastUpload ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
                    <CheckCircle2 className="h-4 w-4" />
                    Upload concluído
                  </div>
                  <dl className="space-y-3 text-sm">
                    <div>
                      <dt className="text-muted-foreground">Versão</dt>
                      <dd className="font-medium">{lastUpload.version}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Arquivo</dt>
                      <dd className="font-medium break-all">{lastUpload.filename}</dd>
                    </div>
                    {lastUpload.notes && (
                      <div>
                        <dt className="text-muted-foreground">Notas</dt>
                        <dd className="whitespace-pre-wrap">{lastUpload.notes}</dd>
                      </div>
                    )}
                  </dl>
                  <Button asChild variant="outline" className="w-full">
                    <a href={lastUpload.url} target="_blank" rel="noreferrer">
                      Abrir download
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                  Nenhum upload realizado nesta sessão.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  )
}
