const multer = require('multer');
const path = require('path');

// --- CONFIGURATION POUR RENDER (MÉMOIRE VIVE) ---
// On utilise memoryStorage au lieu de diskStorage
const storage = multer.memoryStorage();

// Filtre pour n'accepter que les images (On garde ta logique de sécurité)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  
  // Vérification de l'extension
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  // Vérification du type MIME
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    // On passe une erreur plus propre
    cb(new Error('Format de fichier non supporté. Seuls JPEG, JPG, PNG et WEBP sont autorisés.'));
  }
};

const upload = multer({ 
  storage: storage,
  limits: { 
    fileSize: 1024 * 1024 * 5 // Limite toujours à 5MB
  },
  fileFilter: fileFilter
});

module.exports = upload;