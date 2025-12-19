import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Store, Search, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api/axios';

const StoresPage = () => {
    const [stores, setStores] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/stores') // Appelle la nouvelle route backend
            .then(res => setStores(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const filteredStores = stores.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-20 text-center">Chargement des boutiques...</div>;

    return (
        <div className="min-h-screen bg-gray-50 pt-10 pb-20">
            <div className="max-w-7xl mx-auto px-4">

                <div className="text-center max-w-2xl mx-auto mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Nos Créateurs</h1>
                    <p className="text-gray-500 text-lg">Découvrez les boutiques indépendantes qui font la richesse de SoloStack.</p>

                    <div className="relative mt-8">
                        <input
                            type="text"
                            placeholder="Rechercher une boutique..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-4 pl-12 rounded-full border border-gray-200 shadow-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none"
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredStores.map((store, index) => (
                        <Link key={store.id} to={`/store/${store.id}`}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ y: -5 }}
                                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all border border-gray-100 flex items-center gap-6"
                            >
                                {/* Logo */}
                                <div className="w-20 h-20 flex-shrink-0 bg-gray-50 rounded-full border border-gray-100 overflow-hidden flex items-center justify-center">
                                    {store.logo_url ? (
                                        <img
                                            src={store.logo_url}
                                            className="w-full h-full object-cover"
                                            alt={store.name}
                                        />
                                    ) : (
                                        <Store className="text-gray-300" size={32} />
                                    )}
                                </div>

                                {/* Infos */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-xl text-gray-900 truncate mb-1">{store.name}</h3>
                                    <p className="text-sm text-gray-500 line-clamp-1 mb-3">{store.description || "Aucune description."}</p>

                                    <div className="flex items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-wide">
                                        <span>{store.product_count} Produits</span>
                                        <span className="flex items-center gap-1 text-yellow-500">
                                            <Star size={12} fill="currentColor" /> Top Vendeur
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>

                {filteredStores.length === 0 && (
                    <div className="text-center py-20 text-gray-400">Aucune boutique trouvée.</div>
                )}

            </div>
        </div>
    );
};

export default StoresPage;