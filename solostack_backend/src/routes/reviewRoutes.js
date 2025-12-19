const router = require('express').Router();
const reviewController = require('../controllers/reviewController');
const authorize = require('../middlewares/authorize');

// Poster un avis (Besoin d'être connecté)
router.post('/', authorize, reviewController.addReview);

// Lire les avis (Public, pas besoin de token)
router.get('/:id', reviewController.getProductReviews);

module.exports = router;