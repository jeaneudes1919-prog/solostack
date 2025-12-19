import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { CreditCard, CheckCircle } from 'lucide-react';
import useCartStore from '../store/cartStore';
import api from '../api/axios';
import Input from '../components/ui/Input';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, getTotal, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  
  const [address, setAddress] = useState({
    street: '', city: '', zip: '', country: 'France'
  });

  const handleOrder = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Préparation du Payload pour le Backend
      const payload = {
        items: items.map(item => ({
          variant_id: item.variant_id, // L'ID de la variante (si null, gérer le cas produit simple dans le back)
          quantity: item.quantity,
          store_id: item.store_id,
          price: item.price
        })),
        shipping_address: address
      };

      await api.post('/orders', payload);
      
      toast.success('Commande validée avec succès !');
      clearCart();
      navigate('/dashboard/orders');

    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Erreur lors de la commande");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) return null; // Devrait rediriger si vide

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Paiement & Livraison</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Formulaire Adresse */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <CheckCircle size={20} className="text-primary-500" /> Adresse de livraison
            </h2>
            <form id="checkout-form" onSubmit={handleOrder}>
              <Input label="Rue" value={address.street} onChange={(e) => setAddress({...address, street: e.target.value})} placeholder="12 rue de la Paix" required />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Ville" value={address.city} onChange={(e) => setAddress({...address, city: e.target.value})} placeholder="Paris" required />
                <Input label="Code Postal" value={address.zip} onChange={(e) => setAddress({...address, zip: e.target.value})} placeholder="75000" required />
              </div>
              <Input label="Pays" value={address.country} onChange={(e) => setAddress({...address, country: e.target.value})} disabled />
            </form>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
             <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <CreditCard size={20} className="text-primary-500" /> Paiement (Simulation)
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Ceci est une démo. Aucune carte réelle n'est requise. Cliquez sur payer pour simuler la transaction Stripe.
            </p>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-gray-400 font-mono text-sm">
              •••• •••• •••• 4242
            </div>
          </div>
        </motion.div>

        {/* Récapitulatif */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-primary-100 sticky top-24">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Votre Commande</h2>
            
            <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {items.map(item => (
                <div key={item.cartItemId} className="flex justify-between text-sm">
                  <span className="text-gray-600 w-2/3 truncate">{item.quantity}x {item.title}</span>
                  <span className="font-bold text-gray-800">{(item.price * item.quantity).toFixed(2)} €</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-xl font-extrabold text-primary-600 mb-6">
                <span>Total à payer</span>
                <span>{getTotal()} €</span>
              </div>
              
              <button 
                form="checkout-form"
                disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-primary-500/30 transition-all flex justify-center items-center gap-2"
              >
                {loading ? 'Traitement...' : 'Payer maintenant'}
              </button>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default Checkout;