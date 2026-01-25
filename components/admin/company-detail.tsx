'use client'

import { motion } from 'framer-motion'
import { Building2, Mail, FileText, Calendar, KeyRound, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import type { Company, CompanyStats } from '@/lib/types'
import { companiesClient } from '@/lib/clients/companies'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface CompanyDetailProps {
  company: Company | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CompanyDetail({ company, open, onOpenChange }: CompanyDetailProps) {
  const [stats, setStats] = useState<CompanyStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!open || !company) return
    setIsLoading(true)
    companiesClient.stats(company.id)
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setIsLoading(false))
  }, [company?.id, open])

  if (!company) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            {company.trading_name}
          </SheetTitle>
          <SheetDescription>
            Detalhes e informações da empresa
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Status */}
          <div>
            <Badge
              variant={company.is_active ? 'default' : 'secondary'}
              className={company.is_active ? 'bg-[oklch(0.55_0.15_145)] text-white' : ''}
            >
              {company.is_active ? 'Ativa' : 'Inativa'}
            </Badge>
          </div>

          {/* Info */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-3"
            >
              <FileText className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">CNPJ</p>
                <p className="text-sm font-medium">{company.cnpj || '-'}</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="flex items-center gap-3"
            >
              <Mail className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">E-mail de Contato</p>
                <p className="text-sm font-medium">{company.email}</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3"
            >
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Criada em</p>
                <p className="text-sm font-medium">
                  {new Date(company.created_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </motion.div>
          </div>

          <Separator />

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="p-4 rounded-lg bg-muted/50"
            >
              <div className="flex items-center gap-2 mb-1">
                <KeyRound className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">Licenças</span>
              </div>
              <p className="text-2xl font-semibold">{isLoading ? '-' : (stats?.total_licenses ?? 0)}</p>
              <p className="text-xs text-muted-foreground">{stats?.active_licenses ?? 0} ativas</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-4 rounded-lg bg-muted/50"
            >
              <div className="flex items-center gap-2 mb-1">
                <Smartphone className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">Dispositivos</span>
              </div>
              <p className="text-2xl font-semibold">{isLoading ? '-' : (stats?.total_devices ?? 0)}</p>
              <p className="text-xs text-muted-foreground">{stats?.active_devices ?? 0} ativos</p>
            </motion.div>
          </div>

          <Separator />

          {/* Quick Actions */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Ações rápidas</p>
            <div className="flex flex-col gap-2">
              <Button variant="outline" className="justify-start bg-transparent" asChild>
                <Link href={`/licencas?empresa=${company.id}`}>
                  <KeyRound className="w-4 h-4 mr-2" />
                  Ver licenças desta empresa
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
