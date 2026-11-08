import { useCallback, useEffect, useState } from 'react'
import { CalendarX, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { cancelBooking, createPayDunyaCheckout, listBookings } from '@/api/bookings'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from '@/hooks/use-toast'
import { formatCents, formatDate } from '@/lib/utils'

const STATUS_CONFIG = {
  pending: { label: 'En attente', variant: 'pending', icon: Clock },
  paid: { label: 'Payé', variant: 'success', icon: CheckCircle2 },
  cancelled: { label: 'Annulé', variant: 'secondary', icon: XCircle },
}

export function BookingsPage() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancelTarget, setCancelTarget] = useState(null)
  const [cancelling, setCancelling] = useState(false)
  const [checkingOut, setCheckingOut] = useState(null)

  const fetchBookings = useCallback(() => {
    setLoading(true)
    listBookings()
      .then(({ data }) => setBookings(data.data))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchBookings() }, [fetchBookings])

  const handleCancel = async () => {
    if (!cancelTarget) return
    setCancelling(true)
    try {
      await cancelBooking(cancelTarget.id)
      toast({ title: 'Réservation annulée' })
      fetchBookings()
    } catch {
      toast({ variant: 'destructive', title: 'Erreur', description: "Impossible d'annuler cette réservation." })
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
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de lancer le paiement.' })
      setCheckingOut(null)
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
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Mes réservations</h1>
        <p className="mt-1 text-muted-foreground">Gérez vos réservations en cours et passées.</p>
      </div>

      {bookings.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <CalendarX className="h-12 w-12 text-muted-foreground/40" />
          <p className="font-medium">Aucune réservation</p>
          <p className="text-sm text-muted-foreground">
            Vous n'avez pas encore effectué de réservation.
          </p>
          <Button asChild variant="outline">
            <a href="/resources">Parcourir les ressources</a>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => {
            const config = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.pending
            const Icon = config.icon
            return (
              <Card key={booking.id}>
                <CardContent className="flex flex-wrap items-center gap-4 p-4">
                  <div className="flex-1 space-y-1">
                    <p className="font-display font-semibold">{booking.resource?.name ?? `Ressource #${booking.resource_id}`}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span>Du {formatDate(booking.starts_at)}</span>
                      <span>au {formatDate(booking.ends_at)}</span>
                    </div>
                    <p className="text-sm font-medium text-primary">{formatCents(booking.total_price_cents)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={config.variant} className="gap-1.5">
                      <Icon className="h-3 w-3" />
                      {config.label}
                    </Badge>
                    {booking.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handlePay(booking)}
                          disabled={checkingOut === booking.id}
                        >
                          {checkingOut === booking.id ? 'Redirection…' : 'Payer'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setCancelTarget(booking)}
                        >
                          Annuler
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Cancel confirmation dialog */}
      <Dialog open={!!cancelTarget} onOpenChange={(open) => { if (!open) setCancelTarget(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer l'annulation</DialogTitle>
            <DialogDescription>
              Cette action est irréversible. La réservation sera annulée et le créneau libéré.
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
