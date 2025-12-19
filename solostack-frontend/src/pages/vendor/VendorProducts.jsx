import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit, Trash2, Plus, Package, Search, X, Save, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';
import Input from '../../components/ui/Input';

const BASE_IMG_URL = 'http://localhost:5000';

// --- MODALE D'ÉDITION ---
const EditProductModal = ({ isOpen, onClose, product, onUpdateSuccess }) => {
  const [formData, setFormData] = useState({
    title: '', description: '', base_price: '', category_id: '', image: null
  });
  const [variants, setVariants] = useState([]);
  const [preview, setPreview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && product) {
      api.get('/products/categories').then(res => setCategories(res.data));

      setFormData({
        title: product.title,
        description: product.description,
        base_price: product.base_price,
        category_id: product.category_id,
        image: null
      });

      if (product.image_url) setPreview(product.image_url);

      // Variantes : on inclut désormais id (variant_id)
      if (product.variants) {
        const formattedVars = product.variants.map(v => ({
          id: v.id || null, // variant_id pour backend
          sku: v.sku,
          stock_quantity: v.stock_quantity,
          color: v.attributes?.color || '',
          size: v.attributes?.size || ''
        }));
        setVariants(formattedVars);
      }
    }
  }, [isOpen, product]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleVariantChange = (index, field, value) => {
    const newVars = [...variants];
    newVars[index][field] = value;
    setVariants(newVars);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('base_price', formData.base_price);
      data.append('category_id', formData.category_id);
      if (formData.image) data.append('image', formData.image);

      // Variantes : on envoie id pour update ou null pour création
      const formattedVariants = variants.map(v => ({
        id: v.id, 
        sku: v.sku,
        stock_quantity: parseInt(v.stock_quantity),
        price_adjustment: 0,
        attributes: { color: v.color, size: v.size }
      }));

      data.append('variants', JSON.stringify(formattedVariants));

      await api.put(`/products/${product.id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success("Produit modifié avec succès !");
      onUpdateSuccess();
      onClose();
    } catch (err) {
      toast.error("Erreur lors de la modification.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8 overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="px-8 py-5 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Edit className="text-primary-500" /> Modifier le produit
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition"><X size={24} /></button>
        </div>

        <div className="p-8 overflow-y-auto custom-scrollbar">
          <form id="edit-form" onSubmit={handleSubmit} className="space-y-8">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="col-span-1">
                <label className="block text-sm font-bold text-gray-700 mb-2">Image du produit</label>
                <div className="relative aspect-square rounded-xl overflow-hidden border-2 border-dashed border-gray-300 group hover:border-primary-500 transition">
                  <input type="file" onChange={handleImageChange} className="absolute inset-0 z-10 opacity-0 cursor-pointer" accept="image/*" />
                  {preview ? (
                    <img src={preview} alt="Aperçu" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400"><Upload /></div>
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white font-bold">Changer</div>
                </div>
              </div>

              <div className="col-span-2 space-y-4">
                <Input label="Titre" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Catégorie</label>
                    <select 
                      className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200"
                      value={formData.category_id}
                      onChange={e => setFormData({...formData, category_id: e.target.value})}
                    >
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <Input label="Prix" type="number" value={formData.base_price} onChange={e => setFormData({...formData, base_price: e.target.value})} />
                </div>
                <div>
                   <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                   <textarea className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200" rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800">Variantes</h3>
                <button type="button" onClick={() => setVariants([...variants, {id:null, sku:'', color:'', size:'', stock_quantity:0}])} className="text-sm font-bold text-primary-600 flex items-center gap-1"><Plus size={16}/> Ajouter</button>
              </div>
              <div className="space-y-3">
                {variants.map((v, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input className="w-20 p-2 rounded border text-sm" placeholder="SKU" value={v.sku} onChange={e => handleVariantChange(i, 'sku', e.target.value)} />
                    <input className="w-20 p-2 rounded border text-sm" placeholder="Couleur" value={v.color} onChange={e => handleVariantChange(i, 'color', e.target.value)} />
                    <input className="w-20 p-2 rounded border text-sm" placeholder="Taille" value={v.size} onChange={e => handleVariantChange(i, 'size', e.target.value)} />
                    <input className="w-20 p-2 rounded border text-sm" type="number" placeholder="Stock" value={v.stock_quantity} onChange={e => handleVariantChange(i, 'stock_quantity', e.target.value)} />
                    <button type="button" onClick={() => setVariants(variants.filter((_, idx) => idx !== i))} className="text-red-500"><Trash2 size={16}/></button>
                  </div>
                ))}
              </div>
            </div>
          </form>
        </div>

        <div className="px-8 py-5 border-t bg-gray-50 flex justify-end gap-4">
          <button onClick={onClose} type="button" className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition">Annuler</button>
          <button form="edit-form" disabled={loading} type="submit" className="px-6 py-3 rounded-xl font-bold text-white bg-primary-500 hover:bg-primary-600 shadow-lg shadow-primary-500/30 transition flex items-center gap-2">
            {loading ? 'Sauvegarde...' : <><Save size={20} /> Confirmer les modifications</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// --- PAGE PRINCIPALE ---
const VendorProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products/vendor');
      // Assurer que chaque variante a bien un ID
      const formatted = res.data.map(p => ({
        ...p,
        variants: (p.variants || []).map(v => ({id:v.id, ...v}))
      }));
      setProducts(formatted);
    } catch (err) {
      console.error(err);
      toast.error("Impossible de charger vos produits.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce produit définitivement ?")) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts(products.filter(p => p.id !== id));
      toast.success("Produit supprimé.");
    } catch (err) {
      toast.error("Erreur suppression.");
    }
  };

  const openEditModal = (product) => {
    setSelectedProduct(product);
    setEditModalOpen(true);
  };

  const filteredProducts = products.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) return <div className="p-10 text-center animate-pulse">Chargement...</div>;

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Mes Produits</h1>
          <Link to="/vendor/add-product" className="bg-primary-500 text-white px-6 py-3 rounded-xl font-bold flex gap-2 hover:scale-105 transition"><Plus /> Ajouter</Link>
        </div>

        <div className="bg-white p-4 rounded-xl border mb-6 flex gap-2">
           <Search className="text-gray-400" />
           <input type="text" placeholder="Rechercher..." className="flex-1 outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>

        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4">Produit</th>
                <th className="p-4">Prix</th>
                <th className="p-4">Stock</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => {
                const imgUrl = product.image_url ? product.image_url : null;
                const stock = parseInt(product.total_stock);
                return (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 flex gap-3 items-center">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                        {imgUrl ? <img src={imgUrl} className="w-full h-full object-cover" /> : <Package className="m-auto mt-3 text-gray-400" />}
                      </div>
                      <span className="font-bold">{product.title}</span>
                    </td>
                    <td className="p-4 font-bold">{product.base_price} €</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {stock > 0 ? `${stock} en stock` : 'Rupture'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => openEditModal(product)} className="text-blue-500 p-2 hover:bg-blue-50 rounded"><Edit size={18} /></button>
                      <button onClick={() => handleDelete(product.id)} className="text-red-500 p-2 hover:bg-red-50 rounded"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      <AnimatePresence>
        {editModalOpen && (
          <EditProductModal
            isOpen={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            product={selectedProduct}
            onUpdateSuccess={fetchProducts}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default VendorProducts;
