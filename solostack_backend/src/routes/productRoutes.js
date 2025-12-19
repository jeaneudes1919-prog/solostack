const router = require('express').Router();
const productController = require('../controllers/productController');
const categoryController = require('../controllers/categoryController');
const authorize = require('../middlewares/authorize');
const upload = require('../middlewares/upload');

// --- Catégories ---
router.post('/categories', authorize, categoryController.createCategory);
router.get('/categories', categoryController.getAllCategories);

// --- Produits ---
// Note: On utilise upload.array('images') si on voulait des images, 
// ici on utilise upload.none() car on gère les données JSON complexes pour l'instant
router.get('/vendor', authorize, productController.getVendorProducts);
router.delete('/:id', authorize, productController.deleteProduct);
router.post('/', authorize, upload.single('image'), productController.createProduct);
router.get('/', productController.getAllProducts);
router.put('/:id', authorize, upload.single('image'), productController.updateProduct);
router.get('/home-data', productController.getHomeData);
router.get('/:id/reviews', productController.getProductReviews);
router.post('/:id/reviews', authorize, productController.addProductReview);
module.exports = router;