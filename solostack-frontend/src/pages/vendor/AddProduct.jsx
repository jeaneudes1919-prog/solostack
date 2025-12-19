import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Trash, Save, Upload, Zap, Clock, Calendar } from 'lucide-react'; // Ajout d'icônes
import { toast } from 'react-hot-toast';
import api from '../../api/axios';
import Input from '../../components/ui/Input';

const AddProduct = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [preview, setPreview] = useState(null);
  
  // État local pour gérer l'affichage des options de promo
  const [isPromoActive, setIsPromoActive] = useState(false); 

  const [product, setProduct] = useState({
    title: '', 
    description: '', 
    base_price: '', 
    category_id: '', 
    image: null,
    // Nouveaux champs pour la promotion
    discount_percent: 0,
    promotion_end_date: ''
  });

  const [variants, setVariants] = useState([
    { sku: '', stock_quantity: 0, color: '', size: '' }
  ]);

  useEffect(() => {
    api.get('/products/categories').then(res => setCategories(res.data));
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.match('image.*')) {
        toast.error("Format invalide. Utilisez JPG ou PNG.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("L'image est trop lourde (Max 5Mo).");
        return;
      }
      setProduct({ ...product, image: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const addVariant = () => setVariants([...variants, { sku: '', stock_quantity: 0, color: '', size: '' }]);
  
  const removeVariant = (index) => {
    const newVariants = variants.filter((_, i) => i !== index);
    setVariants(newVariants);
  };

  const updateVariant = (index, field, value) => {
    const newVariants = [...variants];
    newVariants[index][field] = value;
    setVariants(newVariants);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!product.image) return toast.error("Vous devez ajouter une image !");

    // Validation simple de la promotion
    if (isPromoActive) {
        if (product.discount_percent <= 0 || product.discount_percent >= 100) {
            return toast.error("Le pourcentage de réduction doit être entre 1 et 99.");
        }
        if (!product.promotion_end_date) {
            return toast.error("Veuillez définir une date de fin pour la promotion.");
        }
        // Vérifier que la date est dans le futur
        if (new Date(product.promotion_end_date) <= new Date()) {
            return toast.error("La date de fin doit être dans le futur.");
        }
    }

    try {
      const formData = new FormData();
      formData.append('image', product.image);
      formData.append('title', product.title);
      formData.append('description', product.description);
      formData.append('base_price', product.base_price);
      formData.append('category_id', product.category_id);
      
      // Ajout des données de promotion
      formData.append('discount_percent', isPromoActive ? product.discount_percent : 0);
      formData.append('is_promotion', isPromoActive); // Utile pour le backend
      if (isPromoActive && product.promotion_end_date) {
          formData.append('promotion_end_date', product.promotion_end_date);
      }

      const formattedVariants = variants.map(v => ({
        sku: v.sku, stock_quantity: parseInt(v.stock_quantity), price_adjustment: 0,
        attributes: { color: v.color, size: v.size }
      }));
      formData.append('variants', JSON.stringify(formattedVariants));

      await api.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success('Produit créé avec succès !');
      navigate('/vendor/products');

    } catch (err) {
      toast.error(err.response?.data?.error || "Erreur création produit.");
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto pb-20">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Nouveau Produit</h1>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* SECTION 1: INFO GÉNÉRALES */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <label className="block text-gray-700 text-sm font-bold mb-2">Photo du produit *</label>
            <div className="relative aspect-square bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl overflow-hidden hover:bg-gray-100 transition cursor-pointer group">
              <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              {preview ? (
                <img src={preview} alt="Aperçu" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <Upload size={32} className="mb-2 group-hover:scale-110 transition" />
                  <span className="text-xs text-center px-2">Cliquez pour ajouter (JPG, PNG)</span>
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-2 space-y-4">
             <Input label="Titre" name="title" value={product.title} onChange={(e) => setProduct({...product, title: e.target.value})} placeholder="Ex: Chaise Moderne" />
             <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">Catégorie *</label>
                    <select required className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200" value={product.category_id} onChange={(e) => setProduct({...product, category_id: e.target.value})}>
                        <option value="">Sélectionner...</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                <Input label="Prix de base (€)" type="number" name="base_price" value={product.base_price} onChange={(e) => setProduct({...product, base_price: e.target.value})} />
             </div>
             <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">Description</label>
                <textarea className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200" rows="3" value={product.description} onChange={(e) => setProduct({...product, description: e.target.value})} />
             </div>
          </div>
        </div>

        {/* SECTION 2: PROMOTION & VENTE FLASH (NOUVEAU) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg">
                        <Zap size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">Promotion</h2>
                        <p className="text-xs text-gray-500">Activer une réduction ou une vente flash</p>
                    </div>
                </div>
                {/* Switch Toggle */}
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={isPromoActive} onChange={(e) => setIsPromoActive(e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                </label>
            </div>

            {/* Champs conditionnels */}
            {isPromoActive && (
                <motion.div 
                    initial={{ height: 0, opacity: 0 }} 
                    animate={{ height: 'auto', opacity: 1 }} 
                    className="grid md:grid-cols-2 gap-6 pt-4 border-t border-gray-100 overflow-hidden"
                >
                    <div>
                        <label className="block text-gray-700 text-sm font-semibold mb-2">Pourcentage de réduction (%)</label>
                        <div className="relative">
                            <input 
                                type="number" 
                                min="1" max="99" 
                                className="w-full pl-4 pr-10 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 font-bold focus:ring-red-500"
                                value={product.discount_percent}
                                onChange={(e) => setProduct({...product, discount_percent: e.target.value})}
                                placeholder="ex: 20"
                            />
                            <span className="absolute right-4 top-3 text-red-400 font-bold">%</span>
                        </div>
                        {product.base_price && product.discount_percent > 0 && (
                            <p className="text-xs text-gray-500 mt-2">
                                Nouveau prix : <span className="font-bold text-green-600">{(product.base_price * (1 - product.discount_percent / 100)).toFixed(2)} €</span>
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-gray-700 text-sm font-semibold mb-2">Fin de la promotion (Compte à rebours)</label>
                        <div className="relative">
                            <div className="absolute left-3 top-3 text-gray-400">
                                <Clock size={20}/>
                            </div>
                            <input 
                                type="datetime-local" 
                                className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-50 border border-gray-200"
                                value={product.promotion_end_date}
                                onChange={(e) => setProduct({...product, promotion_end_date: e.target.value})}
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Un compte à rebours s'affichera jusqu'à cette date.</p>
                    </div>
                </motion.div>
            )}
        </div>

        {/* SECTION 3: VARIANTES */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">Stock & Variantes</h2>
            <button type="button" onClick={addVariant} className="flex items-center gap-2 text-sm font-bold text-primary-600 hover:bg-primary-50 px-3 py-1 rounded-lg transition">
              <Plus size={18} /> Ajouter une ligne
            </button>
          </div>
          <div className="space-y-3">
            {variants.map((variant, index) => (
              <div key={index} className="flex flex-wrap md:flex-nowrap gap-2 items-end bg-gray-50 p-3 rounded-lg border border-gray-100">
                <input type="text" className="flex-1 p-2 rounded border border-gray-200 text-sm" placeholder="SKU/Réf" value={variant.sku} onChange={(e) => updateVariant(index, 'sku', e.target.value)} />
                <input type="text" className="w-24 p-2 rounded border border-gray-200 text-sm" placeholder="Couleur" value={variant.color} onChange={(e) => updateVariant(index, 'color', e.target.value)} />
                <input type="text" className="w-20 p-2 rounded border border-gray-200 text-sm" placeholder="Taille" value={variant.size} onChange={(e) => updateVariant(index, 'size', e.target.value)} />
                <input type="number" className="w-20 p-2 rounded border border-gray-200 text-sm" placeholder="Qty" value={variant.stock_quantity} onChange={(e) => updateVariant(index, 'stock_quantity', e.target.value)} />
                <button type="button" onClick={() => removeVariant(index)} className="p-2 text-red-500 hover:bg-red-50 rounded"><Trash size={16} /></button>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" className="w-full bg-black hover:bg-gray-800 text-white font-bold py-4 rounded-xl shadow-lg flex justify-center items-center gap-2 transition-transform active:scale-95">
          <Save size={20} /> Enregistrer le produit
        </button>
      </form>
    </motion.div>
  );
};

export default AddProduct;