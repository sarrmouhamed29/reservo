import { cn } from '@/lib/utils'
import { PAYDUNYA_METHODS } from './paydunyaMethods'

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
            : 'border-border bg-card hover:border-primary/40'
        )}
      >
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2',
              value === 'paydunya' ? 'border-primary' : 'border-muted-foreground/40'
            )}
          >
            {value === 'paydunya' && <span className="h-2 w-2 rounded-full bg-primary" />}
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
            : 'border-border bg-card hover:border-primary/40'
        )}
      >
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2',
              value === 'stripe' ? 'border-primary' : 'border-muted-foreground/40'
            )}
          >
            {value === 'stripe' && <span className="h-2 w-2 rounded-full bg-primary" />}
          </span>
          <span className="text-sm font-medium">Stripe</span>
          <span className="ml-auto text-xs text-muted-foreground">Visa, Mastercard</span>
        </div>
        {value === 'stripe' && (
          <div className="mt-3 flex gap-2 pl-6">
            <svg viewBox="0 0 48 20" className="h-5" fill="none">
              <rect width="48" height="20" rx="3" fill="#635BFF" />
              <text
                x="24"
                y="14"
                textAnchor="middle"
                fill="white"
                fontSize="10"
                fontWeight="600"
                fontFamily="sans-serif"
              >
                stripe
              </text>
            </svg>
          </div>
        )}
      </button>
    </div>
  )
}
