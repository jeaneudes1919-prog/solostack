import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';

const Cart = () => {
  const { items, updateQuantity, removeFromCart, getTotal } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <div className="bg-gray-100 p-6 rounded-full mb-4">
          <ShoppingBag size={48} className="text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Votre panier est vide</h2>
        <p className="text-gray-500 mb-6">Il semblerait que vous n'ayez pas encore craqué !</p>
        <Link to="/" className="bg-primary-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-600 transition">
          Découvrir nos produits
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Votre Panier ({items.length})</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LISTE DES ARTICLES */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.cartItemId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                layout
                className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 items-center"
              >
                {/* Image */}
                <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                </div>

                {/* Infos */}
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-gray-800">{item.title}</h3>
                      <p className="text-sm text-gray-500">Vendu par : {item.store_name}</p>
                      {item.attributes && (
                        <div className="flex gap-2 mt-1">
                          {Object.entries(item.attributes).map(([key, val]) => (
                            <span key={key} className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 font-medium capitalize">
                              {val}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="font-bold text-lg text-primary-600">{item.price} €</span>
                  </div>

                  {/* Actions Quantité */}
                  <div className="flex justify-between items-end mt-4">
                    <div className="flex items-center border border-gray-200 rounded-lg">
                      <button onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)} className="px-3 py-1 hover:bg-gray-50">-</button>
                      <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)} className="px-3 py-1 hover:bg-gray-50">+</button>
                    </div>
                    
                    <button onClick={() => removeFromCart(item.cartItemId)} className="text-red-400 hover:text-red-600 p-2">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* RÉSUMÉ COMMANDE */}
        <div className="h-fit">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-primary-100 sticky top-24">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Résumé</h2>
            
            <div className="space-y-2 mb-6 text-gray-600">
              <div className="flex justify-between">
                <span>Sous-total</span>
                <span>{getTotal()} €</span>
              </div>
              <div className="flex justify-between">
                <span>Livraison</span>
                <span className="text-green-600 font-bold">Gratuite</span>
              </div>
            </div>

            <div className="border-t pt-4 mb-6 flex justify-between items-center">
              <span className="text-xl font-bold text-gray-900">Total</span>
              <span className="text-2xl font-extrabold text-primary-600">{getTotal()} €</span>
            </div>

            {isAuthenticated ? (
              <Link to="/checkout" className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-black transition shadow-xl shadow-gray-900/20">
                Commander <ArrowRight size={20} />
              </Link>
            ) : (
              <button onClick={() => navigate('/login')} className="w-full bg-primary-500 text-white py-4 rounded-xl font-bold hover:bg-primary-600 transition">
                Se connecter pour payer
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Cart;