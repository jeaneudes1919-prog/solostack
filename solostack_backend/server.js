const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const db = require('./src/config/db'); // pool PostgreSQL

const app = express();
const statsRoutes = require('./src/routes/statsRoutes');

// Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ROUTES API
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/stores', require('./src/routes/storeRoutes'));
app.use('/api/products', require('./src/routes/productRoutes'));
app.use('/api/orders', require('./src/routes/orderRoutes'));
app.use('/api/reviews', require('./src/routes/reviewRoutes'));
app.use('/api/stats', statsRoutes);

// Route racine
app.get('/', (req, res) => {
  res.json({ message: 'API SoloStack fonctionnelle 🚀' });
});

// Route test DB
app.get('/api/test-db', async (req, res) => {
  try {
    const result = await db.query('SELECT current_schema(), NOW()');
    res.json({
      status: 'Connecté',
      schema: result.rows[0].current_schema,
      time: result.rows[0].now
    });
  } catch (err) {
    res.status(500).json({
      error: 'Erreur de connexion base de données',
      details: err.message
    });
  }
});

// Test connexion DB au démarrage
db.query('SELECT NOW()')
  .then(() => console.log('✅ Base de Données connectée !'))
  .catch(err => console.error('❌ Erreur DB', err));

const PORT = process.env.PORT || 5000;

// Démarrage serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});
