# Reservo

A resource reservation platform for rooms and equipment with online payments via Stripe.
Users browse a resource catalogue, book a time slot, and pay through Stripe Checkout.
Admins manage the catalogue through a dedicated interface.

[![CI](https://github.com/sarrmouhamed29/reservo/actions/workflows/ci.yml/badge.svg)](https://github.com/sarrmouhamed29/reservo/actions/workflows/ci.yml)

## Features

- **Resource catalogue** — browse rooms and equipment, filter by type, name, and availability window
- **Booking system** — slot selection with real-time conflict detection enforced at the database level
- **Stripe Checkout** — payment state driven exclusively by webhook (never from redirect)
- **Role-based access** — users book, admins manage the catalogue and images
- **SPA architecture** — React 18 frontend with cookie-based Sanctum authentication

## Stack

| Layer | Technologies |
|---|---|
| Backend | PHP 8.3, Laravel 11, Laravel Sanctum |
| Frontend | React 18, React Router v6, shadcn/ui, Vite |
| Database | PostgreSQL 16 (`btree_gist` for exclusion constraint) |
| Payments | Stripe Checkout (test mode), webhook signature verification |
| Quality | Pest, Vitest + MSW, Pint, Larastan, ESLint, Prettier |
| Dev infra | Docker Compose, GitHub Actions CI |

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (React SPA)                      │
│  ┌────────────┐  ┌────────────┐  ┌──────────┐  ┌────────────┐  │
│  │ Resources  │  │  Bookings  │  │  Admin   │  │    Auth    │  │
│  │  Catalogue │  │   & Pay    │  │ Resources│  │ Login/Reg  │  │
│  └─────┬──────┘  └─────┬──────┘  └────┬─────┘  └─────┬──────┘  │
│        └───────────────┴──────────────┴──────────────┘         │
│                        Axios + Sanctum cookie                    │
└───────────────────────────┬─────────────────────────────────────┘
                            │  HTTP  /api/v1
┌───────────────────────────▼─────────────────────────────────────┐
│                       nginx reverse proxy                       │
│        /api, /sanctum → PHP-FPM (app:9000)                      │
│        /*             → React dist (index.html)                 │
└──────────┬────────────────────────────────────────┬─────────────┘
           │                                        │ POST /stripe/webhook
┌──────────▼─────────────────────────────┐  ┌──────▼─────────────┐
│          Laravel 11 (PHP-FPM)           │  │  Stripe Platform   │
│                                        │  │  (Checkout, webhk) │
│  Controller → FormRequest → Action     │  └────────────────────┘
│       └→ API Resource (JSON)           │
│                                        │
│  Auth: Sanctum cookie SPA              │
│  Policies: ResourcePolicy,BookingPolicy│
│  Enums: BookingStatus, ResourceType    │
│                                        │
└──────────┬─────────────────────────────┘
           │  PDO / pgsql
┌──────────▼─────────────────────────────┐
│          PostgreSQL 16                  │
│                                        │
│  users       resources                 │
│  bookings ◄─ EXCLUDE USING gist        │
│    tstzrange overlap prevention        │
│  resource_images                       │
└────────────────────────────────────────┘
```

### Booking Conflict Prevention

Overlapping bookings are impossible at the database level — no application lock needed:

```sql
EXCLUDE USING gist (
  resource_id WITH =,
  tstzrange(starts_at, ends_at, '[)') WITH &&
) WHERE (status != 'cancelled')
```

`QueryException` with code `23P01` → `BookingConflictException` → HTTP 409.

### Stripe Payment Flow

```
User clicks "Pay"
     │
     ▼
POST /api/v1/bookings/{id}/checkout
     │  Creates Stripe Checkout session
     │  Stores stripe_session_id on booking
     ▼
window.location = checkout_url   ← redirect to Stripe
     │
     ▼  (user pays on Stripe)
Stripe → POST /stripe/webhook  (signature verified)
     │
     ▼
HandleStripeWebhookAction (idempotent)
     │  Sets booking status = paid
     ▼
GET /api/v1/bookings/{id}  ← frontend polls for status
```

**Payment state is never set from the success redirect page.** Only the webhook can mark a booking `paid`.

## Project Structure

```
reservo/
├── .github/workflows/ci.yml     # CI: backend (Pest) + frontend (Vitest)
├── backend/                     # Laravel 11
│   ├── app/
│   │   ├── Actions/             # Business logic (CreateBooking, HandleStripeWebhook…)
│   │   ├── Enums/               # BookingStatus, ResourceType
│   │   ├── Http/
│   │   │   ├── Controllers/Api/V1/
│   │   │   ├── Requests/        # Form validation
│   │   │   └── Resources/       # JSON response shaping
│   │   └── Policies/            # Authorization (ResourcePolicy, BookingPolicy)
│   ├── database/migrations/
│   └── tests/Feature/           # Pest tests: auth, resources, bookings, Stripe
├── frontend/                    # React 18 + Vite
│   ├── src/
│   │   ├── api/                 # Axios client + per-resource modules
│   │   ├── contexts/            # AuthContext (Sanctum session restore)
│   │   ├── pages/               # Resources, Bookings, Admin, Auth
│   │   └── router/              # AppRouter + ProtectedRoute + AdminRoute
│   └── tests/                   # Vitest + MSW mocks
├── nginx/default.conf
├── docker-compose.yml
└── .env.example
```

## Quick Start

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) with Compose v2
- A [Stripe test account](https://dashboard.stripe.com) for Checkout keys

### 1. Clone and configure

```bash
git clone https://github.com/sarrmouhamed29/reservo.git
cd reservo

# Root .env for Docker Compose
cp .env.example .env

# Backend .env
cp backend/.env.example backend/.env
```

Edit `backend/.env` and fill in your Stripe test keys:

```env
STRIPE_KEY=pk_test_...
STRIPE_SECRET=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...   # from: stripe listen --print-secret
```

### 2. Build and start

```bash
docker compose up -d --build
```

### 3. Run migrations and seed

```bash
docker compose exec app php artisan migrate --seed
```

This creates:
- Admin account: `admin@reservo.test` / `password`
- 3 regular users: `user1@reservo.test` … `user3@reservo.test` / `password`
- 7 resources (4 rooms, 3 equipment items)

### 4. Build and serve the frontend

```bash
cd frontend
npm install
npm run build

# Copy dist into the Docker volume nginx serves
docker run --rm \
  -v "$(pwd)/dist:/src:ro" \
  -v reservo_frontend_dist:/dst \
  alpine sh -c "cp -r /src/. /dst/"
```

### 5. Open the app

Navigate to [http://localhost](http://localhost).

### 6. Test Stripe webhooks (optional)

Install the [Stripe CLI](https://stripe.com/docs/stripe-cli) and forward events:

```bash
stripe listen --forward-to localhost/stripe/webhook
```

## Development

### Backend (Laravel)

```bash
# Run all tests
docker compose exec app php artisan test

# Single test file
docker compose exec app php artisan test tests/Feature/Booking/CreateBookingTest.php

# Lint
docker compose exec app ./vendor/bin/pint

# Static analysis
docker compose exec app ./vendor/bin/phpstan analyse
```

### Frontend (React)

```bash
cd frontend

npm run dev      # dev server with HMR (proxies /api to nginx)
npm test         # Vitest
npm run lint     # ESLint
npm run format   # Prettier
```

### Test Accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@reservo.test | password |
| User | user1@reservo.test | password |

## API Reference

All endpoints are prefixed with `/api/v1`. Authentication uses Sanctum cookie sessions — call `GET /sanctum/csrf-cookie` before any state-changing request.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/resources` | — | List resources (filter: `type`, `name`, `from`, `to`) |
| GET | `/resources/{id}` | — | Resource detail |
| POST | `/resources` | admin | Create resource |
| PUT | `/resources/{id}` | admin | Update resource |
| DELETE | `/resources/{id}` | admin | Delete resource |
| POST | `/auth/register` | guest | Register |
| POST | `/auth/login` | guest | Login |
| POST | `/auth/logout` | user | Logout |
| GET | `/user` | user | Current user |
| GET | `/bookings` | user | My bookings |
| POST | `/bookings` | user | Create booking |
| GET | `/bookings/{id}` | user | Booking detail |
| DELETE | `/bookings/{id}` | user | Cancel booking |
| POST | `/bookings/{id}/checkout` | user | Start Stripe Checkout |
| POST | `/stripe/webhook` | — | Stripe webhook (no CSRF) |

### Booking creation payload

```json
{
  "resource_id": 1,
  "starts_at": "2026-11-15T09:00:00Z",
  "ends_at":   "2026-11-15T11:00:00Z"
}
```

Returns `409 Conflict` if the slot overlaps an existing paid/pending booking.

## CI

GitHub Actions runs on every push and pull request to `main` and `develop`:

- **backend** — Pint lint check, Larastan static analysis, Pest test suite (≥80% coverage)
- **frontend** — ESLint, Prettier check, Vitest coverage, Vite production build

## License

MIT — see [LICENSE](LICENSE).
