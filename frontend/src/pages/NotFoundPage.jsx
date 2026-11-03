import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <p className="font-display text-7xl font-bold text-muted-foreground/20">404</p>
      <h1 className="font-display text-2xl font-bold">Page introuvable</h1>
      <p className="text-muted-foreground">La page que vous cherchez n'existe pas.</p>
      <Button asChild>
        <Link to="/resources">Retour à l'accueil</Link>
      </Button>
    </div>
  )
}
