const router = require('express').Router();
const storeController = require('../controllers/storeController');
const authorize = require('../middlewares/authorize');
const multer = require('multer');
const path = require('path');

// --- CONFIGURATION MULTER (Spécifique aux Boutiques) ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Assure-toi que le dossier 'uploads/' existe à la racine du projet
    cb(null, 'uploads/'); 
  },
  filename: function (req, file, cb) {
    // Nom unique : store-TIMESTAMP.jpg
    cb(null, 'store-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// --- ROUTES ---

// 1. Routes Globales (Pas d'ID spécifique)
router.get('/', storeController.getAllStores); // Lister toutes les boutiques

// 2. Création (Nécessite Auth + Upload)
router.post('/', authorize, upload.single('logo'), storeController.createStore);

// 3. Routes Spécifiques Vendeur (Dashboard / Moi)
// ATTENTION : Ces routes doivent être AVANT router.get('/:id')
router.get('/me', authorize, storeController.getMyStore);
router.get('/stats', authorize, storeController.getDashboardStats);
router.get('/chart', authorize, storeController.getSalesChart);

// 4. Mise à jour (Auth + Upload)
router.put('/update', authorize, upload.single('logo'), storeController.updateStore);

// 5. Actions Client
router.post('/review', authorize, storeController.addStoreReview);

// 6. Route Dynamique (Doit être en DERNIER pour ne pas bloquer /me ou /stats)
// Car si tu mets ça en premier, express pensera que "me" est un ID
router.get('/:id', storeController.getPublicStore);

module.exports = router;