import { Link, NavLink, useNavigate } from 'react-router-dom'
import { CalendarCheck, LogOut, LayoutDashboard, Menu } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { toast } from '@/hooks/use-toast'

export function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    toast({ title: 'Déconnecté', description: 'À bientôt !' })
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4">
        {/* Logo */}
        <Link to="/resources" className="flex items-center gap-2">
          <CalendarCheck className="h-5 w-5 text-primary" />
          <span className="font-display text-lg font-700 tracking-tight">Reservo</span>
        </Link>

        <Separator orientation="vertical" className="h-5" />

        {/* Nav links */}
        <nav className="flex flex-1 items-center gap-1">
          <NavLink
            to="/resources"
            className={({ isActive }) =>
              `rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'
              }`
            }
          >
            Ressources
          </NavLink>

          {user && (
            <NavLink
              to="/bookings"
              className={({ isActive }) =>
                `rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'
                }`
              }
            >
              Mes réservations
            </NavLink>
          )}

          {user?.role === 'admin' && (
            <NavLink
              to="/admin/resources"
              className={({ isActive }) =>
                `flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'
                }`
              }
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              Admin
            </NavLink>
          )}
        </nav>

        {/* Auth actions */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="hidden text-sm text-muted-foreground sm:block">{user.name}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
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
