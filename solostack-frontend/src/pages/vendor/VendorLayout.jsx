import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, PackagePlus, ShoppingBag, Store, List, 
  Edit3, Menu, X, LogOut 
} from 'lucide-react';
import api from '../../api/axios';
import useAuthStore from '../../store/authStore';
import EditStoreModal from '../../components/dashboard/EditStoreModal';
const VendorLayout = () => {
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // --- NOUVEAU : État pour le menu mobile ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore(); // Ajout du logout

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const res = await api.get('/stores/me');
        setStore(res.data);
      } catch (err) {
        if (location.pathname !== '/vendor/create-store') {
          navigate('/vendor/create-store');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchStore();
  }, [navigate, location.pathname]);

  const handleStoreUpdate = (updatedStore) => {
    setStore(updatedStore);
  };

  // Fermer le menu mobile quand on change de page
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  if (loading) return <div className="p-10 text-center text-primary-500 animate-pulse">Chargement...</div>;

  const menuItems = [
    { icon: LayoutDashboard, label: 'Tableau de bord', path: '/vendor/dashboard' },
    { icon: List, label: 'Mes Produits', path: '/vendor/products' },
    { icon: PackagePlus, label: 'Ajouter un produit', path: '/vendor/add-product' },
    { icon: ShoppingBag, label: 'Commandes', path: '/vendor/orders' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      
      {/* --- 1. HEADER MOBILE (Visible uniquement sur mobile) --- */}
      <div className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
         <div className="flex items-center gap-2 font-bold text-gray-800">
             <Store className="text-primary-600" size={24} />
             <span>Espace Vendeur</span>
         </div>
         <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-gray-100 rounded-lg">
             <Menu size={24} />
         </button>
      </div>

      {/* --- 2. OVERLAY MOBILE (Fond noir quand menu ouvert) --- */}
      {isSidebarOpen && (
        <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* --- 3. SIDEBAR (Responsive) --- */}
      <aside className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out
          md:translate-x-0 md:static md:h-screen md:sticky md:top-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        
        {/* En-tête Sidebar (Avec bouton fermer sur mobile) */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
           {/* LOGO MODIFIABLE */}
           <div 
             onClick={() => setIsEditModalOpen(true)} 
             className="group flex items-center gap-3 cursor-pointer p-2 -ml-2 rounded-xl hover:bg-gray-50 transition-colors relative flex-1"
             title="Modifier ma boutique"
           >
              <div className="w-10 h-10 flex-shrink-0 rounded-lg bg-primary-50 border border-primary-100 overflow-hidden relative">
                  {store?.logo_url ? (
                      <img src={store.logo_url} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                      <div className="w-full h-full flex items-center justify-center text-primary-600"><Store size={20} /></div>
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Edit3 size={14} className="text-white" />
                  </div>
              </div>
              <div className="overflow-hidden">
                  <h2 className="font-bold text-gray-800 truncate text-sm">{store?.name || 'Ma Boutique'}</h2>
                  <p className="text-xs text-gray-500">Modifier</p>
              </div>
           </div>

           {/* Bouton Fermer (Mobile seulement) */}
           <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-500 hover:text-red-500">
               <X size={24} />
           </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              // On ferme le menu quand on clique sur un lien (sur mobile)
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                location.pathname === item.path
                  ? 'bg-primary-50 text-primary-600 font-semibold shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Footer Sidebar (Déconnexion) */}
        <div className="p-4 border-t border-gray-100">
            <button 
                onClick={() => { logout(); navigate('/'); }}
                className="flex items-center gap-3 px-4 py-3 w-full text-red-500 hover:bg-red-50 rounded-xl transition-colors font-medium"
            >
                <LogOut size={20} />
                Déconnexion
            </button>
        </div>
      </aside>

      {/* --- 4. CONTENU PRINCIPAL --- */}
      <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
        <Outlet context={{ store }} /> 
      </main>

      {/* Modale */}
      <EditStoreModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        storeData={store}
        onUpdateSuccess={handleStoreUpdate}
      />
    </div>
  );
};

export default VendorLayout;