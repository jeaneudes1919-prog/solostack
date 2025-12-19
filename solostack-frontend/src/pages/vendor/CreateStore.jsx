import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Store } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';
import Input from '../../components/ui/Input';

const CreateStore = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [logo, setLogo] = useState(null); // Variable manquante ajoutée

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const data = new FormData();
            data.append('name', formData.name); // Utilisation correcte de formData.name
            data.append('description', formData.description); // Utilisation correcte de formData.description
            if (logo) {
                data.append('logo', logo);
            }

            // Un seul appel API
            await api.post('/stores', data, { headers: { 'Content-Type': 'multipart/form-data' } });
            
            toast.success('Boutique créée avec succès !');
            // Redirection et rechargement
            window.location.href = '/vendor/dashboard'; 

        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.error || 'Erreur lors de la création');
        }
    };

    return (
        <div className="max-w-2xl mx-auto pt-10">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100"
            >
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-primary-100 rounded-full text-primary-600">
                        <Store size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Configurez votre Boutique</h1>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-semibold mb-2">Logo de la boutique</label>
                        <input type="file" accept="image/*" onChange={(e) => setLogo(e.target.files[0])} className="w-full" />
                    </div>
                    
                    <Input
                        label="Nom de la boutique"
                        name="name"
                        placeholder="Ex: Nike Official"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />

                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-semibold mb-2">Description</label>
                        <textarea
                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all"
                            rows="4"
                            placeholder="Dites-nous ce que vous vendez..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        ></textarea>
                    </div>

                    <button type="submit" className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 px-6 rounded-xl transition shadow-lg shadow-primary-500/30">
                        Lancer ma boutique 🚀
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default CreateStore;