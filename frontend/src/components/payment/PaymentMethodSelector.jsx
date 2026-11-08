import { cn } from '@/lib/utils'

const PAYDUNYA_METHODS = [
  {
    id: 'orange_money',
    label: 'Orange Money',
    color: '#FF7900',
    logo: (
      <svg viewBox="0 0 48 48" fill="none" className="h-6 w-6">
        <circle cx="24" cy="24" r="24" fill="#FF7900" />
        <circle cx="24" cy="24" r="13" fill="white" />
        <circle cx="24" cy="24" r="7" fill="#FF7900" />
      </svg>
    ),
  },
  {
    id: 'wave',
    label: 'Wave',
    color: '#1DC8EE',
    logo: (
      <svg viewBox="0 0 48 48" fill="none" className="h-6 w-6">
        <circle cx="24" cy="24" r="24" fill="#1DC8EE" />
        <path d="M12 20c3 0 5 4 7 4s4-4 7-4 5 4 7 4" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M14 28c3 0 5-4 7-4s4 4 7 4 5-4 7-4" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
      </svg>
    ),
  },
  {
    id: 'free_money',
    label: 'Free Money',
    color: '#E30613',
    logo: (
      <svg viewBox="0 0 48 48" fill="none" className="h-6 w-6">
        <circle cx="24" cy="24" r="24" fill="#E30613" />
        <text x="24" y="30" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold" fontFamily="sans-serif">F</text>
      </svg>
    ),
  },
  {
    id: 'djamo',
    label: 'Djamo',
    color: '#7B2FBE',
    logo: (
      <svg viewBox="0 0 48 48" fill="none" className="h-6 w-6">
        <circle cx="24" cy="24" r="24" fill="#7B2FBE" />
        <text x="24" y="30" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" fontFamily="sans-serif">DJ</text>
      </svg>
    ),
  },
  {
    id: 'expresso',
    label: 'Expresso',
    color: '#00A651',
    logo: (
      <svg viewBox="0 0 48 48" fill="none" className="h-6 w-6">
        <circle cx="24" cy="24" r="24" fill="#00A651" />
        <text x="24" y="30" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold" fontFamily="sans-serif">EX</text>
      </svg>
    ),
  },
  {
    id: 'card',
    label: 'Carte',
    color: '#1A56DB',
    logo: (
      <svg viewBox="0 0 48 36" fill="none" className="h-5 w-7">
        <rect width="48" height="36" rx="4" fill="#1A56DB" />
        <rect y="8" width="48" height="8" fill="#1340A6" />
        <rect x="8" y="22" width="16" height="4" rx="1" fill="white" opacity="0.8" />
      </svg>
    ),
  },
]

export function PaymentMethodSelector({ value, onChange }) {
  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => onChange('paydunya')}
        className={cn(
          'w-full rounded-lg border-2 p-3 text-left transition-all',
          value === 'paydunya'
            ? 'border-primary bg-accent/50'
            : 'border-border bg-card hover:border-primary/40',
        )}
      >
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2',
              value === 'paydunya' ? 'border-primary' : 'border-muted-foreground/40',
            )}
          >
            {value === 'paydunya' && (
              <span className="h-2 w-2 rounded-full bg-primary" />
            )}
          </span>
          <span className="text-sm font-medium">PayDunya</span>
          <span className="ml-auto text-xs text-muted-foreground">Orange Money, Wave, Carte…</span>
        </div>
        {value === 'paydunya' && (
          <div className="mt-3 flex flex-wrap gap-2 pl-6">
            {PAYDUNYA_METHODS.map((method) => (
              <div
                key={method.id}
                className="flex flex-col items-center gap-1 rounded-md bg-background p-1.5"
                title={method.label}
              >
                {method.logo}
                <span className="text-[10px] text-muted-foreground">{method.label}</span>
              </div>
            ))}
          </div>
        )}
      </button>

      <button
        type="button"
        onClick={() => onChange('stripe')}
        className={cn(
          'w-full rounded-lg border-2 p-3 text-left transition-all',
          value === 'stripe'
            ? 'border-primary bg-accent/50'
            : 'border-border bg-card hover:border-primary/40',
        )}
      >
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2',
              value === 'stripe' ? 'border-primary' : 'border-muted-foreground/40',
            )}
          >
            {value === 'stripe' && (
              <span className="h-2 w-2 rounded-full bg-primary" />
            )}
          </span>
          <span className="text-sm font-medium">Stripe</span>
          <span className="ml-auto text-xs text-muted-foreground">Visa, Mastercard</span>
        </div>
        {value === 'stripe' && (
          <div className="mt-3 flex gap-2 pl-6">
            <svg viewBox="0 0 48 20" className="h-5" fill="none">
              <rect width="48" height="20" rx="3" fill="#635BFF" />
              <text x="24" y="14" textAnchor="middle" fill="white" fontSize="10" fontWeight="600" fontFamily="sans-serif">stripe</text>
            </svg>
          </div>
        )}
      </button>
    </div>
  )
}
