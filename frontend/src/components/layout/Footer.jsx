import { Link } from 'react-router-dom'
import { CalendarCheck } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-1.5 font-display font-bold text-primary">
            <CalendarCheck className="h-4 w-4" />
            Reservo
          </Link>
          <span>© {new Date().getFullYear()} Reservo. Tous droits réservés.</span>
        </div>
        <div className="flex gap-6">
          <Link to="/resources" className="hover:text-foreground">
            Catalogue
          </Link>
          <Link to="/login" className="hover:text-foreground">
            Connexion
          </Link>
          <Link to="/register" className="hover:text-foreground">
            Créer un compte
          </Link>
        </div>
      </div>
    </footer>
  )
}
