'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { toast } from 'sonner'
import { Search, LogOut, User, ChevronRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { authClient } from '@/lib/clients/auth'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/empresas': 'Empresas',
  '/planos': 'Planos',
  '/licencas': 'Licenças',
  '/dispositivos': 'Dispositivos',
}

interface TopbarProps {
  onSearch?: (query: string) => void
  searchPlaceholder?: string
}

export function AdminTopbar({ onSearch, searchPlaceholder = 'Buscar...' }: TopbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [searchQuery, setSearchQuery] = useState('')
  const user = authClient.getStoredUser()

  const currentTitle = pageTitles[pathname] || 'RFlex'

  const handleLogout = () => {
    authClient.logout()
      .catch(() => null)
      .finally(() => {
        toast.success('Logout realizado com sucesso')
        router.push('/login')
      })
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    onSearch?.(value)
  }

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
      {/* Breadcrumb / Title */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">RFlex</span>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
        <span className="font-medium text-foreground">{currentTitle}</span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={handleSearch}
            className="pl-9 h-9 bg-secondary border-0"
          />
        </div>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-medium hidden sm:inline">{user?.full_name || 'Usuário'}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-muted-foreground text-xs">
              {user?.email}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
