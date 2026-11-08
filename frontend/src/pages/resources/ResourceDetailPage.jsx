import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Building2, ChevronRight, Lock, ShieldCheck, Users, Wrench } from 'lucide-react'
import { getResource } from '@/api/resources'
import { createBooking, createCheckout, createPayDunyaCheckout } from '@/api/bookings'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'
import { formatCents } from '@/lib/utils'
import { PaymentMethodSelector } from '@/components/payment/PaymentMethodSelector'

export function ResourceDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [resource, setResource] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)
  const [bookingForm, setBookingForm] = useState({ starts_at: '', ends_at: '' })
  const [bookingErrors, setBookingErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('paydunya')

  useEffect(() => {
    getResource(id)
      .then(({ data }) => setResource(data.data))
      .catch(() => navigate('/resources'))
      .finally(() => setLoading(false))
  }, [id])

  const hours = useMemo(() => {
    const { starts_at, ends_at } = bookingForm
    if (!starts_at || !ends_at) return 0
    const diff = (new Date(ends_at) - new Date(starts_at)) / 3600000
    return diff > 0 ? diff : 0
  }, [bookingForm])

  const handleBook = async (e) => {
    e.preventDefault()
    setBookingErrors({})
    setSubmitting(true)
    try {
      const { data: bookingData } = await createBooking({
        resource_id: resource.id,
        starts_at: bookingForm.starts_at,
        ends_at: bookingForm.ends_at,
      })
      const checkout = paymentMethod === 'stripe' ? createCheckout : createPayDunyaCheckout
      const { data: checkoutData } = await checkout(bookingData.data.id)
      window.location.href = checkoutData.checkout_url
    } catch (err) {
      const data = err.response?.data
      if (data?.errors) setBookingErrors(data.errors)
      else if (err.response?.status === 409) {
        toast({ variant: 'destructive', title: 'Créneau indisponible', description: data?.message || 'Ce créneau est déjà réservé. Choisissez une autre plage.' })
      } else {
        toast({ variant: 'destructive', title: 'Réservation impossible', description: data?.message || 'Vérifiez les dates puis réessayez.' })
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!resource) return null

  const TypeIcon = resource.type === 'room' ? Building2 : Wrench
  const images = resource.images ?? []
  const thumbs = images.slice(0, 4)

  return (
    <div className="space-y-6">
      <nav aria-label="Fil d'Ariane" className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link to="/resources" className="hover:text-foreground">Catalogue</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">{resource.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        <div className="min-w-0 space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-4xl font-bold tracking-tight">{resource.name}</h1>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                <TypeIcon className="h-4 w-4" />
                {resource.type === 'room' ? 'Salle' : 'Matériel'}
              </span>
              {resource.capacity && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-sm font-medium">
                  <Users className="h-4 w-4 text-primary" />
                  {resource.capacity} personnes
                </span>
              )}
            </div>
            {resource.description && (
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">{resource.description}</p>
            )}
          </div>

          <div className="overflow-hidden rounded-lg border border-border bg-secondary shadow-card">
            {images.length > 0 ? (
              <img src={images[activeImage]?.url} alt={resource.name} className="aspect-[16/9] w-full object-cover" />
            ) : (
              <div className="flex aspect-[16/9] items-center justify-center">
                <TypeIcon className="h-16 w-16 text-muted-foreground/30" />
              </div>
            )}
          </div>
          {thumbs.length > 1 && (
            <div className="flex gap-3">
              {thumbs.map((img, i) => (
                <button
                  key={img.id ?? i}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  aria-label={`Voir la photo ${i + 1}`}
                  className={`h-20 w-28 overflow-hidden rounded-md border-2 transition-colors ${i === activeImage ? 'border-primary' : 'border-transparent opacity-70 hover:opacity-100'}`}
                >
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="flex items-start gap-4 rounded-lg border border-border bg-card p-5 shadow-card">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-lg font-semibold">Créneau garanti</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Deux réservations ne peuvent jamais se chevaucher : si le créneau est déjà pris, vous êtes prévenu avant de payer.
              </p>
            </div>
          </div>
        </div>

        {/* Booking panel */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          {user && user.role !== 'admin' ? (
            <form onSubmit={handleBook} className="space-y-5 rounded-xl border border-border bg-card p-6 shadow-pop">
              <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
                <h2 className="font-display text-xl font-semibold">Réserver ce créneau</h2>
                <p className="text-right">
                  <span className="font-display text-2xl font-bold text-primary">{formatCents(resource.hourly_price_cents)}</span>
                  <span className="block text-xs text-muted-foreground">par heure</span>
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <div className="space-y-1.5">
                  <Label htmlFor="starts_at">Début</Label>
                  <Input
                    id="starts_at"
                    type="datetime-local"
                    value={bookingForm.starts_at}
                    onChange={(e) => setBookingForm((f) => ({ ...f, starts_at: e.target.value }))}
                  />
                  {bookingErrors.starts_at && <p className="text-xs text-destructive">{bookingErrors.starts_at[0]}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ends_at">Fin</Label>
                  <Input
                    id="ends_at"
                    type="datetime-local"
                    value={bookingForm.ends_at}
                    onChange={(e) => setBookingForm((f) => ({ ...f, ends_at: e.target.value }))}
                  />
                  {bookingErrors.ends_at && <p className="text-xs text-destructive">{bookingErrors.ends_at[0]}</p>}
                  {bookingErrors.resource_id && <p className="text-xs text-destructive">{bookingErrors.resource_id[0]}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Mode de paiement</Label>
                <PaymentMethodSelector value={paymentMethod} onChange={setPaymentMethod} />
              </div>

              <dl className="space-y-2 rounded-lg border border-border bg-background p-4 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Durée</dt>
                  <dd className="font-medium">{hours ? `${hours.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} h` : '—'}</dd>
                </div>
                <div className="flex justify-between border-t border-border pt-2">
                  <dt className="font-semibold">Total estimé</dt>
                  <dd className="font-display text-lg font-bold">
                    {hours ? formatCents(Math.round(resource.hourly_price_cents * hours)) : '—'}
                  </dd>
                </div>
              </dl>

              <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                <Lock className="h-4 w-4" />
                {submitting ? 'Redirection vers le paiement…' : 'Continuer vers le paiement'}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Vous réglez sur la page sécurisée du prestataire choisi.
              </p>
            </form>
          ) : !user ? (
            <div className="space-y-4 rounded-xl border border-border bg-card p-6 text-center shadow-pop">
              <p className="font-display text-xl font-semibold">Réservez cette ressource</p>
              <p className="text-sm text-muted-foreground">Connectez-vous pour choisir un créneau et payer.</p>
              <div className="flex flex-col gap-2">
                <Button asChild><Link to={`/login?redirect=/resources/${resource.id}`}>Se connecter</Link></Button>
                <Button variant="outline" asChild><Link to="/register">Créer un compte</Link></Button>
              </div>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  )
}
