import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { CartProvider } from './components/CartContext'
import { AuthProvider } from './components/AuthContext'
import { ToastProvider } from './components/ToastContext'
import Header from './components/Header'
import Footer from './components/Footer'
import Landing from './pages/Landing'
import Shop from './pages/Shop'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Admin from './pages/Admin'
import ClaimBook from './pages/ClaimBook'
import TermsAndPolicies from './pages/TermsAndPolicies'
import Profile from './pages/Profile'
import Auctions from './pages/Auctions'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './App.css'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '410146064965-ugieeoqlb6r2f9ucc8o8udq0nklnvgqu.apps.googleusercontent.com'

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.2 },
  },
}

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <motion.main
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="main-route-wrapper"
      >
        <Routes location={location}>
          <Route path="/" element={<Landing />} />
          <Route path="/tienda" element={<Shop />} />
          <Route path="/subastas" element={<Auctions />} />
          <Route path="/producto/:id" element={<ProductDetail />} />
          <Route path="/carrito" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/perfil" element={<Profile />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/libro-de-reclamaciones" element={<ClaimBook />} />
          <Route path="/terminos-y-condiciones" element={<TermsAndPolicies />} />
          <Route path="/politicas-de-devolucion" element={<TermsAndPolicies />} />
        </Routes>
      </motion.main>
    </AnimatePresence>
  )
}

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <CartProvider>
              <div className="app">
                <Header />
                <AnimatedRoutes />
                <Footer />
              </div>
            </CartProvider>
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  )
}

export default App

