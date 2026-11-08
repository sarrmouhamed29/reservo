import { Link, NavLink, useNavigate } from 'react-router-dom'
import { CalendarCheck, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

const linkClass = ({ isActive }) =>
  cn(
    'whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
    isActive
      ? 'bg-primary text-primary-foreground'
      : 'text-foreground/80 hover:bg-secondary hover:text-foreground'
  )

function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('')
}

export function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    toast({ title: 'Déconnecté', description: 'À bientôt !' })
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-8 gap-y-2 px-4 py-3 sm:px-6 md:h-16 md:py-0 lg:px-8">
        <Link to="/" className="flex items-center gap-2 text-primary">
          <CalendarCheck className="h-6 w-6" />
          <span className="font-display text-xl font-bold tracking-tight">Reservo</span>
        </Link>

        <nav
          aria-label="Navigation principale"
          className="order-last flex w-full items-center gap-1 overflow-x-auto md:order-none md:w-auto md:flex-1"
        >
          <NavLink to="/resources" className={linkClass}>
            Catalogue
          </NavLink>
          {user && (
            <NavLink to="/bookings" className={linkClass}>
              Mes réservations
            </NavLink>
          )}
          {user?.role === 'admin' && (
            <NavLink to="/admin/resources" className={linkClass}>
              Administration
            </NavLink>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          {user ? (
            <>
              <div className="hidden items-center gap-2.5 sm:flex">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {initials(user.name)}
                </span>
                <span className="text-sm font-medium">{user.name}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="gap-2 text-foreground/80"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Déconnexion</span>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Connexion</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/register">S'inscrire</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
