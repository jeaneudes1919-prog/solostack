const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Configuration du stockage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Les fichiers vont ici
  },
  filename: function (req, file, cb) {
    // Renomme le fichier : uniqueID + extension (ex: a1b2-c3d4.png)
    cb(null, uuidv4() + path.extname(file.originalname));
  }
});

// Filtre pour n'accepter que les images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Seules les images sont autorisées !'));
  }
};

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // Limite 5MB
  fileFilter: fileFilter
});

module.exports = upload;