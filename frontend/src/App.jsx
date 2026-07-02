import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider }    from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider }     from './context/AuthContext';
import { CartProvider }     from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ToastProvider }    from './context/ToastContext';
import Header       from './components/Header';
import ShopPage     from './pages/ShopPage';
import PilotsPage   from './pages/PilotsPage';
import CartPage     from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import SuccessPage  from './pages/SuccessPage';
import AuthPage     from './pages/AuthPage';
import AccountPage  from './pages/AccountPage';
import AdminPage    from './pages/AdminPage';
import ProductPage  from './pages/ProductPage';
import WishlistPage from './pages/WishlistPage';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <ToastProvider>
                  <Header />
                  <Routes>
                    <Route path="/"              element={<ShopPage />} />
                    <Route path="/product/:id"   element={<ProductPage />} />
                    <Route path="/pilots"        element={<PilotsPage />} />
                    <Route path="/cart"          element={<CartPage />} />
                    <Route path="/checkout"      element={<CheckoutPage />} />
                    <Route path="/success"       element={<SuccessPage />} />
                    <Route path="/login"         element={<AuthPage />} />
                    <Route path="/account"       element={<AccountPage />} />
                    <Route path="/admin"         element={<AdminPage />} />
                    <Route path="/wishlist"      element={<WishlistPage />} />
                  </Routes>
                </ToastProvider>
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
