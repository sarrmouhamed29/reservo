import { http, HttpResponse } from 'msw'

const BASE = '/api/v1'

export const handlers = [
  http.get(`${BASE}/resources`, () => {
    return HttpResponse.json({
      data: [
        {
          id: 1,
          name: 'Salle A',
          type: 'room',
          description: 'Grande salle de conférence',
          capacity: 20,
          hourly_price: 5000,
          is_active: true,
          images: [],
        },
      ],
      meta: { current_page: 1, last_page: 1, per_page: 12, total: 1 },
    })
  }),

  http.get(`${BASE}/resources/:id`, ({ params }) => {
    return HttpResponse.json({
      data: {
        id: Number(params.id),
        name: 'Salle A',
        type: 'room',
        description: 'Grande salle de conférence',
        capacity: 20,
        hourly_price: 5000,
        is_active: true,
        images: [],
      },
    })
  }),

  http.get('/sanctum/csrf-cookie', () => {
    return new HttpResponse(null, { status: 204 })
  }),

  http.post(`${BASE}/auth/login`, () => {
    return HttpResponse.json({
      data: { id: 1, name: 'Test User', email: 'test@example.com', role: 'user' },
    })
  }),

  http.post(`${BASE}/auth/register`, () => {
    return HttpResponse.json({
      data: { id: 2, name: 'New User', email: 'new@example.com', role: 'user' },
    })
  }),

  http.post(`${BASE}/auth/logout`, () => {
    return new HttpResponse(null, { status: 204 })
  }),

  http.get(`${BASE}/user`, () => {
    return HttpResponse.json({
      data: { id: 1, name: 'Test User', email: 'test@example.com', role: 'user' },
    })
  }),

  http.get(`${BASE}/bookings`, () => {
    return HttpResponse.json({
      data: [
        {
          id: 1,
          resource: { id: 1, name: 'Salle A' },
          starts_at: '2026-11-10T09:00:00Z',
          ends_at: '2026-11-10T11:00:00Z',
          total_price: 10000,
          status: 'pending',
        },
      ],
    })
  }),

  http.post(`${BASE}/bookings`, () => {
    return HttpResponse.json(
      {
        data: {
          id: 2,
          resource: { id: 1, name: 'Salle A' },
          starts_at: '2026-11-15T09:00:00Z',
          ends_at: '2026-11-15T11:00:00Z',
          total_price: 10000,
          status: 'pending',
        },
      },
      { status: 201 }
    )
  }),

  http.post(`${BASE}/bookings/:id/checkout`, () => {
    return HttpResponse.json({ checkout_url: 'https://checkout.stripe.com/test' })
  }),
]
