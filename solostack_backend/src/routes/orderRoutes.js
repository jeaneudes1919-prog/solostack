const router = require('express').Router();
const orderController = require('../controllers/orderController');
const authorize = require('../middlewares/authorize');

// Acheteur : Passer commande
router.post('/', authorize, orderController.createOrder);

// Acheteur : Voir mes achats
router.get('/my-orders', authorize, orderController.getMyOrders);

// Vendeur : Voir mes ventes (Dashboard)
router.get('/vendor-orders', authorize, orderController.getVendorOrders);

module.exports = router;