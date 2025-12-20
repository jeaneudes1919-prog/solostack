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
        <div className="bg-gray-100 p-8 rounded-full mb-6">
          <ShoppingBag size={64} className="text-gray-400" />
        </div>
        <h2 className="text-3xl font-black text-gray-900 mb-3">Votre panier est vide</h2>
        <p className="text-gray-500 mb-8 max-w-xs">Il semblerait que vous n'ayez pas encore craqué pour nos pépites !</p>
        <Link to="/search" className="bg-black text-white px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-all shadow-xl">
          Explorer la collection
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-12 tracking-tight">
        Mon Panier <span className="text-primary-600">({items.length})</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* LISTE DES ARTICLES */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode='popLayout'>
            {items.map((item) => {
              // ✅ Sécurité sur l'image
              const displayImage = item.image_url || item.image || "https://via.placeholder.com/300";
              
              return (
                <motion.div
                  key={item.cartItemId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  layout
                  className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-6 items-center"
                >
                  {/* Image */}
                  <div className="w-32 h-32 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-50">
                    <img src={displayImage} alt={item.title} className="w-full h-full object-cover" />
                  </div>

                  {/* Infos */}
                  <div className="flex-1 w-full text-center sm:text-left">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div>
                        <h3 className="font-black text-xl text-gray-900 mb-1">{item.title}</h3>
                        <p className="text-sm text-gray-400 font-medium mb-3">Créateur : {item.store_name}</p>
                        
                        {item.attributes && (
                          <div className="flex gap-2 mt-1 justify-center sm:justify-start">
                            {Object.entries(item.attributes).map(([key, val]) => (
                              <span key={key} className="text-[10px] uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-full text-gray-600 font-black">
                                {key}: {val}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-2xl font-black text-primary-600 mx-auto sm:mx-0">
                        {item.price} €
                      </div>
                    </div>

                    {/* Actions Quantité */}
                    <div className="flex justify-between items-center mt-8">
                      <div className="flex items-center border-2 border-gray-100 rounded-xl p-1 bg-gray-50/50">
                        <button 
                          onClick={() => updateQuantity(item.cartItemId, Math.max(1, item.quantity - 1))} 
                          className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-lg transition-all font-bold"
                        >-</button>
                        <span className="w-10 text-center font-black text-lg">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)} 
                          className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-lg transition-all font-bold"
                        >+</button>
                      </div>
                      
                      <button 
                        onClick={() => removeFromCart(item.cartItemId)} 
                        className="text-gray-300 hover:text-red-500 transition-colors p-2"
                        title="Supprimer l'article"
                      >
                        <Trash2 size={24} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* RÉSUMÉ COMMANDE */}
        <div className="h-fit">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-50 sticky top-24">
            <h2 className="text-2xl font-black text-gray-900 mb-8">Récapitulatif</h2>
            
            <div className="space-y-4 mb-8 text-lg font-medium">
              <div className="flex justify-between text-gray-500">
                <span>Articles ({items.length})</span>
                <span>{getTotal()} €</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Frais de port</span>
                <span className="text-green-500 font-bold uppercase text-sm tracking-wider">Offerts</span>
              </div>
            </div>

            <div className="border-t border-dashed border-gray-200 pt-6 mb-8 flex justify-between items-center">
              <span className="text-xl font-bold text-gray-900">Total TTC</span>
              <span className="text-3xl font-black text-primary-600">{getTotal()} €</span>
            </div>

            {isAuthenticated ? (
              <Link to="/checkout" className="w-full bg-black text-white py-5 rounded-2xl font-black text-lg flex justify-center items-center gap-3 hover:bg-primary-600 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-gray-200">
                Commander <ArrowRight size={22} />
              </Link>
            ) : (
              <button 
                onClick={() => navigate('/login')} 
                className="w-full bg-primary-500 text-white py-5 rounded-2xl font-black text-lg hover:bg-primary-600 transition-all shadow-xl shadow-primary-200"
              >
                Se connecter pour payer
              </button>
            )}

            <p className="mt-6 text-center text-xs text-gray-400 font-medium">
              Paiement 100% sécurisé via Stripe
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Cart;