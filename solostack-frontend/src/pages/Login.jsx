import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import Input from '../components/ui/Input';

const Login = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(formData.email, formData.password);
    if (result.success) {
      toast.success('Bon retour parmi nous !');
      navigate('/dashboard');
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
      >
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Connexion</h2>
        <p className="text-center text-gray-500 mb-8">Accédez à votre espace SoloStack</p>

        <form onSubmit={handleSubmit}>
          <Input 
            label="Email" type="email" name="email" 
            placeholder="jean@exemple.com"
            value={formData.email} 
            onChange={(e) => setFormData({...formData, email: e.target.value})} 
          />
          <Input 
            label="Mot de passe" type="password" name="password" 
            placeholder="••••••••"
            value={formData.password} 
            onChange={(e) => setFormData({...formData, password: e.target.value})} 
          />

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-primary-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg shadow-primary-500/30 hover:bg-primary-600 transition duration-300"
            type="submit"
          >
            Se connecter
          </motion.button>
        </form>

        <p className="mt-6 text-center text-gray-600 text-sm">
          Pas encore de compte ?{' '}
          <Link to="/register" className="text-primary-500 font-bold hover:underline">S'inscrire</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;