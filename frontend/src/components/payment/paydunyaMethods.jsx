export const PAYDUNYA_METHODS = [
  {
    id: 'orange_money',
    label: 'Orange Money',
    color: '#FF7900',
    logo: <img src="/payments/om.png" alt="" className="h-6 w-6 rounded object-contain" />,
  },
  {
    id: 'wave',
    label: 'Wave',
    color: '#1DC8EE',
    logo: <img src="/payments/wave.png" alt="" className="h-6 w-6 rounded object-contain" />,
  },
  {
    id: 'free_money',
    label: 'Free Money',
    color: '#E30613',
    logo: (
      <svg viewBox="0 0 48 48" fill="none" className="h-6 w-6">
        <circle cx="24" cy="24" r="24" fill="#E30613" />
        <text
          x="24"
          y="30"
          textAnchor="middle"
          fill="white"
          fontSize="16"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          F
        </text>
      </svg>
    ),
  },
  {
    id: 'djamo',
    label: 'Djamo',
    color: '#7B2FBE',
    logo: <img src="/payments/djamo.png" alt="" className="h-6 w-6 rounded object-contain" />,
  },
  {
    id: 'expresso',
    label: 'Expresso',
    color: '#00A651',
    logo: (
      <svg viewBox="0 0 48 48" fill="none" className="h-6 w-6">
        <circle cx="24" cy="24" r="24" fill="#00A651" />
        <text
          x="24"
          y="30"
          textAnchor="middle"
          fill="white"
          fontSize="13"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          EX
        </text>
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
