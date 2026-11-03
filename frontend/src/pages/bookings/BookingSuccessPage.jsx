import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2, Clock } from 'lucide-react'
import { listBookings } from '@/api/bookings'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function BookingSuccessPage() {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id')

  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!sessionId) { setLoading(false); return }

    // Poll briefly — webhook may take a few seconds to fire
    let attempts = 0
    const poll = async () => {
      try {
        const { data } = await listBookings({ stripe_session_id: sessionId })
        const found = data.data?.[0]
        if (found) {
          setBooking(found)
          setLoading(false)
          return
        }
      } catch {}
      if (++attempts < 5) setTimeout(poll, 2000)
      else setLoading(false)
    }
    poll()
  }, [sessionId])

  return (
    <div className="mx-auto max-w-md space-y-6 py-16 text-center">
      <div className="flex justify-center">
        <CheckCircle2 className="h-16 w-16 text-green-500" />
      </div>
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Réservation confirmée</h1>
        <p className="mt-2 text-muted-foreground">
          Votre réservation a bien été enregistrée. Vous recevrez une confirmation par email.
        </p>
      </div>

      {loading ? (
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Clock className="h-5 w-5 animate-pulse text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Vérification du paiement…</p>
          </CardContent>
        </Card>
      ) : booking ? (
        <Card>
          <CardContent className="p-4 text-left text-sm">
            <p className="font-medium">{booking.resource?.name}</p>
            <p className="text-muted-foreground">Statut : {booking.status === 'paid' ? '✓ Payé' : 'En attente de confirmation'}</p>
          </CardContent>
        </Card>
      ) : null}

      <Button asChild>
        <Link to="/bookings">Voir mes réservations</Link>
      </Button>
    </div>
  )
}
