import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Star } from 'lucide-react'; // J'ai nettoyé les imports
import { toast } from 'react-hot-toast';
import api from '../api/axios';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const addToCart = useCartStore((state) => state.addToCart);
  const { isAuthenticated, user } = useAuthStore(); // On récupère 'user' ici

  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);

  
  // Tu peux mettre ça dans le même fichier ProductDetails.jsx ou à part
const ReviewsList = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  
  useEffect(() => {
    api.get(`/products/${productId}/reviews`).then(res => setReviews(res.data));
  }, [productId]);

  if (reviews.length === 0) return <p className="text-gray-500 italic">Aucun avis pour le moment.</p>;

  return (
    <div className="space-y-6">
      {reviews.map(review => (
        <div key={review.id} className="bg-gray-50 p-4 rounded-xl">
           <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                 <div className="font-bold text-gray-800">{review.first_name} {review.last_name[0]}.</div>
                 {/* Utilise ton composant StarRating ici */}
                 <div className="flex text-yellow-400 text-xs">{'★'.repeat(review.rating)}</div>
              </div>
              <span className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString()}</span>
           </div>
           <p className="text-gray-600">{review.comment}</p>
        </div>
      ))}
    </div>
  );
};

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get('/products');
        // Note: Idéalement il faudrait un endpoint api.get('/products/:id') pour ne pas charger tout le catalogue
        const found = res.data.find(p => p.id === parseInt(id));
        setProduct(found);

        if (found?.variants?.length > 0) {
          const v = found.variants[0];
          // On initialise avec les attributs de la première variante
          setSelectedColor(v.attributes.color);
          setSelectedSize(v.attributes.size);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div className="p-20 text-center animate-pulse">Chargement...</div>;
  if (!product) return <div className="p-20 text-center">Produit introuvable</div>;

  const variants = product.variants || [];
  // Extraction unique des couleurs et tailles disponibles
  const colors = [...new Set(variants.map(v => v.attributes.color).filter(Boolean))];
  const sizes = [...new Set(variants.map(v => v.attributes.size).filter(Boolean))];

  // Trouver la variante exacte correspondant aux choix
  const activeVariant = variants.find(v =>
    (!selectedColor || v.attributes.color === selectedColor) &&
    (!selectedSize || v.attributes.size === selectedSize)
  );

  const stock = activeVariant ? activeVariant.stock_quantity : 0;
  const isOutOfStock = stock === 0;

  // --- LOGIQUE D'AJOUT AU PANIER SÉCURISÉE ---
  const handleAddToCart = () => {
    // 1. Vérif connexion
    if (!isAuthenticated) {
      toast.error("Veuillez vous connecter pour acheter.");
      navigate('/login');
      return;
    }

    // 2. SÉCURITÉ VENDEUR : On bloque ici aussi
    if (user?.role === 'vendor') {
      toast.error("Les comptes Vendeurs ne peuvent pas effectuer d'achats.");
      return;
    }

    if (!activeVariant) return toast.error("Combinaison indisponible");

    const imageUrl = product.image_url || "https://via.placeholder.com/300";

    const productToAdd = {
      ...product,
      images: [imageUrl]
    };

    addToCart(productToAdd, activeVariant, quantity);
    toast.success("Produit ajouté au panier !");
  };

  const imageUrl = product.image_url || "https://via.placeholder.com/300";

  // Est-ce un vendeur ?
  const isVendor = user?.role === 'vendor';

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

        {/* IMAGE */}
        <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }}>
          <div className="aspect-square bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 relative">
            <img
              src={displayImage}
              alt={product.title}
              className="w-full h-full object-cover"
            />
            {isOutOfStock && (
              <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                <span className="bg-red-500 text-white px-4 py-2 rounded-full font-bold">Rupture de stock</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* DETAILS */}
        <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
          <div className="text-3xl font-extrabold text-primary-600 mb-6">{product.base_price} €</div>
          <p className="text-gray-500 mb-6 leading-relaxed">{product.description}</p>

          {/* SÉLECTEURS */}
          <div className="space-y-6 mb-8">
            {colors.length > 0 && (
              <div>
                <span className="font-bold text-gray-700 block mb-2">Couleur : {selectedColor}</span>
                <div className="flex gap-2 flex-wrap">
                  {colors.map(c => (
                    <button key={c} onClick={() => setSelectedColor(c)} className={`px-4 py-2 border rounded-lg transition ${selectedColor === c ? 'border-primary-500 bg-primary-50 text-primary-700 font-bold' : 'hover:bg-gray-50'}`}>{c}</button>
                  ))}
                </div>
              </div>
            )}
            {sizes.length > 0 && (
              <div>
                <span className="font-bold text-gray-700 block mb-2">Taille : {selectedSize}</span>
                <div className="flex gap-2 flex-wrap">
                  {sizes.map(s => (
                    <button key={s} onClick={() => setSelectedSize(s)} className={`w-12 h-12 border rounded-lg flex items-center justify-center transition ${selectedSize === s ? 'bg-primary-500 text-white border-primary-500' : 'hover:border-gray-400'}`}>{s}</button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* STOCK INFO */}
          <div className="mb-6 text-sm text-gray-500">
            Disponibilité : <span className={stock > 0 ? "text-green-600 font-bold" : "text-red-500 font-bold"}>{stock > 0 ? `${stock} en stock` : "Indisponible"}</span>
          </div>

          {/* BOUTONS D'ACTION */}
          <div className="flex gap-4">
            {/* Le sélecteur de quantité est caché pour les vendeurs */}
            {!isVendor && (
              <div className="flex items-center border rounded-xl bg-white">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-3 hover:bg-gray-100 rounded-l-xl transition">-</button>
                <span className="font-bold w-10 text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-3 hover:bg-gray-100 rounded-r-xl transition">+</button>
              </div>
            )}

            <button
              onClick={handleAddToCart}
              // On désactive le bouton si c'est un vendeur OU si stock épuisé
              disabled={isOutOfStock || isVendor}
              className={`flex-1 py-4 px-6 rounded-xl font-bold text-lg text-white shadow-xl transition-all flex items-center justify-center gap-2 ${isOutOfStock || isVendor
                  ? 'bg-gray-300 cursor-not-allowed shadow-none'
                  : 'bg-gray-900 hover:bg-black hover:scale-[1.02]'
                }`}
            >
              {isVendor ? (
                <span>Mode Vendeur (Achat désactivé)</span>
              ) : isOutOfStock ? (
                'Rupture de stock'
              ) : (
                <>
                  <ShoppingBag size={20} /> Ajouter au panier
                </>
              )}
            </button>
          </div>
          {/* SECTION AVIS */}
          <div className="mt-16 border-t pt-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Avis Clients</h2>

            {/* On doit charger les avis via un useEffect séparé ou dans le principal */}
            {/* Pour faire simple, voici le composant d'affichage (supposons que tu as chargé les reviews dans un state `reviews`) */}

            <ReviewsList productId={id} />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductDetails;