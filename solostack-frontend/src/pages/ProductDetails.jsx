import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Star } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../api/axios';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';

// --- COMPOSANT DES AVIS ---
const ReviewsList = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  
  useEffect(() => {
    api.get(`/products/${productId}/reviews`)
      .then(res => setReviews(res.data))
      .catch(err => console.error("Erreur avis:", err));
  }, [productId]);

  if (reviews.length === 0) return <p className="text-gray-500 italic">Aucun avis pour le moment.</p>;

  return (
    <div className="space-y-6">
      {reviews.map(review => (
        <div key={review.id} className="bg-gray-50 p-4 rounded-xl">
           <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                 <div className="font-bold text-gray-800">
                    {review.first_name} {review.last_name ? review.last_name[0] : ''}.
                 </div>
                 <div className="flex text-yellow-400 text-xs">
                    {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                 </div>
              </div>
              <span className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString()}</span>
           </div>
           <p className="text-gray-600">{review.comment}</p>
        </div>
      ))}
    </div>
  );
};

// --- COMPOSANT PRINCIPAL ---
const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const addToCart = useCartStore((state) => state.addToCart);
  const { isAuthenticated, user } = useAuthStore();

  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // Idéalement: api.get(`/products/${id}`)
        const res = await api.get('/products');
        const found = res.data.find(p => p.id === parseInt(id));
        
        if (found) {
          setProduct(found);
          if (found.variants?.length > 0) {
            // Initialisation intelligente des sélecteurs
            const firstV = found.variants[0];
            setSelectedColor(firstV.attributes?.color || null);
            setSelectedSize(firstV.attributes?.size || null);
          }
        }
      } catch (err) {
        console.error(err);
        toast.error("Erreur lors du chargement du produit");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div className="p-20 text-center animate-pulse text-xl font-bold">Chargement...</div>;
  if (!product) return <div className="p-20 text-center text-xl">Produit introuvable</div>;

  const variants = product.variants || [];
  const colors = [...new Set(variants.map(v => v.attributes?.color).filter(Boolean))];
  const sizes = [...new Set(variants.map(v => v.attributes?.size).filter(Boolean))];

  // Trouver la variante active
  const activeVariant = variants.find(v =>
    (!selectedColor || v.attributes?.color === selectedColor) &&
    (!selectedSize || v.attributes?.size === selectedSize)
  );

  const stock = activeVariant ? activeVariant.stock_quantity : 0;
  const isOutOfStock = stock === 0;
  const isVendor = user?.role === 'vendor';
  
  // ✅ Image sécurisée
  const imageUrl = product.image_url || "https://via.placeholder.com/600";

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error("Veuillez vous connecter pour acheter.");
      navigate('/login');
      return;
    }

    if (isVendor) {
      toast.error("Les vendeurs ne peuvent pas acheter.");
      return;
    }

    if (!activeVariant) {
        toast.error("Veuillez sélectionner vos options.");
        return;
    }

    if (quantity > stock) {
        toast.error("Quantité supérieure au stock disponible.");
        return;
    }

    const productToAdd = { ...product, image_url: imageUrl };
    addToCart(productToAdd, activeVariant, quantity);
    toast.success("Produit ajouté au panier !");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

        {/* IMAGE */}
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
          <div className="aspect-square bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100 relative">
            <img
              src={imageUrl} // ✅ CORRIGÉ ICI
              alt={product.title}
              className={`w-full h-full object-cover transition-transform duration-500 hover:scale-105 ${isOutOfStock ? 'opacity-50 grayscale' : ''}`}
            />
            {isOutOfStock && (
              <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] flex items-center justify-center">
                <span className="bg-red-600 text-white px-6 py-2 rounded-full font-black uppercase tracking-widest shadow-xl">Rupture</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* DETAILS */}
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">{product.title}</h1>
            <div className="flex items-center gap-4">
                <div className="text-4xl font-black text-primary-600">{product.base_price} €</div>
                {product.discount_percent > 0 && (
                    <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full font-bold text-sm">-{product.discount_percent}%</span>
                )}
            </div>
          </div>

          <p className="text-gray-500 text-lg mb-8 leading-relaxed font-light">{product.description}</p>

          {/* SÉLECTEURS */}
          <div className="space-y-8 mb-10">
            {colors.length > 0 && (
              <div>
                <span className="text-sm uppercase tracking-widest font-bold text-gray-400 block mb-3">Couleur</span>
                <div className="flex gap-3 flex-wrap">
                  {colors.map(c => (
                    <button 
                        key={c} 
                        onClick={() => setSelectedColor(c)} 
                        className={`px-6 py-3 rounded-2xl border-2 transition-all font-bold ${selectedColor === c ? 'border-primary-600 bg-primary-50 text-primary-700 shadow-md' : 'border-gray-100 hover:border-gray-300'}`}
                    >
                        {c}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {sizes.length > 0 && (
              <div>
                <span className="text-sm uppercase tracking-widest font-bold text-gray-400 block mb-3">Taille</span>
                <div className="flex gap-3 flex-wrap">
                  {sizes.map(s => (
                    <button 
                        key={s} 
                        onClick={() => setSelectedSize(s)} 
                        className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-all font-bold ${selectedSize === s ? 'bg-black text-white border-black shadow-lg' : 'border-gray-100 hover:border-gray-300'}`}
                    >
                        {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* STOCK INFO */}
          <div className="mb-8 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${stock > 0 ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
            <span className={`text-sm font-bold uppercase tracking-wide ${stock > 0 ? "text-green-600" : "text-red-500"}`}>
                {stock > 0 ? `${stock} unités disponibles` : "Épuisé"}
            </span>
          </div>

          {/* BOUTONS D'ACTION */}
          <div className="flex flex-col sm:flex-row gap-4">
            {!isVendor && !isOutOfStock && (
              <div className="flex items-center border-2 border-gray-100 rounded-2xl bg-gray-50/50 p-1">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-12 flex items-center justify-center hover:bg-white rounded-xl transition-all font-bold text-xl">-</button>
                <span className="font-black w-12 text-center text-lg">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-12 h-12 flex items-center justify-center hover:bg-white rounded-xl transition-all font-bold text-xl">+</button>
              </div>
            )}

            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || isVendor}
              className={`flex-1 py-5 px-8 rounded-2xl font-black text-xl text-white shadow-2xl transition-all flex items-center justify-center gap-3 ${isOutOfStock || isVendor
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                  : 'bg-black hover:bg-primary-600 hover:scale-[1.02] active:scale-95'
                }`}
            >
              {isVendor ? (
                <span>Mode Vendeur</span>
              ) : isOutOfStock ? (
                'Rupture de stock'
              ) : (
                <>
                  <ShoppingBag size={24} /> Ajouter au panier
                </>
              )}
            </button>
          </div>

          {/* SECTION AVIS */}
          <div className="mt-20 border-t border-gray-100 pt-12">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-black text-gray-900">Avis Clients</h2>
                <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full">
                    <Star className="fill-yellow-400 text-yellow-400" size={16} />
                    <span className="font-bold">{product.average_rating || 0}</span>
                </div>
            </div>
            <ReviewsList productId={id} />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductDetails;