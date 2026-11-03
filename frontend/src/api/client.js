import axios from 'axios'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

// On 401, redirect to login — but not during the initial session check
client.interceptors.response.use(
  (res) => res,
  (error) => {
    const isUserCheck = error.config?.url?.endsWith('/user')
    if (error.response?.status === 401 && !isUserCheck) {
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default client
