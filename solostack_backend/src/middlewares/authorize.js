const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = async (req, res, next) => {
  // 1. Récupérer le token du header (Format: "Bearer eyJhbG...")
  const authHeader = req.header('Authorization');
  
  if (!authHeader) {
    return res.status(403).json({ error: 'Accès refusé. Token manquant.' });
  }

  const token = authHeader.split(" ")[1]; // On enlève le mot "Bearer"

  // 2. Vérifier le token
  try {
    const verify = jwt.verify(token, process.env.JWT_SECRET);
    
    // On ajoute les infos de l'user (id, role) à la requête pour la suite
    req.user = verify.user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token invalide ou expiré.' });
  }
};