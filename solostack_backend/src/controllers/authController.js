const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwtGenerator = require('../utils/jwtGenerator');

// --- INSCRIPTION ---
exports.register = async (req, res) => {
  try {
    // 1. Destructurer le body (ce que le frontend envoie)
    const { email, password, first_name, last_name, role } = req.body;

    // 2. Vérifier si l'utilisateur existe déjà
    const userExist = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExist.rows.length > 0) {
      return res.status(401).json({ error: 'Cet email est déjà utilisé.' });
    }

    // 3. Hacher le mot de passe (Sécurité)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 4. Insérer le nouvel utilisateur
    // On force le role 'customer' par défaut si le front essaie de tricher, sauf logique spécifique
    const validRole = role === 'vendor' ? 'vendor' : 'customer'; 

    const newUser = await db.query(
      'INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [email, passwordHash, first_name, last_name, validRole]
    );

    // 5. Générer le Token
    const token = jwtGenerator(newUser.rows[0].id, newUser.rows[0].role);

    res.json({ token, user: { id: newUser.rows[0].id, role: newUser.rows[0].role, first_name } });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur Serveur');
  }
};

// --- CONNEXION ---
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Vérifier si l'user existe
    const user = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
    }

    // 2. Vérifier le mot de passe
    const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
    }

    // 3. Générer le token
    const token = jwtGenerator(user.rows[0].id, user.rows[0].role);

    res.json({ token, user: { id: user.rows[0].id, role: user.rows[0].role, first_name: user.rows[0].first_name } });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur Serveur');
  }
};

// --- VÉRIFICATION (Pour garder l'user connecté quand on rafraichit la page) ---
exports.verify = async (req, res) => {
  try {
    // req.user vient du middleware authorize
    const user = await db.query('SELECT id, email, first_name, last_name, role FROM users WHERE id = $1', [req.user.id]);
    res.json(user.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur Serveur');
  }
};