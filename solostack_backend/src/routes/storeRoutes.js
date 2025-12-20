const router = require('express').Router();
const storeController = require('../controllers/storeController');
const authorize = require('../middlewares/authorize');
const multer = require('multer');

// --- CONFIGURATION MULTER (CORRIGÉE POUR RENDER) ---
// On n'utilise plus diskStorage, on utilise memoryStorage
const storage = multer.memoryStorage(); 

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // Optionnel: limite à 5Mo
});

// --- ROUTES ---

// 1. Routes Globales
router.get('/', storeController.getAllStores);

// 2. Création (Utilise upload.single)
router.post('/', authorize, upload.single('logo'), storeController.createStore);

// 3. Routes Spécifiques Vendeur
router.get('/me', authorize, storeController.getMyStore);
router.get('/stats', authorize, storeController.getDashboardStats);
router.get('/chart', authorize, storeController.getSalesChart);

// 4. Mise à jour (Utilise upload.single)
router.put('/update', authorize, upload.single('logo'), storeController.updateStore);

// 5. Actions Client
router.post('/review', authorize, storeController.addStoreReview);

// 6. Route Dynamique (En dernier)
router.get('/:id', storeController.getPublicStore);

module.exports = router;