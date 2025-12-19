import axios from 'axios';

// L'URL de ton backend (Vérifie le port, c'est souvent 5000)
const BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- INTERCEPTEUR (La magie) ---
// Avant chaque requête, on regarde si on a un token dans le stockage local
// et on l'ajoute automatiquement dans le header "Authorization"
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;