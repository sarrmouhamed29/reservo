import axios from 'axios'
import client from './client'

export const getCsrfCookie = () => axios.get('/sanctum/csrf-cookie', { withCredentials: true })

export const register = (data) => client.post('/auth/register', data)

export const login = (data) => client.post('/auth/login', data)

export const logout = () => client.post('/auth/logout')

export const getUser = () => client.get('/user')
