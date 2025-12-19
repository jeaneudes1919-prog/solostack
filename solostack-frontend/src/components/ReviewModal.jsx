import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../api/axios';

const ReviewModal = ({ isOpen, onClose, product, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0); // Pour l'effet de survol des étoiles
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return toast.error("Veuillez choisir une note.");
    
    setLoading(true);
    try {
      await api.post(`/products/${product.id}/reviews`, { rating, comment });
      toast.success("Merci pour votre avis !");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || "Erreur lors de l'envoi.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl w-full max-w-md p-6 relative shadow-2xl"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>

        <h2 className="text-xl font-bold text-gray-800 mb-2">Noter le produit</h2>
        <p className="text-sm text-gray-500 mb-6">{product.product_title}</p>

        <form onSubmit={handleSubmit}>
          {/* ÉTOILES INTERACTIVES */}
          <div className="flex justify-center gap-2 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="transition-transform hover:scale-110 focus:outline-none"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(rating)}
              >
                <Star 
                  size={32} 
                  className={`${star <= (hover || rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} 
                />
              </button>
            ))}
          </div>

          <textarea 
            className="w-full p-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-primary-100 outline-none mb-4"
            rows="4"
            placeholder="Qu'avez-vous pensé de ce produit ?"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          <button 
            disabled={loading}
            className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-black transition"
          >
            {loading ? 'Envoi...' : 'Publier mon avis'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default ReviewModal;