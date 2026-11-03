import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createResource, getResource, updateResource } from '@/api/resources'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/hooks/use-toast'

export function AdminResourceFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [form, setForm] = useState({
    name: '',
    type: 'room',
    description: '',
    capacity: '',
    hourly_price_cents: '',
    is_active: true,
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isEdit) return
    getResource(id)
      .then(({ data }) => {
        const r = data.data
        setForm({
          name: r.name,
          type: r.type,
          description: r.description ?? '',
          capacity: r.capacity ?? '',
          hourly_price_cents: r.hourly_price_cents,
          is_active: r.is_active,
        })
      })
      .finally(() => setLoading(false))
  }, [id])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setSaving(true)
    const payload = {
      ...form,
      capacity: form.capacity ? parseInt(form.capacity) : null,
      hourly_price_cents: parseInt(form.hourly_price_cents),
    }
    try {
      if (isEdit) {
        await updateResource(id, payload)
        toast({ title: 'Ressource mise à jour' })
      } else {
        await createResource(payload)
        toast({ title: 'Ressource créée' })
      }
      navigate('/admin/resources')
    } catch (err) {
      const data = err.response?.data
      if (data?.errors) setErrors(data.errors)
      else toast({ variant: 'destructive', title: 'Erreur', description: data?.message || 'Enregistrement impossible.' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          {isEdit ? 'Modifier la ressource' : 'Nouvelle ressource'}
        </h1>
      </div>
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nom</Label>
              <Input id="name" name="name" value={form.name} onChange={handleChange} placeholder="Salle de conférence A" />
              {errors.name && <p className="text-xs text-destructive">{errors.name[0]}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="room">Salle</SelectItem>
                    <SelectItem value="equipment">Matériel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="capacity">Capacité (personnes)</Label>
                <Input id="capacity" name="capacity" type="number" min="1" value={form.capacity} onChange={handleChange} placeholder="20" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                className="flex min-h-[72px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Description de la ressource…"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="hourly_price_cents">Prix par heure (en centimes)</Label>
              <Input
                id="hourly_price_cents"
                name="hourly_price_cents"
                type="number"
                min="0"
                value={form.hourly_price_cents}
                onChange={handleChange}
                placeholder="5000 = 50,00 €"
              />
              {errors.hourly_price_cents && <p className="text-xs text-destructive">{errors.hourly_price_cents[0]}</p>}
              {form.hourly_price_cents && (
                <p className="text-xs text-muted-foreground">
                  Soit {(parseInt(form.hourly_price_cents) / 100).toFixed(2)} € / heure
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                id="is_active"
                name="is_active"
                type="checkbox"
                checked={form.is_active}
                onChange={handleChange}
                className="h-4 w-4 rounded border-input accent-primary"
              />
              <Label htmlFor="is_active">Ressource active (réservable par les utilisateurs)</Label>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>Annuler</Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Enregistrement…' : (isEdit ? 'Mettre à jour' : 'Créer la ressource')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
