import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CartProvider } from './components/CartContext'
import { AuthProvider } from './components/AuthContext'
import Header from './components/Header'
import Footer from './components/Footer'
import Landing from './pages/Landing'
import Shop from './pages/Shop'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Login from './pages/Login'
import Admin from './pages/Admin'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <div className="app">
            <Header />
            <main>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/tienda" element={<Shop />} />
                <Route path="/producto/:id" element={<ProductDetail />} />
                <Route path="/carrito" element={<Cart />} />
                <Route path="/login" element={<Login />} />
                <Route path="/admin" element={<Admin />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
