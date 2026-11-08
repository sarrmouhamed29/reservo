import { Link, Outlet } from 'react-router-dom'
import { CalendarCheck } from 'lucide-react'
import { Toaster } from '@/components/ui/toaster'

const SIDE_IMAGE = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600&q=80'

export function AuthLayout() {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Image panel */}
      <div className="relative hidden overflow-hidden bg-foreground lg:flex lg:w-1/2">
        <img src={SIDE_IMAGE} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0E1B33] via-[#0E1B33]/55 to-[#0E1B33]/25" />
        <div className="relative z-10 flex w-full flex-col justify-between p-12">
          <Link to="/" className="flex items-center gap-2.5 text-white">
            <CalendarCheck className="h-7 w-7" />
            <span className="font-display text-2xl font-bold tracking-tight">Reservo</span>
          </Link>
          <div className="max-w-md">
            <p className="font-display text-3xl font-bold leading-tight text-white">
              Réservez vos espaces en quelques clics.
            </p>
            <p className="mt-3 text-lg leading-relaxed text-white/80">
              Salles de réunion et matériel, disponibles à l'heure, payables par Orange Money, Wave
              ou carte.
            </p>
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <Link to="/" className="mb-8 flex items-center gap-2 text-primary lg:hidden">
          <CalendarCheck className="h-6 w-6" />
          <span className="font-display text-xl font-bold tracking-tight">Reservo</span>
        </Link>
        <div className="w-full max-w-sm">
          <Outlet />
        </div>
      </div>

      <Toaster />
    </div>
  )
}
