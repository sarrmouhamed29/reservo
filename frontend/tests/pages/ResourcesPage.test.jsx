import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import { ResourcesPage } from '@/pages/resources/ResourcesPage'

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: null }),
}))

vi.mock('react-router-dom', async (importOriginal) => {
  const mod = await importOriginal()
  return { ...mod, useSearchParams: () => [new URLSearchParams(), vi.fn()] }
})

describe('ResourcesPage', () => {
  it('shows resources after loading', async () => {
    render(<MemoryRouter><ResourcesPage /></MemoryRouter>)

    await waitFor(() => {
      expect(screen.getByText('Salle A')).toBeInTheDocument()
    })
  })

  it('shows loading spinner initially', () => {
    render(<MemoryRouter><ResourcesPage /></MemoryRouter>)
    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
  })
})
