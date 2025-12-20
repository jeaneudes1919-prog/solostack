import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Star } from 'lucide-react';
import useCartStore from '../../store/cartStore';
import { toast } from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const addToCart = useCartStore((state) => state.addToCart);

  // 1. Conversion des notes
  const rating = parseFloat(product.average_rating || 0);
  const count = parseInt(product.review_count || 0);

  // 2. Image (Variable sécurisée)
  const imageUrl = product.image_url || "https://via.placeholder.com/300";

  // 3. CALCUL DU STOCK TOTAL
  const variants = product.variants || [];
  const totalStock = variants.reduce((acc, curr) => acc + (curr.stock_quantity || 0), 0);
  const isOutOfStock = variants.length > 0 && totalStock === 0;

  // 4. Ajout au panier
  const handleAddToCart = (e) => {
    e.preventDefault(); 
    e.stopPropagation(); 

    if (isOutOfStock) {
        toast.error("Ce produit est en rupture de stock.");
        return;
    }

    const defaultVariant = variants.find(v => v.stock_quantity > 0) || variants[0];
    
    if (!defaultVariant) {
        toast.error("Produit indisponible pour le moment.");
        return;
    }

    addToCart(product, defaultVariant, 1);
    toast.success('Ajouté au panier');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 overflow-hidden transition-shadow duration-300"
    >
      <Link to={`/product/${product.id}`}>
        <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
          <motion.img
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.4 }}
            src={imageUrl} // ✅ CORRIGÉ : On utilise imageUrl
            alt={product.title}
            className={`w-full h-full object-cover object-center ${isOutOfStock ? 'opacity-50 grayscale' : ''}`}
          />
          
          {product.store_name && (
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold text-gray-800 shadow-sm z-10">
              {product.store_name}
            </div>
          )}

          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/10 z-0">
               <span className="bg-red-600 text-white px-3 py-1 rounded font-bold text-sm transform -rotate-12 shadow-lg">
                 RUPTURE
               </span>
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-gray-800 font-bold truncate pr-4 text-lg">{product.title}</h3>
            <span className="text-primary-600 font-bold text-lg">{product.base_price} €</span>
          </div>
          
          <p className="text-gray-500 text-sm line-clamp-2 mb-4 h-10">{product.description}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Star 
                size={14} 
                className={`${rating >= 1 ? "fill-yellow-400 text-yellow-400" : "text-gray-300 fill-gray-100"}`} 
              />
              <span className="text-gray-400 font-medium text-xs">
                {rating > 0 ? `${rating.toFixed(1)} (${count})` : "Aucun avis"}
              </span>
            </div>

            <button 
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`p-2 rounded-full transition-colors duration-300 z-10 relative ${
                isOutOfStock 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-gray-50 text-primary-600 hover:bg-primary-500 hover:text-white'
              }`}
            >
              <ShoppingBag size={20} />
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;