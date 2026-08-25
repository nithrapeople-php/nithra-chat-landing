import { Outlet } from 'react-router-dom'
import { Nav } from './Nav'
import { Footer } from './Footer'

export function Layout() {
  return (
    <div className="shell">
      <Nav />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
