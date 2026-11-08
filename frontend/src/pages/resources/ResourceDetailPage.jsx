import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  Building2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Lock,
  ShieldCheck,
  Users,
  Wrench,
} from 'lucide-react'
import { getAvailability, getResource } from '@/api/resources'
import { createBooking, createCheckout, createPayDunyaCheckout } from '@/api/bookings'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import { cn, formatCents } from '@/lib/utils'
import { PaymentMethodSelector } from '@/components/payment/PaymentMethodSelector'

// Hourly slots offered in the picker (start hours, 08:00 to 19:00).
const HOURS = Array.from({ length: 11 }, (_, i) => 8 + i)
const DAY_LABELS = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di']

// The server reads booking times as UTC, so the picker works in UTC too.
const pad = (n) => String(n).padStart(2, '0')
const toDay = (d) => d.toISOString().slice(0, 10)
const atUtc = (day, hour = 0) => new Date(`${day}T${pad(hour)}:00:00Z`)
const addDays = (day, n) => toDay(new Date(atUtc(day).getTime() + n * 86400000))
const weekStart = (day) => addDays(day, -((atUtc(day).getUTCDay() + 6) % 7))
const monthFmt = new Intl.DateTimeFormat('fr-FR', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})
const dayFmt = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})

const parseBusy = (rows) =>
  rows.map((b) => ({ start: new Date(b.starts_at), end: new Date(b.ends_at) }))

export function ResourceDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const today = toDay(new Date())
  const [resource, setResource] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)
  const [day, setDay] = useState(today)
  const [busy, setBusy] = useState([])
  const [range, setRange] = useState(null) // { from, to }: first and last selected start hours
  const [bookingErrors, setBookingErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('paydunya')

  useEffect(() => {
    getResource(id)
      .then(({ data }) => setResource(data.data))
      .catch(() => navigate('/resources'))
      .finally(() => setLoading(false))
  }, [id, navigate])

  useEffect(() => {
    setRange(null)
    getAvailability(id, day)
      .then(({ data }) => setBusy(parseBusy(data.data)))
      .catch(() => setBusy([]))
  }, [id, day])

  const slotState = (hour) => {
    const start = atUtc(day, hour)
    const end = atUtc(day, hour + 1)
    if (start < new Date()) return 'past'
    if (busy.some((b) => b.start < end && b.end > start)) return 'busy'
    if (range && hour >= range.from && hour <= range.to) return 'picked'
    return 'free'
  }

  const pickSlot = (hour) => {
    setBookingErrors({})
    setRange((r) => {
      if (!r) return { from: hour, to: hour }
      if (hour === r.to + 1) return { ...r, to: hour }
      if (hour === r.from - 1) return { ...r, from: hour }
      return { from: hour, to: hour }
    })
  }

  const freeCount = HOURS.filter((h) => ['free', 'picked'].includes(slotState(h))).length
  const hours = range ? range.to - range.from + 1 : 0
  const total = useMemo(
    () => (resource ? Math.round(resource.hourly_price_cents * hours) : 0),
    [resource, hours]
  )
  const week = Array.from({ length: 7 }, (_, i) => addDays(weekStart(day), i))
  const fieldError = bookingErrors.starts_at || bookingErrors.ends_at || bookingErrors.resource_id

  const handleBook = async (e) => {
    e.preventDefault()
    if (!range) return
    setBookingErrors({})
    setSubmitting(true)
    try {
      const { data: bookingData } = await createBooking({
        resource_id: resource.id,
        starts_at: `${day}T${pad(range.from)}:00`,
        ends_at: `${day}T${pad(range.to + 1)}:00`,
      })
      const checkout = paymentMethod === 'stripe' ? createCheckout : createPayDunyaCheckout
      const { data: checkoutData } = await checkout(bookingData.data.id)
      window.location.href = checkoutData.checkout_url
    } catch (err) {
      const data = err.response?.data
      if (data?.errors) setBookingErrors(data.errors)
      else if (err.response?.status === 409) {
        toast({
          variant: 'destructive',
          title: 'Créneau indisponible',
          description:
            data?.message || 'Ce créneau vient d’être réservé. Choisissez une autre plage.',
        })
        getAvailability(id, day).then(({ data: d }) => setBusy(parseBusy(d.data)))
        setRange(null)
      } else {
        toast({
          variant: 'destructive',
          title: 'Réservation impossible',
          description: data?.message || 'Vérifiez le créneau puis réessayez.',
        })
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
  const side = images.map((img, i) => ({ img, i })).filter(({ i }) => i !== activeImage)

  return (
    <div className="space-y-6">
      <nav
        aria-label="Fil d'Ariane"
        className="flex items-center gap-1.5 text-sm text-muted-foreground"
      >
        <Link to="/resources" className="hover:text-foreground">
          Catalogue
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link to={`/resources?type=${resource.type}`} className="hover:text-foreground">
          {resource.type === 'room' ? 'Salles' : 'Matériel'}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">{resource.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
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
                  Capacité {resource.capacity} personnes
                </span>
              )}
            </div>
            {resource.description && (
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                {resource.description}
              </p>
            )}
          </div>

          {/* Gallery: one large photo, two stacked thumbnails */}
          <div
            className={cn('grid gap-3', side.length > 0 && 'sm:grid-cols-[2fr_1fr] sm:grid-rows-2')}
          >
            <div
              className={cn(
                'overflow-hidden rounded-lg border border-border bg-secondary shadow-card',
                side.length > 0 && 'sm:row-span-2'
              )}
            >
              {images.length > 0 ? (
                <img
                  src={images[activeImage]?.url}
                  alt={resource.name}
                  className="aspect-[16/10] h-full w-full object-cover"
                />
              ) : (
                <div className="flex aspect-[16/10] items-center justify-center">
                  <TypeIcon className="h-16 w-16 text-muted-foreground/30" />
                </div>
              )}
            </div>
            {side.slice(0, 2).map(({ img, i }, n) => (
              <button
                key={img.id ?? i}
                type="button"
                onClick={() => setActiveImage(i)}
                aria-label={`Voir la photo ${i + 1}`}
                className="relative hidden overflow-hidden rounded-lg border border-border bg-secondary shadow-card sm:block"
              >
                <img src={img.url} alt="" className="h-full w-full object-cover" />
                {n === 1 && side.length > 2 && (
                  <span className="absolute bottom-2 right-2 rounded bg-card/95 px-2 py-0.5 text-xs font-medium">
                    +{side.length - 2} photos
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-start gap-4 rounded-lg border border-border bg-card p-5 shadow-card">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-lg font-semibold">Zéro double réservation</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Les créneaux sont verrouillés dans la base de données : deux réservations ne peuvent
                jamais se chevaucher, même si deux personnes valident en même temps.
              </p>
            </div>
          </div>
        </div>

        {/* Slot picker */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          {user && user.role !== 'admin' ? (
            <form
              onSubmit={handleBook}
              className="space-y-5 rounded-xl border border-border bg-card p-6 shadow-pop"
            >
              <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Planification</p>
                  <h2 className="font-display text-xl font-semibold">Sélection du créneau</h2>
                </div>
                <p className="text-right">
                  <span className="font-display text-2xl font-bold text-primary">
                    {formatCents(resource.hourly_price_cents)}
                  </span>
                  <span className="block text-xs text-muted-foreground">par heure</span>
                </p>
              </div>

              {/* Week strip */}
              <div className="rounded-lg border border-border bg-background p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="flex items-center gap-2 font-medium capitalize">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    {monthFmt.format(atUtc(day))}
                  </p>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      aria-label="Semaine précédente"
                      onClick={() => setDay(addDays(day, -7))}
                      className="rounded p-1 hover:bg-secondary"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Semaine suivante"
                      onClick={() => setDay(addDays(day, 7))}
                      className="rounded p-1 hover:bg-secondary"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center">
                  {week.map((d, i) => {
                    const disabled = d < today
                    return (
                      <button
                        key={d}
                        type="button"
                        disabled={disabled}
                        aria-pressed={d === day}
                        onClick={() => setDay(d)}
                        className={cn(
                          'rounded-md py-1.5 transition-colors',
                          d === day ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary',
                          disabled && 'pointer-events-none opacity-35'
                        )}
                      >
                        <span className="block text-xs opacity-80">{DAY_LABELS[i]}</span>
                        <span className="block text-sm font-semibold">{Number(d.slice(8))}</span>
                      </button>
                    )
                  })}
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-sm">
                  <span className="font-medium capitalize">{dayFmt.format(atUtc(day))}</span>
                  <span className="font-medium text-emerald-700">
                    {freeCount} créneau{freeCount > 1 ? 'x' : ''} libre{freeCount > 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Hour slots */}
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium">Horaires de la journée</span>
                  <span className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" /> Libre
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-primary" /> Sélection
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-muted-foreground/40" /> Occupé
                    </span>
                  </span>
                </div>
                <ul className="max-h-72 space-y-1.5 overflow-y-auto pr-1">
                  {HOURS.map((h) => {
                    const st = slotState(h)
                    return (
                      <li key={h}>
                        <button
                          type="button"
                          disabled={st === 'busy' || st === 'past'}
                          aria-pressed={st === 'picked'}
                          onClick={() => pickSlot(h)}
                          className={cn(
                            'flex w-full items-center justify-between rounded-md px-3 py-2.5 text-sm transition-colors',
                            st === 'picked' && 'bg-primary font-semibold text-white',
                            st === 'free' &&
                              'border border-border hover:border-primary hover:bg-primary/5',
                            st === 'busy' &&
                              'cursor-not-allowed bg-[repeating-linear-gradient(135deg,#F4F5F7,#F4F5F7_6px,#E9EBEF_6px,#E9EBEF_12px)] text-muted-foreground',
                            st === 'past' &&
                              'cursor-not-allowed bg-secondary/60 text-muted-foreground/60'
                          )}
                        >
                          <span
                            className={cn(
                              'flex items-center gap-2',
                              st === 'busy' && 'line-through'
                            )}
                          >
                            <Clock className="h-4 w-4" />
                            {pad(h)}:00 – {pad(h + 1)}:00
                          </span>
                          <span className="text-xs font-medium">
                            {
                              {
                                picked: 'Sélectionné',
                                busy: 'Occupé',
                                past: 'Passé',
                                free: 'Libre',
                              }[st]
                            }
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
                {fieldError && <p className="mt-2 text-xs text-destructive">{fieldError[0]}</p>}
                <p className="mt-2 text-xs text-muted-foreground">
                  Cliquez sur des heures qui se suivent pour réserver plusieurs heures d’affilée.
                </p>
              </div>

              <div className="space-y-1.5">
                <p className="text-sm font-medium">Mode de paiement</p>
                <PaymentMethodSelector value={paymentMethod} onChange={setPaymentMethod} />
              </div>

              {/* Recap */}
              <dl className="space-y-2 rounded-lg border border-border bg-background p-4 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="font-medium">Récapitulatif</dt>
                  <dd className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {range ? `${pad(range.from)}:00 – ${pad(range.to + 1)}:00` : 'Aucun créneau'}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Durée totale</dt>
                  <dd className="font-medium">
                    {hours ? `${hours} heure${hours > 1 ? 's' : ''}` : '—'}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Taux horaire</dt>
                  <dd className="font-medium">{formatCents(resource.hourly_price_cents)}</dd>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-2">
                  <dt className="font-semibold">Total</dt>
                  <dd className="font-display text-xl font-bold text-primary">
                    {hours ? formatCents(total) : '—'}
                  </dd>
                </div>
              </dl>

              <Button type="submit" size="lg" className="w-full" disabled={submitting || !range}>
                <Lock className="h-4 w-4" />
                {submitting
                  ? 'Redirection vers le paiement…'
                  : range
                    ? 'Continuer vers le paiement sécurisé'
                    : 'Choisissez un créneau'}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Vous réglez sur la page sécurisée du prestataire choisi.
              </p>
            </form>
          ) : !user ? (
            <div className="space-y-4 rounded-xl border border-border bg-card p-6 text-center shadow-pop">
              <p className="font-display text-xl font-semibold">Réservez cette ressource</p>
              <p className="text-sm text-muted-foreground">
                Connectez-vous pour choisir un créneau et payer.
              </p>
              <div className="flex flex-col gap-2">
                <Button asChild>
                  <Link to={`/login?redirect=/resources/${resource.id}`}>Se connecter</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/register">Créer un compte</Link>
                </Button>
              </div>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  )
}
