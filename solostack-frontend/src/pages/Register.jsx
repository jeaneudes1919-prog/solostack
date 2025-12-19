import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import Input from '../components/ui/Input';

const Register = () => {
  const navigate = useNavigate();
  const register = useAuthStore((state) => state.register);
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', email: '', password: '', role: 'customer'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await register(formData);
    if (result.success) {
      toast.success('Compte créé avec succès !');
      // Si c'est un vendeur, on redirige vers la création de boutique (module suivant)
      // Si c'est un client, vers ses commandes
      navigate(formData.role === 'vendor' ? '/dashboard/create-store' : '/dashboard/orders');
    } else {
      toast.error(result.error);
    }
  };

  const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 px-4 py-10">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
      >
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Créer un compte</h2>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Prénom" type="text" name="first_name" value={formData.first_name} onChange={handleChange} placeholder="Jean" />
            <Input label="Nom" type="text" name="last_name" value={formData.last_name} onChange={handleChange} placeholder="Dupont" />
          </div>
          <Input label="Email" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="jean@exemple.com" />
          <Input label="Mot de passe" type="password" name="password" value={formData.password} onChange={handleChange} placeholder="6 caractères min." />

          {/* Sélecteur de Rôle Animé */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-semibold mb-2">Je veux...</label>
            <div className="flex bg-gray-100 p-1 rounded-lg">
              {['customer', 'vendor'].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setFormData({...formData, role})}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-300 ${
                    formData.role === role 
                    ? 'bg-white text-primary-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {role === 'customer' ? 'Acheter' : 'Vendre'}
                </button>
              ))}
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-primary-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:bg-primary-600 transition"
            type="submit"
          >
            Commencer l'aventure
          </motion.button>
        </form>

        <p className="mt-6 text-center text-gray-600 text-sm">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-primary-500 font-bold hover:underline">Se connecter</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;