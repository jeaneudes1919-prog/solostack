const router = require('express').Router();
const statsController = require('../controllers/statsController');

// La route est juste '/' car elle sera préfixée par '/api/stats' dans server.js
router.get('/', statsController.getGlobalStats);

module.exports = router;