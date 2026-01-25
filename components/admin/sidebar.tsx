'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  LayoutDashboard, 
  Building2, 
  CreditCard, 
  KeyRound, 
  Smartphone,
  Radio
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Empresas', href: '/empresas', icon: Building2 },
  { name: 'Planos', href: '/planos', icon: CreditCard },
  { name: 'Licenças', href: '/licencas', icon: KeyRound },
  { name: 'Dispositivos', href: '/dispositivos', icon: Smartphone },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-sidebar flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center gap-2 px-6 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Radio className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="text-lg font-semibold text-sidebar-foreground">RFlex</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group relative flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors',
                isActive
                  ? 'text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-0 bg-sidebar-primary rounded-lg"
                  initial={false}
                  transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 35
                  }}
                />
              )}
              <item.icon className={cn(
                'relative z-10 w-5 h-5 transition-colors',
                isActive ? 'text-sidebar-primary-foreground' : 'text-sidebar-foreground/70 group-hover:text-sidebar-foreground'
              )} />
              <span className="relative z-10">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-border">
        <p className="text-xs text-muted-foreground">RFlex Admin Console</p>
        <p className="text-xs text-muted-foreground">v1.0.0</p>
      </div>
    </aside>
  )
}
