import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal } from 'lucide-react'
import { listResources } from '@/api/resources'
import { ResourceCard } from '@/components/resources/ResourceCard'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const TYPES = [
  { value: '', label: 'Toutes les ressources' },
  { value: 'room', label: 'Salles de réunion' },
  { value: 'equipment', label: 'Matériel' },
]

export function ResourcesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [resources, setResources] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)

  const name = searchParams.get('name') || ''
  const type = searchParams.get('type') || ''
  const page = parseInt(searchParams.get('page') || '1', 10)

  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    if (key !== 'page') next.delete('page')
    setSearchParams(next)
  }

  useEffect(() => {
    setLoading(true)
    listResources({ name: name || undefined, type: type || undefined, page })
      .then(({ data }) => {
        setResources(data.data)
        setPagination(data.meta)
      })
      .finally(() => setLoading(false))
  }, [name, type, page])

  return (
    <div className="space-y-8">
      <div className="max-w-2xl">
        <h1 className="font-display text-4xl font-bold tracking-tight">Catalogue des ressources</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Salles de réunion et matériel professionnel. Choisissez, vérifiez les créneaux libres,
          réservez.
        </p>
      </div>

      <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 shadow-card lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrer par type">
          {TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              aria-pressed={type === t.value}
              onClick={() => setParam('type', t.value)}
              className={cn(
                'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
                type === t.value
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-foreground/80 hover:border-primary/50 hover:text-primary'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="relative w-full lg:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom…"
            aria-label="Rechercher une ressource"
            className="pl-9"
            defaultValue={name}
            onChange={(e) => {
              const val = e.target.value
              clearTimeout(window._nameDebounce)
              window._nameDebounce = setTimeout(() => setParam('name', val), 350)
            }}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : resources.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-16 text-center">
          <SlidersHorizontal className="h-10 w-10 text-muted-foreground/40" />
          <p className="font-medium">Aucune ressource ne correspond</p>
          <p className="text-sm text-muted-foreground">
            Retirez un filtre ou cherchez un autre nom.
          </p>
        </div>
      ) : (
        <>
          {pagination && (
            <p className="text-sm text-muted-foreground">
              {pagination.total} ressource{pagination.total > 1 ? 's' : ''}
            </p>
          )}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {resources.map((r) => (
              <ResourceCard key={r.id} resource={r} />
            ))}
          </div>
        </>
      )}

      {pagination && pagination.last_page > 1 && (
        <nav
          aria-label="Pagination"
          className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 shadow-card"
        >
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setParam('page', page - 1)}
            className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium hover:bg-secondary disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" /> Précédent
          </button>
          <span className="text-sm text-muted-foreground">
            Page {pagination.current_page} sur {pagination.last_page}
          </span>
          <button
            type="button"
            disabled={page >= pagination.last_page}
            onClick={() => setParam('page', page + 1)}
            className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium hover:bg-secondary disabled:pointer-events-none disabled:opacity-40"
          >
            Suivant <ChevronRight className="h-4 w-4" />
          </button>
        </nav>
      )}
    </div>
  )
}
