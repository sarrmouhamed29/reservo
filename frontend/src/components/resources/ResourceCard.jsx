import { Link } from 'react-router-dom'
import { ArrowRight, Building2, Users, Wrench } from 'lucide-react'
import { formatCents } from '@/lib/utils'

const TYPE_LABELS = { room: 'Salle', equipment: 'Matériel' }

export function ResourceCard({ resource }) {
  const image = resource.images?.[0]
  const Icon = resource.type === 'room' ? Building2 : Wrench

  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-card transition-shadow duration-200 hover:shadow-lift">
      <Link
        to={`/resources/${resource.id}`}
        className="relative block aspect-[16/10] overflow-hidden bg-secondary"
      >
        {image ? (
          <img
            src={image.url}
            alt={resource.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Icon className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-card/95 px-2.5 py-1 text-xs font-semibold text-foreground shadow-card">
          <Icon className="h-3.5 w-3.5 text-primary" />
          {TYPE_LABELS[resource.type] ?? resource.type}
        </span>
        {resource.capacity && (
          <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-md bg-foreground/80 px-2 py-1 text-xs font-medium text-white backdrop-blur">
            <Users className="h-3.5 w-3.5" />
            {resource.capacity} pers.
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="font-display text-lg font-semibold leading-snug">
          <Link to={`/resources/${resource.id}`} className="hover:text-primary">
            {resource.name}
          </Link>
        </h3>
        {resource.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{resource.description}</p>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border bg-background/60 px-5 py-4">
        <div>
          <p className="text-xs text-muted-foreground">Tarif horaire</p>
          <p className="font-display text-xl font-bold text-primary">
            {formatCents(resource.hourly_price_cents)}
          </p>
        </div>
        <Link
          to={`/resources/${resource.id}`}
          className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-[#0043A6]"
        >
          Réserver un créneau
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  )
}
