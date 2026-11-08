# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

**Reservo** is a resource-reservation platform (rooms, equipment). Users browse a resource catalogue, book a slot, and pay online via Stripe. Admins manage the catalogue. The API is versioned at `/api/v1`.

## Stack

| Layer | Technologies |
|---|---|
| Backend | PHP, Laravel, Laravel Sanctum |
| Frontend | React, React Router, JavaScript |
| Database | PostgreSQL (with `btree_gist` extension for exclusion constraints) |
| Payments | Stripe Checkout (test mode), webhook signature verification |
| Quality | Pest (backend), Vitest (frontend), Pint, Larastan (level TBD), ESLint, Prettier |
| Dev infra | Docker Compose, GitHub Actions CI |

## Development commands

```bash
# Start all services
docker compose up -d

# Run migrations and seed
docker compose exec app php artisan migrate --seed

# Backend tests (Pest)
docker compose exec app php artisan test

# Run a single backend test file
docker compose exec app php artisan test tests/Feature/BookingTest.php

# Backend linting / static analysis
docker compose exec app ./vendor/bin/pint
docker compose exec app ./vendor/bin/phpstan analyse

# Frontend tests (Vitest)
cd frontend && npm test

# Frontend lint / format
cd frontend && npm run lint
cd frontend && npm run format

# Frontend dev server
cd frontend && npm run dev
```

## Architecture

### Backend (Laravel)

- **Controllers** are thin: they validate via Form Requests, delegate to Actions, and return API Resources.
- **Actions** (`app/Actions/`) hold business logic (e.g. `CreateBookingAction`, `CancelBookingAction`).
- **API Resources** (`app/Http/Resources/`) shape JSON responses; never return Eloquent models directly.
- **Policies** (`app/Policies/`) enforce authorization; every endpoint calls a Policy method explicitly.
- **Enums** (`app/Enums/`) represent statuses (e.g. `BookingStatus`, `PaymentStatus`).
- Monetary amounts are stored as **whole F CFA (integer, XOF has no minor unit)** in `hourly_price` / `total_price`; never floats.
- All timestamps are `timestamptz`.

### Booking conflict prevention

The core integrity guarantee lives in the database: a PostgreSQL `EXCLUDE USING gist` constraint on a `tstzrange` column prevents overlapping bookings at the DB level. This is validated by a dedicated concurrent-booking test.

### Stripe integration

Payment state is driven **exclusively by the Stripe webhook** (signature-verified, idempotent). The Checkout session creation only initiates the flow; the booking status is never set to "paid" from the frontend redirect.

### Frontend (React)

- React Router handles client-side routing.
- Auth state is managed via Sanctum cookie-based sessions (or token header — confirm once implemented).
- API calls go to `/api/v1/`; base URL configured via environment variable.

## Key conventions

- Commits follow **Conventional Commits** (`feat:`, `fix:`, `test:`, `chore:`, etc.).
- All config via environment variables; never hardcode secrets or URLs.
- Tests focus on high-risk areas: auth, authorization (Policy rules), booking conflicts, and the Stripe webhook handler.
