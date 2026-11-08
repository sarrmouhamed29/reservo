import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import { listResources } from '@/api/resources'
import { ResourceCard } from '@/components/resources/ResourceCard'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const PER_PAGE = 6

const TYPES = [
  { value: '', label: 'Toutes les ressources' },
  { value: 'room', label: 'Salles de réunion' },
  { value: 'equipment', label: 'Matériel' },
]

const CAPACITIES = [
  { value: '', label: 'Tous', params: {} },
  { value: '1-4', label: '1-4 pers.', params: { capacity_min: 1, capacity_max: 4 } },
  { value: '5-10', label: '5-10 pers.', params: { capacity_min: 5, capacity_max: 10 } },
  { value: '10+', label: '10+ pers.', params: { capacity_min: 11 } },
]

const SORTS = [
  { value: '', label: 'Pertinence Reservo' },
  { value: 'price_asc', label: 'Prix : croissant' },
  { value: 'price_desc', label: 'Prix : décroissant' },
  { value: 'capacity_desc', label: 'Capacité : décroissante' },
]

function pageWindow(current, last) {
  const pages = new Set([1, last, current - 1, current, current + 1])
  return [...pages].filter((p) => p >= 1 && p <= last).sort((a, b) => a - b)
}

export function ResourcesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [resources, setResources] = useState([])
  const [pagination, setPagination] = useState(null)
  const [catalogTotal, setCatalogTotal] = useState(null)
  const [loading, setLoading] = useState(true)
  const debounce = useRef()

  const name = searchParams.get('name') || ''
  const type = searchParams.get('type') || ''
  const cap = searchParams.get('cap') || ''
  const sort = searchParams.get('sort') || ''
  const date = searchParams.get('date') || ''
  const from = searchParams.get('from') || '09:00'
  const to = searchParams.get('to') || '18:00'
  const page = parseInt(searchParams.get('page') || '1', 10)

  const [slot, setSlot] = useState({ date, from, to })

  const setParams = (changes, keepPage = false) => {
    const next = new URLSearchParams(searchParams)
    Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)))
    if (!keepPage) next.delete('page')
    setSearchParams(next)
  }

  const applySlot = () =>
    setParams({ date: slot.date, from: slot.date ? slot.from : '', to: slot.date ? slot.to : '' })
  const clearSlot = () => {
    setSlot({ date: '', from: '09:00', to: '18:00' })
    setParams({ date: '', from: '', to: '' })
  }

  useEffect(() => {
    const capParams = CAPACITIES.find((c) => c.value === cap)?.params ?? {}
    const params = {
      name: name || undefined,
      type: type || undefined,
      sort: sort || undefined,
      page,
      per_page: PER_PAGE,
      ...capParams,
    }
    if (date && from < to) {
      params.available_from = `${date}T${from}`
      params.available_to = `${date}T${to}`
    }
    setLoading(true)
    listResources(params)
      .then(({ data }) => {
        setResources(data.data)
        setPagination(data.meta)
        if (!name && !type && !cap && !date) setCatalogTotal(data.meta?.total ?? null)
      })
      .finally(() => setLoading(false))
  }, [name, type, cap, sort, date, from, to, page])

  const slotActive = Boolean(date)
  const slotInvalid = slot.date && slot.from >= slot.to

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-2xl">
          <h1 className="font-display text-4xl font-bold tracking-tight">
            Catalogue des ressources
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Explorez et réservez des salles de réunion équipées et du matériel technique de pointe
            en accès direct.
          </p>
        </div>
        {catalogTotal !== null && (
          <div className="rounded-lg border border-border bg-card px-5 py-3 shadow-card">
            <p className="text-xs text-muted-foreground">Au catalogue</p>
            <p className="font-display text-3xl font-bold text-primary">
              {catalogTotal}{' '}
              <span className="text-sm font-medium text-muted-foreground">
                ressource{catalogTotal > 1 ? 's' : ''} réservable{catalogTotal > 1 ? 's' : ''}
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Quick search + availability window */}
      <div className="grid gap-3 rounded-lg border border-border bg-card p-3 shadow-card lg:grid-cols-[1fr_auto_auto_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom, équipement…"
            aria-label="Rechercher une ressource"
            className="pl-9"
            defaultValue={name}
            onChange={(e) => {
              const val = e.target.value
              clearTimeout(debounce.current)
              debounce.current = setTimeout(() => setParams({ name: val }), 350)
            }}
          />
        </div>
        <label className="flex items-center gap-2 rounded-md border border-input bg-card px-3">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          <input
            type="date"
            aria-label="Date de disponibilité"
            value={slot.date}
            onChange={(e) => setSlot((s) => ({ ...s, date: e.target.value }))}
            className="h-10 bg-transparent text-sm outline-none"
          />
        </label>
        <div className="flex items-center gap-2 rounded-md border border-input bg-card px-3">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <input
            type="time"
            aria-label="Heure de début"
            value={slot.from}
            onChange={(e) => setSlot((s) => ({ ...s, from: e.target.value }))}
            className="h-10 bg-transparent text-sm outline-none"
          />
          <span className="text-muted-foreground">—</span>
          <input
            type="time"
            aria-label="Heure de fin"
            value={slot.to}
            onChange={(e) => setSlot((s) => ({ ...s, to: e.target.value }))}
            className="h-10 bg-transparent text-sm outline-none"
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={applySlot} disabled={!slot.date || slotInvalid} className="gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Filtrer
          </Button>
          {slotActive && (
            <Button
              variant="outline"
              size="icon"
              onClick={clearSlot}
              aria-label="Retirer le filtre de disponibilité"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      {slotInvalid && (
        <p className="-mt-5 text-sm text-destructive">
          L'heure de fin doit être après l'heure de début.
        </p>
      )}

      {/* Type chips + sort */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrer par type">
          {TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              aria-pressed={type === t.value}
              onClick={() => setParams({ type: t.value })}
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
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          Trier par
          <select
            value={sort}
            onChange={(e) => setParams({ sort: e.target.value })}
            className="h-10 rounded-md border border-input bg-card px-3 text-sm text-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/20"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Capacity */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3 shadow-card">
        <div
          className="flex flex-wrap items-center gap-2"
          role="group"
          aria-label="Filtrer par capacité"
        >
          <span className="mr-1 text-sm font-medium text-muted-foreground">Capacité</span>
          {CAPACITIES.map((c) => (
            <button
              key={c.value}
              type="button"
              aria-pressed={cap === c.value}
              onClick={() => setParams({ cap: c.value })}
              className={cn(
                'rounded-md border px-3 py-1 text-sm transition-colors',
                cap === c.value
                  ? 'border-primary bg-primary/10 font-medium text-primary'
                  : 'border-border bg-background text-foreground/80 hover:border-primary/50'
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
        {pagination && (
          <p className="text-sm text-muted-foreground">
            {slotActive && (
              <span className="mr-2 font-medium text-emerald-700">Libres sur ce créneau ·</span>
            )}
            {resources.length} élément{resources.length > 1 ? 's' : ''} affiché
            {resources.length > 1 ? 's' : ''} sur {pagination.total}
          </p>
        )}
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
            Retirez un filtre, élargissez la capacité ou changez de créneau.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {resources.map((r) => (
            <ResourceCard key={r.id} resource={r} />
          ))}
        </div>
      )}

      {pagination && pagination.total > 0 && (
        <nav
          aria-label="Pagination"
          className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-card px-4 py-3 shadow-card"
        >
          <p className="text-sm text-muted-foreground">
            Affichage de <strong className="text-foreground">{pagination.from ?? 0}</strong> à{' '}
            <strong className="text-foreground">{pagination.to ?? 0}</strong> sur{' '}
            <strong className="text-foreground">{pagination.total}</strong> ressources
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setParams({ page: page - 1 }, true)}
              className="inline-flex h-9 items-center gap-1 rounded-md border border-border px-3 text-sm font-medium hover:bg-secondary disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" /> Précédent
            </button>
            {pageWindow(pagination.current_page, pagination.last_page).map((p, i, arr) => (
              <span key={p} className="flex items-center gap-1">
                {i > 0 && p - arr[i - 1] > 1 && (
                  <span className="px-1 text-muted-foreground">…</span>
                )}
                <button
                  type="button"
                  aria-current={p === pagination.current_page ? 'page' : undefined}
                  onClick={() => setParams({ page: p }, true)}
                  className={cn(
                    'h-9 min-w-9 rounded-md border px-2 text-sm font-medium',
                    p === pagination.current_page
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border hover:bg-secondary'
                  )}
                >
                  {p}
                </button>
              </span>
            ))}
            <button
              type="button"
              disabled={page >= pagination.last_page}
              onClick={() => setParams({ page: page + 1 }, true)}
              className="inline-flex h-9 items-center gap-1 rounded-md border border-border px-3 text-sm font-medium hover:bg-secondary disabled:pointer-events-none disabled:opacity-40"
            >
              Suivant <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <p className="text-sm text-muted-foreground">
            Page {pagination.current_page} sur {pagination.last_page}
          </p>
        </nav>
      )}
    </div>
  )
}
