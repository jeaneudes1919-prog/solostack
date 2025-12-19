const router = require('express').Router();
const authController = require('../controllers/authController');
const authorize = require('../middlewares/authorize');
const { check, validationResult } = require('express-validator');

// Middleware de validation simple
const validateInput = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Route: POST /api/auth/register
router.post('/register', [
  check('email', 'Veuillez fournir un email valide').isEmail(),
  check('password', 'Le mot de passe doit faire 6 caractères min').isLength({ min: 6 }),
  check('first_name', 'Le prénom est requis').not().isEmpty()
], validateInput, authController.register);

// Route: POST /api/auth/login
router.post('/login', [
  check('email', 'Email valide requis').isEmail(),
  check('password', 'Mot de passe requis').exists()
], validateInput, authController.login);

// Route: GET /api/auth/verify (Protégée)
router.get('/verify', authorize, authController.verify);

module.exports = router;