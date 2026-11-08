import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2, Clock, SearchX } from 'lucide-react'
import { listBookings, syncPayDunya } from '@/api/bookings'
import { Button } from '@/components/ui/button'
import { formatDate, formatPrice } from '@/lib/utils'

const MAX_ATTEMPTS = 8
const DELAY_MS = 2000

/**
 * Landing page after the payment provider. It never trusts the redirect: the booking is only
 * shown as paid once the server says so (PayDunya is asked directly, Stripe confirms by webhook).
 */
export function BookingSuccessPage() {
  const [searchParams] = useSearchParams()
  const paydunyaToken = searchParams.get('token')
  const stripeSessionId = searchParams.get('session_id')

  const [booking, setBooking] = useState(null)
  const [phase, setPhase] = useState('checking') // checking | paid | pending | missing
  const timer = useRef()

  const check = useCallback(() => {
    clearTimeout(timer.current)
    if (!paydunyaToken && !stripeSessionId) {
      setPhase('missing')
      return
    }
    setPhase('checking')

    let attempts = 0
    const poll = async () => {
      let found = null
      try {
        const params = paydunyaToken
          ? { paydunya_invoice_token: paydunyaToken }
          : { stripe_session_id: stripeSessionId }
        const { data } = await listBookings(params)
        found = data.data?.[0] ?? null
        // PayDunya's IPN cannot reach every environment: settle by asking PayDunya from the server.
        if (found && found.status === 'pending' && paydunyaToken) {
          const { data: synced } = await syncPayDunya(found.id)
          found = synced.data
        }
      } catch {
        /* keep polling */
      }

      if (found) setBooking(found)
      if (found?.status === 'paid') {
        setPhase('paid')
        return
      }
      if (++attempts < MAX_ATTEMPTS) {
        timer.current = setTimeout(poll, DELAY_MS)
      } else {
        setPhase(found ? 'pending' : 'missing')
      }
    }
    poll()
  }, [paydunyaToken, stripeSessionId])

  useEffect(() => {
    check()
    return () => clearTimeout(timer.current)
  }, [check])

  const view = {
    checking: {
      icon: <Clock className="h-16 w-16 animate-pulse text-primary" />,
      title: 'Vérification du paiement…',
      text: 'Nous confirmons votre paiement auprès du prestataire. Cela prend quelques secondes.',
    },
    paid: {
      icon: <CheckCircle2 className="h-16 w-16 text-green-500" />,
      title: 'Paiement confirmé',
      text: 'Votre réservation est confirmée. Le créneau est à vous.',
    },
    pending: {
      icon: <Clock className="h-16 w-16 text-amber-500" />,
      title: 'Paiement pas encore confirmé',
      text: "Le prestataire n'a pas encore validé le paiement. Si vous avez bien payé, vérifiez à nouveau dans un instant. Sinon, vous pouvez réessayer depuis Mes réservations.",
    },
    missing: {
      icon: <SearchX className="h-16 w-16 text-muted-foreground" />,
      title: 'Réservation introuvable',
      text: "Nous ne retrouvons pas de réservation liée à ce paiement. Consultez Mes réservations pour voir l'état de vos créneaux.",
    },
  }[phase]

  return (
    <div className="mx-auto max-w-md space-y-6 py-16 text-center">
      <div className="flex justify-center">{view.icon}</div>
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">{view.title}</h1>
        <p className="mt-2 text-muted-foreground">{view.text}</p>
      </div>

      {booking && phase !== 'missing' && (
        <div className="rounded-lg border border-border bg-card p-4 text-left text-sm shadow-card">
          <p className="font-display text-base font-semibold">{booking.resource?.name}</p>
          <p className="mt-1 text-muted-foreground">
            {formatDate(booking.starts_at)} → {formatDate(booking.ends_at)}
          </p>
          <p className="mt-2 font-medium">{formatPrice(booking.total_price)}</p>
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-3">
        {phase === 'pending' && <Button onClick={check}>Vérifier à nouveau</Button>}
        <Button asChild variant={phase === 'pending' ? 'outline' : 'default'}>
          <Link to="/bookings">Voir mes réservations</Link>
        </Button>
      </div>
    </div>
  )
}
