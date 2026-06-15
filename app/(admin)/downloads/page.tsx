'use client'

import type { ChangeEvent, FormEvent } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, ExternalLink, FileArchive, Loader2, RefreshCw, Trash2, UploadCloud } from 'lucide-react'
import { toast } from 'sonner'
import { AdminTopbar } from '@/components/admin/topbar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { downloadsClient } from '@/lib/clients/downloads'
import type { RFlexApkItem, RFlexApkUploadProgress, RFlexApkUploadResponse } from '@/lib/types'

function formatFileSize(size?: number | null) {
  if (!size) return '—'
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(date))
}

export default function DownloadsPage() {
  const [version, setVersion] = useState('')
  const [notes, setNotes] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [lastUpload, setLastUpload] = useState<RFlexApkUploadResponse | null>(null)
  const [apks, setApks] = useState<RFlexApkItem[]>([])
  const [isLoadingList, setIsLoadingList] = useState(true)
  const [uploadId, setUploadId] = useState<string | null>(null)
  const [browserProgress, setBrowserProgress] = useState(0)
  const [serverProgress, setServerProgress] = useState<RFlexApkUploadProgress | null>(null)
  const pollingRef = useRef<number | null>(null)

  const canSubmit = useMemo(() => version.trim().length > 0 && Boolean(file) && !isUploading, [file, isUploading, version])
  const serverPercent = serverProgress?.percent ?? 0

  const loadApks = useCallback(async () => {
    setIsLoadingList(true)
    try {
      const response = await downloadsClient.listRFlexApks()
      setApks(response.items)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao listar APKs')
    } finally {
      setIsLoadingList(false)
    }
  }, [])

  useEffect(() => {
    loadApks()
    return () => {
      if (pollingRef.current) window.clearInterval(pollingRef.current)
    }
  }, [loadApks])

  const stopPolling = () => {
    if (pollingRef.current) {
      window.clearInterval(pollingRef.current)
      pollingRef.current = null
    }
  }

  const startPolling = (id: string) => {
    stopPolling()
    const poll = async () => {
      try {
        const progress = await downloadsClient.getRFlexUploadProgress(id)
        setServerProgress(progress)
        if (progress.status === 'completed' || progress.status === 'failed') {
          stopPolling()
          if (progress.status === 'completed') loadApks()
        }
      } catch (error) {
        stopPolling()
        toast.error(error instanceof Error ? error.message : 'Erro ao consultar progresso')
      }
    }
    poll()
    pollingRef.current = window.setInterval(poll, 1000)
  }

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
    setBrowserProgress(0)
    setServerProgress(null)

    try {
      const { upload_id } = await downloadsClient.createRFlexUpload()
      setUploadId(upload_id)
      startPolling(upload_id)

      const response = await downloadsClient.uploadRFlexApk({
        version: version.trim(),
        notes,
        file,
        uploadId: upload_id,
        onUploadProgress: (percent) => setBrowserProgress(percent),
      })
      setLastUpload(response)
      toast.success('APK enviado com sucesso')
      await loadApks()
    } catch (error) {
      stopPolling()
      toast.error(error instanceof Error ? error.message : 'Erro ao enviar APK')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (apkVersion: string) => {
    if (!window.confirm(`Apagar a versão ${apkVersion}?`)) return
    try {
      await downloadsClient.deleteRFlexApk(apkVersion)
      toast.success('Versão apagada')
      await loadApks()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao apagar APK')
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AdminTopbar searchPlaceholder="Buscar downloads..." />

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground">Upload do APK</h1>
          <p className="mt-1 text-sm text-muted-foreground">Publique, acompanhe e gerencie versões do aplicativo RFlex.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><UploadCloud className="h-5 w-5 text-primary" />Novo APK RFlex</CardTitle>
              <CardDescription>O frontend cria um upload_id, mostra progresso do navegador e consulta o processamento do backend por polling.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-2"><Label htmlFor="version">Versão</Label><Input id="version" placeholder="Ex.: 1.0.2" value={version} onChange={(event) => setVersion(event.target.value)} disabled={isUploading} required /></div>
                <div className="space-y-2"><Label htmlFor="notes">Notas da versão</Label><Textarea id="notes" placeholder="Correções e melhorias" value={notes} onChange={(event) => setNotes(event.target.value)} disabled={isUploading} rows={5} /></div>
                <div className="space-y-2">
                  <Label htmlFor="file">Arquivo APK</Label>
                  <Input id="file" type="file" accept=".apk,application/vnd.android.package-archive" onChange={handleFileChange} disabled={isUploading} required />
                  {file && <div className="flex items-center gap-2 rounded-lg border bg-secondary/40 px-3 py-2 text-sm text-muted-foreground"><FileArchive className="h-4 w-4" /><span className="font-medium text-foreground">{file.name}</span><span>({formatFileSize(file.size)})</span></div>}
                </div>

                {(isUploading || serverProgress || uploadId) && (
                  <div className="space-y-3 rounded-lg border bg-secondary/30 p-4 text-sm">
                    <div><div className="mb-1 flex justify-between"><span>Envio pelo navegador</span><span>{browserProgress}%</span></div><Progress value={browserProgress} /></div>
                    <div><div className="mb-1 flex justify-between"><span>Processamento no backend</span><span>{serverPercent}%</span></div><Progress value={serverPercent} /></div>
                    <div className="grid gap-1 text-muted-foreground sm:grid-cols-2"><span>ID: {uploadId ?? 'criando...'}</span><span>Status: {serverProgress?.status ?? 'pending'}</span><span>Recebido: {formatFileSize(serverProgress?.bytes_received)}</span><span>Total: {formatFileSize(serverProgress?.total_bytes)}</span></div>
                    {serverProgress?.error && <p className="text-destructive">{serverProgress.error}</p>}
                  </div>
                )}

                <Button type="submit" disabled={!canSubmit} className="w-full sm:w-auto">{isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}{isUploading ? 'Enviando...' : 'Enviar APK'}</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Status do último envio</CardTitle><CardDescription>Resultado retornado pela API de downloads.</CardDescription></CardHeader>
            <CardContent>{lastUpload ? <div className="space-y-4"><div className="flex items-center gap-2 text-sm font-medium text-emerald-600"><CheckCircle2 className="h-4 w-4" />Upload concluído</div><dl className="space-y-3 text-sm"><div><dt className="text-muted-foreground">Versão</dt><dd className="font-medium">{lastUpload.version}</dd></div><div><dt className="text-muted-foreground">Arquivo</dt><dd className="font-medium break-all">{lastUpload.filename}</dd></div><div><dt className="text-muted-foreground">Tamanho</dt><dd>{formatFileSize(lastUpload.size_bytes)}</dd></div>{lastUpload.notes && <div><dt className="text-muted-foreground">Notas</dt><dd className="whitespace-pre-wrap">{lastUpload.notes}</dd></div>}</dl><Button asChild variant="outline" className="w-full"><a href={lastUpload.url} target="_blank" rel="noreferrer">Abrir download<ExternalLink className="h-4 w-4" /></a></Button></div> : <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">Nenhum upload realizado nesta sessão.</div>}</CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader className="flex flex-row items-center justify-between"><div><CardTitle>APKs enviados</CardTitle><CardDescription>Versões armazenadas na API, ordenadas da mais recente para a mais antiga.</CardDescription></div><Button variant="outline" size="sm" onClick={loadApks} disabled={isLoadingList}><RefreshCw className={isLoadingList ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />Atualizar</Button></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Versão</TableHead><TableHead>Arquivo</TableHead><TableHead>Tamanho</TableHead><TableHead>Enviado em</TableHead><TableHead>Notas</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
              <TableBody>
                {apks.map((apk) => <TableRow key={apk.version}><TableCell className="font-medium">{apk.version} {apk.is_latest && <Badge className="ml-2">Latest</Badge>}</TableCell><TableCell>{apk.filename}</TableCell><TableCell>{formatFileSize(apk.size_bytes)}</TableCell><TableCell>{formatDate(apk.uploaded_at)}</TableCell><TableCell className="max-w-xs truncate">{apk.notes || '—'}</TableCell><TableCell className="space-x-2 text-right"><Button asChild variant="outline" size="sm"><a href={apk.url} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /></a></Button><Button variant="destructive" size="sm" onClick={() => handleDelete(apk.version)}><Trash2 className="h-4 w-4" /></Button></TableCell></TableRow>)}
                {!apks.length && <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">{isLoadingList ? 'Carregando versões...' : 'Nenhum APK enviado.'}</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
