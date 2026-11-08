import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { Toaster } from '@/components/ui/toaster'

/** `bare` removes the page container so a page (the landing) can run full-bleed. */
export function AppLayout({ bare = false }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      {bare ? (
        <main className="flex-1">
          <Outlet />
        </main>
      ) : (
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      )}
      <Footer />
      <Toaster />
    </div>
  )
}
