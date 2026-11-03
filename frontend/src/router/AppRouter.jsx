import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { AppLayout } from '@/components/layout/AppLayout'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { AdminRoute } from './AdminRoute'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { ResourcesPage } from '@/pages/resources/ResourcesPage'
import { ResourceDetailPage } from '@/pages/resources/ResourceDetailPage'
import { BookingsPage } from '@/pages/bookings/BookingsPage'
import { BookingSuccessPage } from '@/pages/bookings/BookingSuccessPage'
import { AdminResourcesPage } from '@/pages/admin/AdminResourcesPage'
import { AdminResourceFormPage } from '@/pages/admin/AdminResourceFormPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

export function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Auth routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* App routes */}
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/resources" replace />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/resources/:id" element={<ResourceDetailPage />} />

            <Route
              path="/bookings"
              element={<ProtectedRoute><BookingsPage /></ProtectedRoute>}
            />
            <Route
              path="/bookings/success"
              element={<ProtectedRoute><BookingSuccessPage /></ProtectedRoute>}
            />

            <Route
              path="/admin/resources"
              element={<AdminRoute><AdminResourcesPage /></AdminRoute>}
            />
            <Route
              path="/admin/resources/new"
              element={<AdminRoute><AdminResourceFormPage /></AdminRoute>}
            />
            <Route
              path="/admin/resources/:id/edit"
              element={<AdminRoute><AdminResourceFormPage /></AdminRoute>}
            />

            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
