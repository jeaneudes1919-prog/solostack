import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Store, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';

const EditStoreModal = ({ isOpen, onClose, storeData, onUpdateSuccess }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [preview, setPreview] = useState(null); // Pour prévisualiser l'image
  const [loading, setLoading] = useState(false);

  // Remplir les champs à l'ouverture
  useEffect(() => {
    if (storeData) {
      setName(storeData.name || '');
      setDescription(storeData.description || '');
      setPreview(storeData.logo_url ? `http://localhost:5000${storeData.logo_url}` : null);
    }
  }, [storeData, isOpen]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setPreview(URL.createObjectURL(file)); // Créer une URL temporaire pour la prévisu
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Pour envoyer des fichiers, il faut utiliser FormData
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      if (logoFile) {
        formData.append('logo', logoFile);
      }

      const res = await api.put('/stores/update', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success("Boutique mise à jour !");
      onUpdateSuccess(res.data); // Mettre à jour l'affichage parent
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
      >
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Modifier ma Boutique</h2>
            <button onClick={onClose}><X className="text-gray-400 hover:text-gray-600" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* 1. GESTION DU LOGO */}
            <div className="flex flex-col items-center gap-4">
                <div className="relative group w-32 h-32">
                    <div className="w-full h-full rounded-full overflow-hidden border-4 border-gray-100 shadow-sm">
                        {preview ? (
                            <img src={preview} alt="Logo Preview" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-300">
                                <Store size={40} />
                            </div>
                        )}
                    </div>
                    {/* Bouton Overlay */}
                    <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer text-white font-bold text-sm">
                        <Upload size={20} className="mr-1"/> Changer
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                    </label>
                </div>
                <p className="text-xs text-gray-500">Cliquez sur l'image pour modifier le logo</p>
            </div>

            {/* 2. CHAMPS TEXTE */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Nom de la boutique</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                />
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                <textarea 
                  rows="3"
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="Dites-nous en plus sur votre univers..."
                />
            </div>

            <button 
              disabled={loading}
              className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-black transition flex items-center justify-center gap-2"
            >
              {loading ? 'Sauvegarde...' : <><Save size={18} /> Enregistrer les modifications</>}
            </button>
        </form>
      </motion.div>
    </div>
  );
};

export default EditStoreModal;