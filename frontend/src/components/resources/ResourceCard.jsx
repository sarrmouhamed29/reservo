import { Link } from 'react-router-dom'
import { Users, Clock, Wrench, Building2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCents } from '@/lib/utils'

const TYPE_LABELS = {
  room: 'Salle',
  equipment: 'Matériel',
}

export function ResourceCard({ resource }) {
  const firstImage = resource.images?.[0]

  return (
    <div className="flex gap-4 rounded-lg border bg-card p-4 transition-shadow hover:shadow-md">
      {/* Thumbnail */}
      <div className="h-20 w-28 shrink-0 overflow-hidden rounded-md bg-muted">
        {firstImage ? (
          <img src={firstImage.url} alt={resource.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            {resource.type === 'room' ? (
              <Building2 className="h-8 w-8 text-muted-foreground/40" />
            ) : (
              <Wrench className="h-8 w-8 text-muted-foreground/40" />
            )}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-display text-base font-semibold leading-tight">{resource.name}</h3>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant="secondary">{TYPE_LABELS[resource.type] ?? resource.type}</Badge>
              {resource.capacity && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" />
                  {resource.capacity} pers.
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="font-display text-base font-semibold text-primary">{formatCents(resource.hourly_price_cents)}</p>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              par heure
            </p>
          </div>
        </div>

        {resource.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{resource.description}</p>
        )}

        <div className="mt-auto">
          <Button size="sm" variant="outline" asChild>
            <Link to={`/resources/${resource.id}`}>Voir et réserver</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
