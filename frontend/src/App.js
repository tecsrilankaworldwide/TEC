import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import HeaderBar from './components/HeaderBar';
import DealMarquee from './components/DealMarquee';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ProductListPage from './pages/ProductListPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminLayout from './pages/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminProductsPage from './pages/AdminProductsPage';
import AdminProductFormPage from './pages/AdminProductFormPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import { Toaster } from './components/ui/sonner';

// Generate session ID for cart
const getSessionId = () => {
  let sessionId = localStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('session_id', sessionId);
  }
  return sessionId;
};

function App() {
  const [sessionId] = useState(getSessionId());
  const [cartCount, setCartCount] = useState(0);

  const updateCartCount = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${backendUrl}/api/cart/${sessionId}`);
      const data = await response.json();
      const count = data.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
      setCartCount(count);
    } catch (error) {
      console.error('Error fetching cart count:', error);
    }
  };

  useEffect(() => {
    updateCartCount();
  }, [sessionId]);

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="products/new" element={<AdminProductFormPage />} />
            <Route path="products/edit/:id" element={<AdminProductFormPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="categories" element={<div className="p-8">Categories coming soon...</div>} />
            <Route path="brands" element={<div className="p-8">Brands coming soon...</div>} />
          </Route>

          {/* Store Routes */}
          <Route
            path="/*"
            element={
              <>
                <HeaderBar cartCount={cartCount} onCartUpdate={updateCartCount} />
                <DealMarquee />
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<HomePage sessionId={sessionId} onCartUpdate={updateCartCount} />} />
                    <Route path="/products" element={<ProductListPage sessionId={sessionId} onCartUpdate={updateCartCount} />} />
                    <Route path="/products/:id" element={<ProductDetailPage sessionId={sessionId} onCartUpdate={updateCartCount} />} />
                    <Route path="/cart" element={<CartPage sessionId={sessionId} onCartUpdate={updateCartCount} />} />
                    <Route path="/checkout" element={<CheckoutPage sessionId={sessionId} onCartUpdate={updateCartCount} />} />
                    <Route path="/order-success" element={<OrderSuccessPage />} />
                    <Route path="/track-order" element={<OrderTrackingPage />} />
                  </Routes>
                </main>
                <Footer />
              </>
            }
          />
        </Routes>
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;
