import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, ArrowLeft, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ui/ProductCard';

const PromotionsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPromos = async () => {
      try {
        const res = await api.get('/products'); // Idéalement, faire un endpoint /products?discount=true côté back
        // Filtrage côté front pour l'instant (MVP)
        const promos = res.data.filter(p => p.discount_percent > 0);
        setProducts(promos);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPromos();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-16 h-16 border-4 border-red-500 rounded-full animate-spin border-t-transparent"></div></div>;

  return (
    <div className="min-h-screen bg-red-50 pt-24 pb-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12 text-center">
            <Link to="/" className="inline-flex items-center text-red-600 font-bold mb-4 hover:underline"><ArrowLeft size={16} className="mr-2"/> Retour à l'accueil</Link>
            <h1 className="text-5xl md:text-7xl font-black text-red-600 mb-4 flex items-center justify-center gap-4">
                <Zap size={48} className="fill-yellow-400 text-yellow-500" /> 
                VENTES FLASH
            </h1>
            <p className="text-xl text-gray-600">Profitez des meilleures offres avant qu'il ne soit trop tard.</p>
        </div>

        {/* Grid */}
        {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product, i) => (
                <motion.div 
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                >
                    <ProductCard product={product} />
                </motion.div>
            ))}
            </div>
        ) : (
            <div className="text-center py-20">
                <p className="text-2xl text-gray-500 font-bold">Aucune promotion en cours... Revenez vite !</p>
                <Link to="/search" className="mt-6 inline-block px-8 py-3 bg-red-600 text-white rounded-full font-bold">Voir tout le catalogue</Link>
            </div>
        )}
      </div>
    </div>
  );
};

export default PromotionsPage;