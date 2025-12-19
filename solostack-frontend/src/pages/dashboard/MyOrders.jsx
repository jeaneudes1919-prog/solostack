import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Truck, Download, MessageSquare } from 'lucide-react'; // Ajout MessageSquare
import api from '../../api/axios';
import { PDFDownloadLink } from '@react-pdf/renderer';
import InvoicePDF from '../../components/InvoicePDF';
import ReviewModal from '../../components/ReviewModal'; // N'oublie pas d'importer ça

// ... (Garde ton composant StatusBadge ici) ...
const StatusBadge = ({ status }) => { /* ... */ };

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // States pour la modale d'avis
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    // ... fetchOrders identique ...
    const fetchOrders = async () => {
        try {
          const res = await api.get('/orders/my-orders');
          setOrders(res.data);
        } catch (err) { console.error(err); } finally { setLoading(false); }
      };
      fetchOrders();
  }, []);

  const openReview = (item) => {
    // Important : On s'assure d'avoir l'ID du produit
    // Parfois l'API renvoie 'product_id' ou juste 'id' selon ta requête SQL
    setSelectedItem(item); 
    setReviewModalOpen(true);
  };

  if (loading) return <div className="p-10 text-center animate-pulse">Chargement...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3">
        <Package className="text-primary-500" size={32} /> Mes Commandes
      </h1>

      {orders.length === 0 ? (
        <div className="bg-white p-10 rounded-2xl shadow-sm text-center">Vous n'avez pas de commande.</div>
      ) : (
        <div className="space-y-6">
          {orders.map((order, index) => (
            <motion.div key={order.id} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
              
              {/* HEADER COMMANDE */}
              <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row justify-between items-center border-b border-gray-100 gap-4">
                 {/* ... (Garde ton code Header ici, avec le PDF) ... */}
                 <div className="flex flex-col sm:flex-row gap-6">
                   <div>
                      <p className="text-xs text-gray-500 uppercase font-bold">Commande #{order.id}</p>
                      <p className="text-sm text-gray-600">{new Date(order.created_at).toLocaleDateString()}</p>
                   </div>
                   <div>
                      <p className="text-xs text-gray-500 uppercase font-bold">Total</p>
                      <p className="text-sm font-bold text-gray-900">{order.total_amount} €</p>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                     <p className="text-xs text-green-600 font-semibold uppercase bg-green-50 px-2 py-1 rounded border border-green-100">{order.payment_status}</p>
                     <PDFDownloadLink document={<InvoicePDF order={order} />} fileName={`facture-${order.id}.pdf`}>
                        {({ loading }) => <button className="flex items-center gap-2 text-primary-600 hover:bg-white px-3 py-2 rounded-lg text-sm font-bold border border-transparent hover:border-gray-200"><Download size={16} /> Facture</button>}
                     </PDFDownloadLink>
                </div>
              </div>

              {/* DÉTAILS SOUS-COMMANDES */}
              <div className="p-6">
                {order.sub_orders && order.sub_orders.map((subOrder, idx) => (
                  <div key={idx} className="mb-6 last:mb-0">
                    <div className="flex items-center gap-2 mb-3">
                      <Truck size={18} className="text-primary-400" />
                      <h3 className="font-semibold text-gray-800">Expédié par : {subOrder.store_name}</h3>
                      <StatusBadge status={subOrder.status} />
                    </div>

                    <div className="bg-primary-50/50 rounded-lg p-4 space-y-3 border border-primary-100">
                      {/* --- BOUCLE DES ITEMS --- */}
                      {(subOrder.items || []).map((item, itemIdx) => (
                        <div key={itemIdx} className="flex justify-between items-center text-sm py-2 border-b border-primary-100/50 last:border-0">
                          
                          <div className="flex flex-col">
                            <span className="text-gray-700">
                              <span className="font-bold">{item.quantity}x</span> {item.product_title}
                            </span>
                            
                            {/* --- BOUTON NOTER (Condition: Payé) --- */}
                            {(order.payment_status === 'paid' || order.payment_status === 'PAID') && (
                               <button 
                                 // Assure-toi que item contient bien l'ID du produit (item.product_id ou item.id selon ta requête SQL)
                                 onClick={() => openReview({...item, id: item.product_id || item.id })} 
                                 className="text-primary-600 text-xs font-bold hover:underline flex items-center gap-1 mt-1 w-fit transition"
                               >
                                 <MessageSquare size={12} /> Noter ce produit
                               </button>
                            )}
                          </div>
                          
                          <span className="font-medium text-gray-900">{item.price} €</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* LA MODALE D'AVIS */}
      <ReviewModal 
        isOpen={reviewModalOpen} 
        onClose={() => setReviewModalOpen(false)}
        product={selectedItem}
        onSuccess={() => {}} 
      />
    </div>
  );
};

export default MyOrders;