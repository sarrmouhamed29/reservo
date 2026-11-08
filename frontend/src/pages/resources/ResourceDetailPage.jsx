import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Users, Clock, ArrowLeft, Building2, Wrench } from 'lucide-react'
import { getResource } from '@/api/resources'
import { createBooking, createCheckout, createPayDunyaCheckout } from '@/api/bookings'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/hooks/use-toast'
import { formatCents } from '@/lib/utils'
import { PaymentMethodSelector } from '@/components/payment/PaymentMethodSelector'

export function ResourceDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [resource, setResource] = useState(null)
  const [loading, setLoading] = useState(true)
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
      const bookingId = bookingData.data.id
      const checkout = paymentMethod === 'stripe' ? createCheckout : createPayDunyaCheckout
      const { data: checkoutData } = await checkout(bookingId)
      window.location.href = checkoutData.checkout_url
    } catch (err) {
      const data = err.response?.data
      if (data?.errors) setBookingErrors(data.errors)
      else if (err.response?.status === 409) {
        toast({ variant: 'destructive', title: 'Créneau indisponible', description: data?.message || 'Ce créneau est déjà réservé.' })
      } else {
        toast({ variant: 'destructive', title: 'Erreur', description: data?.message || 'Impossible de créer la réservation.' })
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

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="-ml-2 gap-2">
        <ArrowLeft className="h-4 w-4" />
        Retour
      </Button>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main info */}
        <div className="space-y-4 lg:col-span-2">
          {/* Images */}
          {resource.images?.length > 0 ? (
            <div className="overflow-hidden rounded-lg">
              <img
                src={resource.images[0].url}
                alt={resource.name}
                className="h-64 w-full object-cover"
              />
            </div>
          ) : (
            <div className="flex h-48 items-center justify-center rounded-lg bg-muted">
              <TypeIcon className="h-16 w-16 text-muted-foreground/30" />
            </div>
          )}

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-3xl font-bold tracking-tight">{resource.name}</h1>
              <Badge variant="secondary">{resource.type === 'room' ? 'Salle' : 'Matériel'}</Badge>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {resource.capacity && (
                <span className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  Capacité : {resource.capacity} personnes
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {formatCents(resource.hourly_price_cents)} / heure
              </span>
            </div>
          </div>

          {resource.description && (
            <p className="leading-relaxed text-muted-foreground">{resource.description}</p>
          )}
        </div>

        {/* Booking panel */}
        <div>
          {user && user.role !== 'admin' ? (
            <Card>
              <CardHeader>
                <CardTitle>Réserver</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBook} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label>Mode de paiement</Label>
                    <PaymentMethodSelector value={paymentMethod} onChange={setPaymentMethod} />
                  </div>
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
                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? 'Redirection vers le paiement…' : 'Réserver et payer'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : !user ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-sm text-muted-foreground">
                  <a href="/login" className="text-primary hover:underline">Connectez-vous</a> pour réserver cette ressource.
                </p>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  )
}
