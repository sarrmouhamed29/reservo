import client from './client'

export const listBookings = (params) => client.get('/bookings', { params })

export const getBooking = (id) => client.get(`/bookings/${id}`)

export const createBooking = (data) => client.post('/bookings', data)

export const cancelBooking = (id) => client.delete(`/bookings/${id}`)

export const createCheckout = (id) => client.post(`/bookings/${id}/checkout`)

export const createPayDunyaCheckout = (id) => client.post(`/bookings/${id}/paydunya-checkout`)
