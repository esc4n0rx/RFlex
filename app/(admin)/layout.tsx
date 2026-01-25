'use client'

import { Toaster } from '@/components/ui/sonner'
import { AdminSidebar } from '@/components/admin/sidebar'
import { AuthGuard } from '@/components/admin/auth-guard'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <AdminSidebar />
        <main className="ml-64">
          {children}
        </main>
        <Toaster position="top-right" richColors />
      </div>
    </AuthGuard>
  )
}
