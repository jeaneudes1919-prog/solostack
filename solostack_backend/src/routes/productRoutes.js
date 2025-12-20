const router = require('express').Router();
const productController = require('../controllers/productController');
const categoryController = require('../controllers/categoryController');
const authorize = require('../middlewares/authorize');

// --- NOUVELLE CONFIGURATION MULTER (Mémoire vive) ---
const multer = require('multer');
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // Limite 5Mo
});

// --- Catégories ---
router.post('/categories', authorize, categoryController.createCategory);
router.get('/categories', categoryController.getAllCategories);

// --- Produits ---
router.get('/vendor', authorize, productController.getVendorProducts);
router.delete('/:id', authorize, productController.deleteProduct);

// ✅ Utilise bien upload.single('image')
router.post('/', authorize, upload.single('image'), productController.createProduct);
router.get('/', productController.getAllProducts);
router.put('/:id', authorize, upload.single('image'), productController.updateProduct);

router.get('/home-data', productController.getHomeData);
router.get('/:id/reviews', productController.getProductReviews);
router.post('/:id/reviews', authorize, productController.addProductReview);

module.exports = router;