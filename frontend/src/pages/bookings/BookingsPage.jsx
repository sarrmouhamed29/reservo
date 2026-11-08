import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarClock, LifeBuoy, CalendarX, Clock, Timer, Wallet } from 'lucide-react'
import { cancelBooking, createPayDunyaCheckout, listBookings, syncPayDunya } from '@/api/bookings'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from '@/hooks/use-toast'
import { cn, formatPrice } from '@/lib/utils'

const STATUS = {
  pending: {
    label: 'En attente de paiement',
    className: 'bg-amber-50 text-amber-800 border-amber-200',
    dot: 'bg-amber-500',
  },
  paid: {
    label: 'Payée',
    className: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  cancelled: {
    label: 'Annulée',
    className: 'bg-secondary text-muted-foreground border-border',
    dot: 'bg-muted-foreground',
  },
}

const TABS = [
  { id: 'upcoming', label: 'À venir' },
  { id: 'past', label: 'Passées' },
  { id: 'cancelled', label: 'Annulées' },
]

const dayFmt = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})
const timeFmt = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' })

function duration(start, end) {
  const mins = Math.round((new Date(end) - new Date(start)) / 60000)
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m ? `${h} h ${String(m).padStart(2, '0')}` : `${h} h`
}

function tabOf(b, now) {
  if (b.status === 'cancelled') return 'cancelled'
  return new Date(b.ends_at) >= now ? 'upcoming' : 'past'
}

function Detail({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="capitalize-first text-sm font-medium">{children}</p>
      </div>
    </div>
  )
}

export function BookingsPage() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('upcoming')
  const [sort, setSort] = useState('date_desc')
  const [cancelTarget, setCancelTarget] = useState(null)
  const [cancelling, setCancelling] = useState(false)
  const [checkingOut, setCheckingOut] = useState(null)
  const [verifying, setVerifying] = useState(null)

  const fetchBookings = useCallback(() => {
    setLoading(true)
    listBookings()
      .then(({ data }) => setBookings(data.data))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  const now = new Date()
  const counts = bookings.reduce((acc, b) => {
    const t = tabOf(b, now)
    return { ...acc, [t]: (acc[t] ?? 0) + 1 }
  }, {})
  const sorters = {
    date_desc: (a, b) => new Date(b.starts_at) - new Date(a.starts_at),
    date_asc: (a, b) => new Date(a.starts_at) - new Date(b.starts_at),
    amount_desc: (a, b) => b.total_price - a.total_price,
  }
  const visible = bookings.filter((b) => tabOf(b, now) === tab).sort(sorters[sort])
  const committed = bookings
    .filter((b) => b.status !== 'cancelled')
    .reduce((sum, b) => sum + b.total_price, 0)

  const handleCancel = async () => {
    if (!cancelTarget) return
    setCancelling(true)
    try {
      await cancelBooking(cancelTarget.id)
      toast({ title: 'Réservation annulée' })
      fetchBookings()
    } catch {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: "Impossible d'annuler cette réservation.",
      })
    } finally {
      setCancelling(false)
      setCancelTarget(null)
    }
  }

  const handlePay = async (booking) => {
    setCheckingOut(booking.id)
    try {
      const { data } = await createPayDunyaCheckout(booking.id)
      window.location.href = data.checkout_url
    } catch {
      toast({
        variant: 'destructive',
        title: 'Paiement indisponible',
        description: 'Impossible de lancer le paiement. Réessayez dans un instant.',
      })
      setCheckingOut(null)
    }
  }

  const handleVerify = async (booking) => {
    setVerifying(booking.id)
    try {
      const { data } = await syncPayDunya(booking.id)
      if (data.data.status === 'paid') toast({ title: 'Paiement confirmé' })
      else
        toast({
          title: 'Paiement pas encore confirmé',
          description: "PayDunya n'a pas encore validé ce paiement.",
        })
      fetchBookings()
    } catch {
      toast({
        variant: 'destructive',
        title: 'Vérification impossible',
        description: 'Réessayez dans un instant.',
      })
    } finally {
      setVerifying(null)
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
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-xl">
          <p className="mb-3 text-sm text-muted-foreground">
            <span className="rounded bg-primary/10 px-2 py-0.5 font-medium text-primary">
              Espace membre
            </span>{' '}
            / Flux réservations
          </p>
          <h1 className="font-display text-4xl font-bold tracking-tight">Mes réservations</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Suivez vos créneaux, réglez ceux en attente, annulez au besoin.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 shadow-card">
            <CalendarClock className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">À venir</p>
              <p className="font-display text-xl font-bold">{counts.upcoming ?? 0}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 shadow-card">
            <Wallet className="h-5 w-5 text-emerald-600" />
            <div>
              <p className="text-xs text-muted-foreground">Engagé</p>
              <p className="font-display text-xl font-bold">{formatPrice(committed)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div
          role="tablist"
          className="inline-flex gap-1 rounded-lg border border-border bg-card p-1 shadow-card"
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors',
                tab === t.id
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {t.label}
              <span
                className={cn(
                  'rounded-full px-2 text-xs',
                  tab === t.id ? 'bg-primary/15' : 'bg-secondary'
                )}
              >
                {counts[t.id] ?? 0}
              </span>
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          Trier par
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="h-10 rounded-md border border-input bg-card px-3 text-sm text-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/20"
          >
            <option value="date_desc">Date (récentes en premier)</option>
            <option value="date_asc">Date (croissante)</option>
            <option value="amount_desc">Montant</option>
          </select>
        </label>
      </div>

      {visible.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-16 text-center">
          <CalendarX className="h-12 w-12 text-muted-foreground/40" />
          <p className="font-medium">Aucune réservation ici</p>
          <p className="text-sm text-muted-foreground">
            {tab === 'upcoming'
              ? 'Réservez une salle ou du matériel pour la voir apparaître.'
              : 'Rien à afficher dans cette liste.'}
          </p>
          {tab === 'upcoming' && (
            <Button asChild>
              <Link to="/resources">Parcourir le catalogue</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {visible.map((b) => {
            const st = STATUS[b.status] ?? STATUS.pending
            const image = b.resource?.images?.[0]?.url
            const start = new Date(b.starts_at)
            const end = new Date(b.ends_at)
            return (
              <article
                key={b.id}
                className="overflow-hidden rounded-lg border border-border bg-card shadow-card md:flex"
              >
                <div className="aspect-[16/9] bg-secondary md:aspect-auto md:w-64 md:shrink-0 lg:w-80">
                  {image && (
                    <img src={image} alt="" loading="lazy" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-5 p-5 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="rounded bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
                          #RES-{new Date(b.created_at ?? b.starts_at).getFullYear()}-
                          {String(b.id).padStart(3, '0')}
                        </span>
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold',
                            st.className
                          )}
                        >
                          <span className={cn('h-1.5 w-1.5 rounded-full', st.dot)} />
                          {st.label}
                        </span>
                      </div>
                      <h2 className="font-display text-2xl font-semibold">
                        {b.resource?.name ?? `Ressource #${b.resource_id}`}
                      </h2>
                    </div>
                    <p className="font-display text-2xl font-bold">{formatPrice(b.total_price)}</p>
                  </div>

                  <div className="grid gap-4 rounded-lg border border-border bg-background p-4 sm:grid-cols-3">
                    <Detail icon={CalendarClock} label="Date">
                      {dayFmt.format(start)}
                    </Detail>
                    <Detail icon={Clock} label="Horaire">
                      {timeFmt.format(start)} – {timeFmt.format(end)}
                    </Detail>
                    <Detail icon={Timer} label="Durée">
                      {duration(b.starts_at, b.ends_at)}
                    </Detail>
                  </div>

                  {b.status === 'pending' && (
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                      <p className="text-sm text-muted-foreground">
                        Le créneau n'est garanti qu'une fois le paiement reçu.
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setCancelTarget(b)}
                          className="border-red-200 text-red-700 hover:bg-red-50"
                        >
                          Annuler
                        </Button>
                        {b.paydunya_payment_started && (
                          <Button
                            variant="outline"
                            onClick={() => handleVerify(b)}
                            disabled={verifying === b.id}
                          >
                            {verifying === b.id ? 'Vérification…' : 'Vérifier mon paiement'}
                          </Button>
                        )}
                        <Button onClick={() => handlePay(b)} disabled={checkingOut === b.id}>
                          {checkingOut === b.id ? 'Redirection…' : 'Payer maintenant'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-secondary/60 p-5">
        <div className="flex items-center gap-4">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <LifeBuoy className="h-5 w-5" />
          </span>
          <div>
            <p className="font-display text-lg font-semibold">Un imprévu sur un créneau ?</p>
            <p className="text-sm text-muted-foreground">
              Écrivez-nous en indiquant la référence de la réservation concernée.
            </p>
          </div>
        </div>
        <Button asChild>
          <a href="mailto:support@reservo.test">Contacter le support</a>
        </Button>
      </div>

      <Dialog
        open={!!cancelTarget}
        onOpenChange={(open) => {
          if (!open) setCancelTarget(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Annuler cette réservation ?</DialogTitle>
            <DialogDescription>
              {cancelTarget && (
                <>
                  Vous allez libérer <strong>{cancelTarget.resource?.name}</strong> pour le créneau
                  du {dayFmt.format(new Date(cancelTarget.starts_at))} (
                  {timeFmt.format(new Date(cancelTarget.starts_at))} –{' '}
                  {timeFmt.format(new Date(cancelTarget.ends_at))}). Cette action est définitive.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelTarget(null)} disabled={cancelling}>
              Garder
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={cancelling}>
              {cancelling ? 'Annulation…' : 'Annuler la réservation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
