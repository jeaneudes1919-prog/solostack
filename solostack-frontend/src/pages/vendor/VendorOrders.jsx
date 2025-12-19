import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Clock } from 'lucide-react';
import api from '../../api/axios';

const VendorOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/vendor-orders')
      .then(res => setOrders(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-10 text-center animate-pulse text-primary-500">Chargement des ventes...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Commandes à expédier</h1>

      {orders.length === 0 ? (
        <div className="bg-white p-10 rounded-2xl shadow-sm text-center text-gray-500 border border-dashed border-gray-300">
          <Package size={48} className="mx-auto text-gray-300 mb-4" />
          <p>Aucune commande reçue pour le moment.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-4 font-bold text-gray-600">ID</th>
                <th className="p-4 font-bold text-gray-600">Client</th>
                <th className="p-4 font-bold text-gray-600">Articles</th>
                <th className="p-4 font-bold text-gray-600">Total</th>
                <th className="p-4 font-bold text-gray-600">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/50 transition">
                  <td className="p-4 text-sm font-bold text-gray-800">#{order.id}</td>
                  
                  <td className="p-4 text-sm">
                    <p className="font-semibold text-gray-800">{order.first_name} {order.last_name}</p>
                    <p className="text-xs text-gray-500">{order.email}</p>
                  </td>
                  
                  <td className="p-4 text-sm">
                    <div className="space-y-1">
                      {/* --- CORRECTION ICI : (order.items || []) --- */}
                      {(order.items || []).map((item, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <span className="font-bold text-primary-600 bg-primary-50 px-1.5 rounded">{item.quantity}x</span>
                          <span className="text-gray-700">{item.product}</span>
                          {item.sku && <span className="text-[10px] text-gray-400 border px-1 rounded uppercase">{item.sku}</span>}
                        </div>
                      ))}
                      {(!order.items || order.items.length === 0) && (
                        <span className="text-xs text-red-400 italic">Aucun détail produit</span>
                      )}
                    </div>
                  </td>
                  
                  <td className="p-4 font-bold text-green-600">
                    {parseFloat(order.sub_total).toFixed(2)} €
                  </td>
                  
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
};

export default VendorOrders;