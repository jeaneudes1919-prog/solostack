import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Filter, SlidersHorizontal, Search, X, Star, Zap, Shield, 
  Clock, TrendingUp, CheckCircle, AlertCircle 
} from 'lucide-react';
import debounce from 'lodash.debounce'; // Assurez-vous d'installer lodash
import api from '../api/axios';
import ProductCard from '../components/ui/ProductCard';

// Helper pour calculer le prix final
const getFinalPrice = (product) => {
  return parseFloat(product.base_price) * (1 - (product.discount_percent || 0) / 100);
};

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  // États des données
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  // États des filtres
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [localSearchInput, setLocalSearchInput] = useState(initialQuery); // Pour l'input UI
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [sortBy, setSortBy] = useState('newest');
  const [ratingFilter, setRatingFilter] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [discountedOnly, setDiscountedOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // --- 1. Gestion Optimisée de la Recherche (Debounce) ---
  const handleSearchChange = useMemo(
    () => debounce((value) => {
      setSearchTerm(value);
    }, 300),
    []
  );

  useEffect(() => {
    return () => {
      handleSearchChange.cancel();
    };
  }, [handleSearchChange]);

  // Wrapper pour mettre à jour l'input immédiatement + déclencher le debounce
  const onSearchInput = (e) => {
    setLocalSearchInput(e.target.value);
    handleSearchChange(e.target.value);
  };

  // --- 2. Chargement des données ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [prodRes, catRes] = await Promise.all([
          api.get('/products'),
          api.get('/products/categories')
        ]);
        
        setProducts(prodRes.data);
        setCategories(catRes.data);
        
        // Chargement sécurisé du localStorage
        try {
          const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
          setRecentlyViewed(Array.isArray(viewed) ? viewed : []);
        } catch (e) {
          console.error("Erreur lecture localStorage", e);
          setRecentlyViewed([]);
        }
      } catch (err) {
        console.error("Erreur API", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- 3. Suivi des produits vus ---
  const trackProductView = useCallback((product) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(p => p.id !== product.id);
      const updated = [product, ...filtered].slice(0, 5);
      localStorage.setItem('recentlyViewed', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // --- 4. Logique de Filtrage et Tri (Memoized) ---
  const filteredProducts = useMemo(() => {
    return products
      .filter(product => {
        const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            product.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || product.category_id === parseInt(selectedCategory);
        const price = getFinalPrice(product);
        const matchesPrice = price >= priceRange[0] && price <= priceRange[1];
        const matchesRating = (product.rating || 0) >= ratingFilter;
        const matchesStock = !inStockOnly || product.stock_quantity > 0;
        const matchesDiscount = !discountedOnly || (product.discount_percent || 0) > 0;

        return matchesSearch && matchesCategory && matchesPrice && 
               matchesRating && matchesStock && matchesDiscount;
      })
      .sort((a, b) => {
        const priceA = getFinalPrice(a);
        const priceB = getFinalPrice(b);

        switch (sortBy) {
          case 'price-asc': return priceA - priceB;
          case 'price-desc': return priceB - priceA;
          case 'rating': return (b.rating || 0) - (a.rating || 0);
          case 'discount': return (b.discount_percent || 0) - (a.discount_percent || 0);
          default: return new Date(b.created_at) - new Date(a.created_at);
        }
      });
  }, [products, searchTerm, selectedCategory, priceRange, sortBy, ratingFilter, inStockOnly, discountedOnly]);

  // --- 5. Calcul des Stats (Memoized) ---
  const stats = useMemo(() => {
    const total = filteredProducts.length || 1;
    const avgPrice = filteredProducts.reduce((sum, p) => sum + getFinalPrice(p), 0) / total;
    
    return {
      avgPrice: avgPrice.toFixed(2),
      discountedCount: filteredProducts.filter(p => (p.discount_percent || 0) > 0).length,
      inStockCount: filteredProducts.filter(p => p.stock_quantity > 0).length,
      highRatedCount: filteredProducts.filter(p => (p.rating || 0) >= 4).length,
    };
  }, [filteredProducts]);

  // --- 6. Reset Filters ---
  const resetFilters = () => {
    setSearchTerm('');
    setLocalSearchInput('');
    setSelectedCategory('all');
    setPriceRange([0, 2000]);
    setRatingFilter(0);
    setInStockOnly(false);
    setDiscountedOnly(false);
    setSortBy('newest');
  };

  // --- RENDER : Loading ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="h-64 bg-gray-200 rounded-xl md:col-span-1"></div>
            <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 bg-gray-200 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER : Main ---
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* HEADER */}
        <div className="mb-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Notre Collection</h1>
              <p className="text-gray-500">
                <span className="font-semibold text-primary-600">{filteredProducts.length}</span> produits trouvés
              </p>
            </div>
            
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl font-semibold shadow-sm active:scale-95 transition-transform"
            >
              <SlidersHorizontal size={20} /> 
              {showFilters ? 'Masquer les filtres' : 'Afficher les filtres'}
            </button>
          </div>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Prix moyen', value: `${stats.avgPrice} €`, icon: TrendingUp, color: 'text-gray-900' },
              { label: 'En stock', value: stats.inStockCount, icon: CheckCircle, color: 'text-green-600' },
              { label: 'Promotions', value: stats.discountedCount, icon: Zap, color: 'text-amber-600' },
              { label: 'Top Rated', value: stats.highRatedCount, icon: Star, color: 'text-yellow-500' },
            ].map((stat, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs text-gray-500 uppercase font-medium">{stat.label}</span>
                  <stat.icon size={16} className={stat.color} />
                </div>
                <span className={`text-xl font-bold ${stat.color}`}>{stat.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* SIDEBAR FILTERS */}
          <aside className={`
            lg:w-80 flex-shrink-0 space-y-6 transition-all duration-300 ease-in-out
            ${showFilters ? 'block opacity-100 translate-y-0' : 'hidden lg:block'}
          `}>
            
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">Filtres</h2>
              <button onClick={resetFilters} className="text-sm text-primary-600 hover:text-primary-700 hover:underline">
                Réinitialiser
              </button>
            </div>

            {/* Recherche */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  value={localSearchInput}
                  onChange={onSearchInput}
                  placeholder="Mot-clé..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            {/* Catégories */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Filter size={18} className="text-primary-600" /> Catégories
              </h3>
              <div className="space-y-1 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full flex justify-between items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedCategory === 'all' ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span>Toutes</span>
                  <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded text-xs">{products.length}</span>
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(parseInt(cat.id))}
                    className={`w-full flex justify-between items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedCategory === parseInt(cat.id) ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded text-xs">
                      {products.filter(p => p.category_id === parseInt(cat.id)).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Prix */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4">Prix</h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <span className="text-xs text-gray-500">Min</span>
                  <input 
                    type="number" 
                    value={priceRange[0]} 
                    onChange={(e) => setPriceRange([+e.target.value, priceRange[1]])}
                    className="w-full mt-1 px-2 py-1 bg-gray-50 border rounded-lg text-sm font-medium"
                  />
                </div>
                <div className="flex-1 text-right">
                  <span className="text-xs text-gray-500">Max</span>
                  <input 
                    type="number" 
                    value={priceRange[1]} 
                    onChange={(e) => setPriceRange([priceRange[0], +e.target.value])}
                    className="w-full mt-1 px-2 py-1 bg-gray-50 border rounded-lg text-sm font-medium text-right"
                  />
                </div>
              </div>
              <input
                type="range"
                min="0" max="2000" step="10"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
              />
            </div>

            {/* Autres Filtres */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
              <h3 className="font-bold text-gray-800">Affiner</h3>
              
              {/* Note */}
              <div>
                <span className="text-sm text-gray-600 mb-2 block">Note minimum</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => setRatingFilter(ratingFilter === star ? 0 : star)}
                      className={`flex-1 py-1.5 rounded-md border transition-all ${
                        ratingFilter >= star ? 'bg-amber-50 border-amber-200 text-amber-500' : 'bg-gray-50 border-transparent text-gray-300'
                      }`}
                    >
                      <Star size={16} className={ratingFilter >= star ? 'fill-current' : ''} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center justify-between cursor-pointer p-2 hover:bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700 flex items-center gap-2"><Zap size={16}/> En Stock</span>
                  <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} className="accent-primary-600 w-4 h-4" />
                </label>
                <label className="flex items-center justify-between cursor-pointer p-2 hover:bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700 flex items-center gap-2"><TrendingUp size={16}/> Promotions</span>
                  <input type="checkbox" checked={discountedOnly} onChange={(e) => setDiscountedOnly(e.target.checked)} className="accent-primary-600 w-4 h-4" />
                </label>
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <main className="flex-1">
            
            {/* Sort Bar & Tags */}
            <div className="mb-6 space-y-4">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm text-gray-500 mr-2">Trier par:</span>
                {[
                  { id: 'newest', label: 'Nouveautés' },
                  { id: 'price-asc', label: 'Prix croissant' },
                  { id: 'price-desc', label: 'Prix décroissant' },
                  { id: 'rating', label: 'Note' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setSortBy(opt.id)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                      sortBy === opt.id ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Active Filters Tags */}
              {(searchTerm || selectedCategory !== 'all' || inStockOnly || discountedOnly) && (
                <div className="flex flex-wrap gap-2">
                  {searchTerm && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium">
                      "{searchTerm}" <X size={12} className="cursor-pointer" onClick={() => { setSearchTerm(''); setLocalSearchInput(''); }} />
                    </span>
                  )}
                  {inStockOnly && <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">En stock <X size={12} className="cursor-pointer" onClick={() => setInStockOnly(false)} /></span>}
                </div>
              )}
            </div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  <div key={product.id} onMouseEnter={() => trackProductView(product)}>
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle size={32} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Aucun résultat</h3>
                <p className="text-gray-500 mt-2 mb-6">Essayez de modifier vos filtres</p>
                <button onClick={resetFilters} className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700">
                  Tout réinitialiser
                </button>
              </div>
            )}

            {/* Recently Viewed */}
            {recentlyViewed.length > 0 && (
              <div className="mt-20 border-t border-gray-200 pt-10">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Récemment consultés</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {recentlyViewed.map(product => (
                    <Link key={product.id} to={`/product/${product.id}`} className="group block bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all">
                      <div className="aspect-square bg-gray-100 relative">
                         {product.images?.[0] && <img src={product.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-medium text-gray-900 truncate">{product.title}</p>
                        <p className="text-sm font-bold text-primary-600">{getFinalPrice(product).toFixed(2)} €</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;