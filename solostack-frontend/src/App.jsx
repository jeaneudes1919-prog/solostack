import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ShoppingBag, LogOut, User, LayoutDashboard, Store } from 'lucide-react';

// STORES
import useAuthStore from './store/authStore';
import useCartStore from './store/cartStore';

// Pages - Auth & Public
import Login from './pages/Login';
import Register from './pages/Register';
import PrivateRoute from './components/PrivateRoute';
import ProductDetails from './pages/ProductDetails';
import Home from './pages/Home';
import UserAvatar from './components/ui/UserAvatar';
import SearchPage from './pages/SearchPage'; // NOUVEAU
import StoresPage from './pages/StoresPage'; // NOUVEAU
import PromotionsPage from './pages/PromotionsPage';
// Pages - Client
import MyOrders from './pages/dashboard/MyOrders';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import StorePage from './pages/StorePage'; // <--- Import nouveau
// Pages - Vendeur
import VendorLayout from './pages/vendor/VendorLayout';
import CreateStore from './pages/vendor/CreateStore';
import DashboardHome from './pages/vendor/DashboardHome';
import AddProduct from './pages/vendor/AddProduct';
import VendorOrders from './pages/vendor/VendorOrders';
import VendorProducts from './pages/vendor/VendorProducts';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const cartItems = useCartStore((state) => state.items);

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-primary-500/30 group-hover:rotate-12 transition">S</div>
            <span className="text-xl font-bold text-gray-800">Solo<span className="text-primary-500">Stack</span></span>
          </Link>

          {/* Liens Droite */}
          <div className="flex items-center space-x-6">

            {/* MODIFICATION ICI : On cache le panier si c'est un vendeur */}
            {(!user || user.role !== 'vendor') && (

              <Link to="/cart" className="relative text-gray-500 hover:text-primary-500 transition">
                <ShoppingBag size={24} />
                {/* Badge dynamique du panier */}
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-bounce">
                    {cartItems.length}
                  </span>
                )}
              </Link>
            )}
            <Link
              to="/stores"
              className="text-gray-600 font-medium hover:text-primary-500 transition flex items-center"
              title="Boutiques"
            >
              {/* VERSION MOBILE : On affiche l'icône, on la cache sur écran moyen et + (md:hidden) */}
              <span className="md:hidden">
                <Store size={24} />
              </span>

              {/* VERSION PC : On cache le texte par défaut (hidden), on l'affiche sur écran moyen et + (md:block) */}
              <span className="hidden md:block">
                Boutiques
              </span>
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                {/* Lien conditionnel selon le rôle */}
                {user?.role === 'vendor' ? (
                  <Link to="/vendor/dashboard" className="text-sm font-medium text-gray-700 hover:text-primary-500 flex items-center gap-2">
                    <LayoutDashboard size={18} />
                    Espace Vendeur
                  </Link>
                ) : (
                  <Link to="/dashboard/orders" className="text-sm font-medium text-gray-700 hover:text-primary-500 flex items-center gap-2">
                    <UserAvatar firstName={user?.first_name} lastName={user?.last_name} size="sm" />
                    {user?.first_name}
                  </Link>
                )}

                <button onClick={logout} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition" title="Se déconnecter">
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-4">
                {/* Connexion */}
                <Link
                  to="/login"
                  className="
      text-gray-600 hover:text-primary-500 transition
      text-xs sm:text-sm md:text-base
      px-2 sm:px-3 py-1.5
      rounded-md
    "
                >
                  Connexion
                </Link>

                {/* Inscription */}
                <Link
                  to="/register"
                  className="
      bg-primary-500 text-white hover:bg-primary-600 transition
      text-xs sm:text-sm md:text-base
      px-3 sm:px-4 md:px-5
      py-1.5 sm:py-2 md:py-2.5
      rounded-md sm:rounded-lg
      shadow sm:shadow-lg
    "
                >
                  Inscription
                </Link>
              </div>

            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => { checkAuth(); }, []);

  return (
    <Router>
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
        <Navbar />
        <Routes>
          {/* ROUTES PUBLIQUES */}
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/store/:id" element={<StorePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/stores" element={<StoresPage />} />
          <Route path="/promotions" element={<PromotionsPage />} />
          {/* ROUTES PROTÉGÉES (Checkout) */}
          <Route path="/checkout" element={
            <PrivateRoute>
              <Checkout />
            </PrivateRoute>
          } />

          {/* ROUTES CLIENT (ACHETEUR) */}
          <Route path="/dashboard/orders" element={
            <PrivateRoute>
              <MyOrders />
            </PrivateRoute>
          } />

          {/* ROUTES VENDEUR (ESPACE PRO) */}
          <Route path="/vendor" element={
            <PrivateRoute>
              <VendorLayout />
            </PrivateRoute>
          }>
            <Route path="create-store" element={<CreateStore />} />
            <Route path="dashboard" element={<DashboardHome />} />
            <Route path="add-product" element={<AddProduct />} />
            <Route path="orders" element={<VendorOrders />} />
            <Route path="products" element={<VendorProducts />} />
          </Route>

          {/* Redirection par défaut (404) */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;