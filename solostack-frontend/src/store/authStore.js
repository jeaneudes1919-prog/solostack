import { create } from 'zustand';
import api from '../api/axios';

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,

  // Fonction de Login
  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const res = await api.post('/auth/login', { email, password });
      
      // Sauvegarde dans le localStorage
      localStorage.setItem('token', res.data.token);
      
      set({ 
        user: res.data.user, 
        token: res.data.token, 
        isAuthenticated: true, 
        isLoading: false 
      });
      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.response?.data?.error || 'Erreur de connexion' };
    }
  },

  // Fonction de Register
  register: async (userData) => {
    set({ isLoading: true });
    try {
      const res = await api.post('/auth/register', userData);
      localStorage.setItem('token', res.data.token);
      set({ 
        user: res.data.user, 
        token: res.data.token, 
        isAuthenticated: true, 
        isLoading: false 
      });
      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.response?.data?.errors?.[0]?.msg || error.response?.data?.error };
    }
  },

  // Fonction de Logout
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  // Vérifier le token au chargement de l'app
  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const res = await api.get('/auth/verify');
        set({ user: res.data, isAuthenticated: true });
      } catch (err) {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
      }
    }
  }
}));

export default useAuthStore;