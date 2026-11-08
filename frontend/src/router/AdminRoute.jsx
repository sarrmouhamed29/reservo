import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from './ProtectedRoute'

export function AdminRoute({ children }) {
  const { user } = useAuth()

  return (
    <ProtectedRoute>
      {user?.role !== 'admin' ? <Navigate to="/" replace /> : children}
    </ProtectedRoute>
  )
}
