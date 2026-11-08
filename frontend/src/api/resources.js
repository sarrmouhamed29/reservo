import client from './client'

export const listResources = (params) => client.get('/resources', { params })

export const getResource = (id) => client.get(`/resources/${id}`)

export const createResource = (data) =>
  client.post('/resources', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

export const updateResource = (id, data) => client.put(`/resources/${id}`, data)

export const deleteResource = (id) => client.delete(`/resources/${id}`)

export const getAvailability = (id, date) =>
  client.get(`/resources/${id}/availability`, { params: { date } })
