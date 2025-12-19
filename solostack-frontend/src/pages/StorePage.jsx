import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Calendar, Package } from 'lucide-react';
import api from '../api/axios';
import ProductCard from '../components/ui/ProductCard';

const StorePage = () => {
  const { id } = useParams();
  const [data, setData] = useState({ store: null, products: [] });
  const [loading, setLoading] = useState(true);

  const BASE_IMG_URL = 'http://localhost:5000';

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const res = await api.get(`/stores/${id}`);
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStore();
  }, [id]);

  if (loading) return <div className="p-20 text-center animate-pulse">Chargement de la boutique...</div>;
  if (!data.store) return <div className="p-20 text-center">Boutique introuvable.</div>;

  const { store, products } = data;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* BANNIÈRE & HEADER */}
      <div className="bg-white border-b shadow-sm">
        <div className="h-48 bg-gradient-to-r from-primary-600 to-purple-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 -mt-16 relative pb-8">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
            {/* Logo */}
            <div className="w-32 h-32 bg-white rounded-2xl shadow-lg p-1 overflow-hidden">
              {store.logo_url ? (
                <img
                  src={store.logo_url}
                  alt={store.name}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-4xl font-bold text-gray-400 rounded-xl">
                  {store.name[0]}
                </div>
              )}
            </div>

            {/* Infos */}
            <div className="flex-1 text-center md:text-left mb-2">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{store.name}</h1>
              <p className="text-gray-600 max-w-2xl mb-4">{store.description}</p>

              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar size={16} /> Membre depuis {new Date(store.created_at).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <Package size={16} /> {products.length} Produits
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PRODUITS */}
      <div className="max-w-7xl mx-auto px-4 mt-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Catalogue ({products.length})</h2>

        {products.length === 0 ? (
          <div className="text-center py-20 text-gray-500 bg-white rounded-2xl border border-dashed">
            Cette boutique n'a pas encore de produits.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <ProductCard key={product.id} product={{ ...product, store_name: store.name }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StorePage;