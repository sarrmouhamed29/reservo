import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal } from 'lucide-react'
import { listResources } from '@/api/resources'
import { ResourceCard } from '@/components/resources/ResourceCard'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

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
    next.delete('page')
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
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Ressources disponibles</h1>
        <p className="mt-1 text-muted-foreground">Salles de réunion et matériel à réserver.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom…"
            className="pl-8"
            defaultValue={name}
            onChange={(e) => {
              const val = e.target.value
              clearTimeout(window._nameDebounce)
              window._nameDebounce = setTimeout(() => setParam('name', val), 350)
            }}
          />
        </div>
        <Select value={type || 'all'} onValueChange={(v) => setParam('type', v === 'all' ? '' : v)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="room">Salles</SelectItem>
            <SelectItem value="equipment">Matériel</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : resources.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <SlidersHorizontal className="h-10 w-10 text-muted-foreground/40" />
          <p className="font-medium">Aucune ressource trouvée</p>
          <p className="text-sm text-muted-foreground">Essayez de modifier vos filtres.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {resources.map((r) => (
            <ResourceCard key={r.id} resource={r} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setParam('page', page - 1)}
          >
            Précédent
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {pagination.current_page} / {pagination.last_page}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pagination.last_page}
            onClick={() => setParam('page', page + 1)}
          >
            Suivant
          </Button>
        </div>
      )}
    </div>
  )
}
