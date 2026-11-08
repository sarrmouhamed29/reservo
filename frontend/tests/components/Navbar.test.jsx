import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import { Navbar } from '@/components/layout/Navbar'
import * as AuthContext from '@/contexts/AuthContext'

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}))

const renderNavbar = (user = null) => {
  vi.mocked(AuthContext.useAuth).mockReturnValue({ user, logout: vi.fn() })
  return render(
    <MemoryRouter>
      <Navbar />
    </MemoryRouter>
  )
}

describe('Navbar', () => {
  it('shows logo', () => {
    renderNavbar()
    expect(screen.getByText('Reservo')).toBeInTheDocument()
  })

  it('shows login/register buttons when unauthenticated', () => {
    renderNavbar(null)
    expect(screen.getByText('Connexion')).toBeInTheDocument()
    expect(screen.getByText("S'inscrire")).toBeInTheDocument()
  })

  it('shows bookings link when authenticated', () => {
    renderNavbar({ id: 1, name: 'Alice', role: 'user' })
    expect(screen.getByText('Mes réservations')).toBeInTheDocument()
  })

  it('shows admin link for admin users', () => {
    renderNavbar({ id: 1, name: 'Test Admin', role: 'admin' })
    expect(screen.getByRole('link', { name: /admin/i })).toBeInTheDocument()
  })
})
