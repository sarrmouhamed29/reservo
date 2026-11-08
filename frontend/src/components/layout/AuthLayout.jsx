import { Outlet } from 'react-router-dom'
import { CalendarCheck } from 'lucide-react'
import { Toaster } from '@/components/ui/toaster'

export function AuthLayout() {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-primary p-12">
        <div className="flex items-center gap-2.5">
          <CalendarCheck className="h-7 w-7 text-white" />
          <span className="font-display text-2xl font-bold text-white tracking-tight">Reservo</span>
        </div>

        <div className="space-y-4">
          <h1 className="font-display text-4xl font-bold text-white leading-tight">
            Réservez vos espaces<br />en quelques clics.
          </h1>
          <p className="text-blue-100 text-lg leading-relaxed max-w-md">
            Salles de réunion, équipements audiovisuels, bureaux privatifs — disponibles instantanément.
          </p>
        </div>

        <div className="flex gap-6">
          {[
            { number: '7', label: 'Ressources' },
            { number: '100%', label: 'En ligne' },
            { number: '24/7', label: 'Disponible' },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="font-display text-2xl font-bold text-white">{stat.number}</p>
              <p className="text-sm text-blue-200">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        {/* Mobile logo */}
        <div className="mb-8 flex items-center gap-2 lg:hidden">
          <CalendarCheck className="h-6 w-6 text-primary" />
          <span className="font-display text-xl font-bold tracking-tight">Reservo</span>
        </div>

        <div className="w-full max-w-sm">
          <Outlet />
        </div>
      </div>

      <Toaster />
    </div>
  )
}
