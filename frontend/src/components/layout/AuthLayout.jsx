import { Outlet } from 'react-router-dom'
import { CalendarCheck } from 'lucide-react'
import { Toaster } from '@/components/ui/toaster'

export function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mb-8 flex items-center gap-2">
        <CalendarCheck className="h-7 w-7 text-primary" />
        <span className="font-display text-2xl font-bold tracking-tight">Reservo</span>
      </div>
      <div className="w-full max-w-sm">
        <Outlet />
      </div>
      <Toaster />
    </div>
  )
}
