import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Clock, Lock, ShieldCheck } from 'lucide-react'
import { listResources } from '@/api/resources'
import { ResourceCard } from '@/components/resources/ResourceCard'
import { PAYDUNYA_METHODS } from '@/components/payment/paydunyaMethods'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'

const HERO_IMAGE = 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1800&q=80'

const STEPS = [
  {
    title: 'Choisissez',
    text: 'Parcourez les salles et le matériel, filtrez par type ou par nom.',
  },
  {
    title: 'Sélectionnez un créneau',
    text: 'Indiquez le début et la fin. Un créneau déjà pris est refusé immédiatement.',
  },
  {
    title: 'Payez',
    text: 'Orange Money, Wave, Djamo ou carte bancaire. La réservation est confirmée dès réception du paiement.',
  },
]

/** Illustrative slot picker, mirrors the one on a resource page. */
function SlotPreview() {
  const slots = [
    { time: '09:00 – 10:00', state: 'free' },
    { time: '10:00 – 11:00', state: 'picked' },
    { time: '11:00 – 12:00', state: 'picked' },
    { time: '12:00 – 13:00', state: 'taken' },
    { time: '13:00 – 14:00', state: 'free' },
  ]
  return (
    <div className="w-full max-w-sm rounded-xl border border-border bg-card p-5 shadow-pop">
      <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
        <div>
          <p className="text-sm text-muted-foreground">Exemple de réservation</p>
          <p className="font-display text-lg font-semibold">Salle Conférence A</p>
        </div>
        <p className="text-right">
          <span className="font-display text-xl font-bold text-primary">25 000 F CFA</span>
          <span className="block text-xs text-muted-foreground">par heure</span>
        </p>
      </div>
      <ul className="mt-4 space-y-2">
        {slots.map((s) => (
          <li
            key={s.time}
            className={
              s.state === 'picked'
                ? 'flex items-center justify-between rounded-md bg-primary px-3 py-2.5 text-sm font-semibold text-white'
                : s.state === 'taken'
                  ? 'flex items-center justify-between rounded-md bg-[repeating-linear-gradient(135deg,#F4F5F7,#F4F5F7_6px,#E9EBEF_6px,#E9EBEF_12px)] px-3 py-2.5 text-sm text-muted-foreground'
                  : 'flex items-center justify-between rounded-md border border-border px-3 py-2.5 text-sm'
            }
          >
            <span className={s.state === 'taken' ? 'line-through' : ''}>{s.time}</span>
            <span className="text-xs font-medium">
              {s.state === 'picked' ? 'Sélectionné' : s.state === 'taken' ? 'Occupé' : 'Libre'}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
        <span className="text-sm text-muted-foreground">2 heures</span>
        <span className="font-display text-lg font-bold">50 000 F CFA</span>
      </div>
    </div>
  )
}

export function LandingPage() {
  const { user } = useAuth()
  const [featured, setFeatured] = useState([])

  useEffect(() => {
    listResources({ page: 1 })
      .then(({ data }) => setFeatured(data.data.slice(0, 3)))
      .catch(() => {})
  }, [])

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-foreground">
        <img
          src={HERO_IMAGE}
          alt=""
          className="absolute inset-0 -z-20 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#0E1B33] via-[#0E1B33]/85 to-[#0E1B33]/30" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.2fr_1fr] lg:px-8 lg:py-28">
          <div className="max-w-2xl">
            <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
              La salle qu'il vous faut, réservée en deux minutes.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/80">
              Salles de réunion et matériel professionnel, avec des créneaux vérifiés en temps réel
              et un paiement par Orange Money, Wave ou carte.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link to="/resources">
                  Voir le catalogue <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              {!user && (
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="border-white/40 bg-white/10 text-white hover:bg-white/20"
                >
                  <Link to="/register">Créer un compte</Link>
                </Button>
              )}
            </div>
          </div>
          <div className="hidden justify-end lg:flex">
            <SlotPreview />
          </div>
        </div>
      </section>

      {/* Payment methods */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p className="text-sm font-medium text-muted-foreground">Moyens de paiement acceptés</p>
          <ul className="flex flex-wrap items-center gap-x-8 gap-y-3">
            {PAYDUNYA_METHODS.map((m) => (
              <li key={m.id} className="flex items-center gap-2 text-sm font-medium">
                {m.logo}
                {m.label}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl">
            <h2 className="font-display text-3xl font-bold tracking-tight">
              Disponibles maintenant
            </h2>
            <p className="mt-2 text-muted-foreground">
              Un aperçu du catalogue. Tout est réservable à l'heure.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/resources">
              Tout le catalogue <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        {featured.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((r) => (
              <ResourceCard key={r.id} resource={r} />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-80 animate-pulse rounded-lg bg-secondary" />
            ))}
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <h2 className="max-w-xl font-display text-3xl font-bold tracking-tight">
            Trois étapes, sans échange de mails
          </h2>
          <ol className="mt-10 grid gap-8 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="relative border-t-2 border-primary pt-5">
                <span className="font-display text-sm font-bold text-primary">Étape {i + 1}</span>
                <h3 className="mt-1 font-display text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 leading-relaxed text-muted-foreground">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Guarantees */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: ShieldCheck,
              title: 'Jamais de double réservation',
              text: 'Deux personnes ne peuvent pas obtenir le même créneau : la base de données refuse le chevauchement, même si deux demandes arrivent en même temps.',
            },
            {
              icon: Lock,
              title: 'Paiement confirmé par le prestataire',
              text: 'Une réservation passe en « payée » uniquement quand PayDunya ou Stripe confirme le paiement, jamais sur simple retour de page.',
            },
            {
              icon: Clock,
              title: "Annulation tant que ce n'est pas payé",
              text: "Une réservation en attente se règle ou s'annule depuis « Mes réservations ». Le créneau est alors libéré pour les autres.",
            },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-lg border border-border bg-card p-6 shadow-card">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-foreground">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 py-14 sm:px-6 md:flex-row md:items-center lg:px-8">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight text-white">
              Prêt à réserver votre prochaine salle ?
            </h2>
            <p className="mt-2 flex items-center gap-2 text-white/70">
              <CheckCircle2 className="h-4 w-4" /> Inscription gratuite, paiement uniquement à la
              réservation.
            </p>
          </div>
          <Button size="lg" asChild>
            <Link to={user ? '/resources' : '/register'}>
              {user ? 'Ouvrir le catalogue' : 'Créer mon compte'} <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  )
}
