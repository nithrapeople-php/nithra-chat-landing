import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Contact } from './pages/Contact'
import { Features } from './pages/Features'
import { Home } from './pages/Home'
import { Pricing } from './pages/Pricing'
import { Provisioning } from './pages/Provisioning'
import { SignIn } from './pages/SignIn'
import { SignUp } from './pages/SignUp'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="features" element={<Features />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="signup" element={<SignUp />} />
          <Route path="signin" element={<SignIn />} />
          <Route path="provisioning" element={<Provisioning />} />
          <Route path="contact" element={<Contact />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
