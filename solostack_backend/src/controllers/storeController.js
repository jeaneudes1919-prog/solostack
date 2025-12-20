const db = require('../config/db');
const slugify = require('slugify');
const cloudinary = require('../config/cloudinary'); // Importe ton fichier config/cloudinary.js
const streamifier = require('streamifier');

// --- FONCTION UTILITAIRE : Upload Buffer vers Cloudinary (INDISPENSABLE POUR RENDER) ---
// Cette fonction transforme le fichier stocké en RAM par Multer en flux pour Cloudinary
const streamUpload = (file) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'ecommerce_stores' }, 
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      }
    );
    streamifier.createReadStream(file.buffer).pipe(stream);
  });
};

// --- CRÉER UNE BOUTIQUE ---
exports.createStore = async (req, res) => {
  try {
    const { name, description } = req.body;
    const owner_id = req.user.id; 

    // 1. Générer le slug
    const slug = slugify(name, { lower: true, strict: true });

    // 2. Gestion Logo (CORRIGÉE : Utilise le buffer)
    let logo_url = null; 
    
    if (req.file) {
      // ✅ Correction ici : on n'utilise plus req.file.path mais streamUpload
      const result = await streamUpload(req.file);
      logo_url = result.secure_url;
    }

    // 3. Insertion
    const newStore = await db.query(
      'INSERT INTO stores (owner_id, name, slug, description, logo_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [owner_id, name, slug, description, logo_url]
    );

    // 4. Mettre à jour le rôle de l'user
    await db.query("UPDATE users SET role = 'vendor' WHERE id = $1", [owner_id]);

    res.json(newStore.rows[0]);

  } catch (err) {
    if (err.code === '23505') { 
      return res.status(400).json({ error: 'Ce nom de boutique est déjà pris.' });
    }
    console.error("Erreur Create Store:", err);
    res.status(500).send('Erreur Serveur');
  }
};

// --- VOIR MA BOUTIQUE (Dashboard) ---
exports.getMyStore = async (req, res) => {
  try {
    const store = await db.query('SELECT * FROM stores WHERE owner_id = $1', [req.user.id]);
    if (store.rows.length === 0) return res.status(404).json({ msg: "Pas de boutique trouvée" });
    res.json(store.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur Serveur');
  }
};

// --- STATISTIQUES DASHBOARD ---
exports.getDashboardStats = async (req, res) => {
  try {
    const owner_id = req.user.id;

    const storeRes = await db.query('SELECT id FROM stores WHERE owner_id = $1', [owner_id]);
    if (storeRes.rows.length === 0) return res.status(404).json({ error: "Boutique introuvable" });
    const store_id = storeRes.rows[0].id;

    const statsQuery = `
      SELECT 
        (SELECT COALESCE(SUM(payout_amount), 0) FROM sub_orders WHERE store_id = $1) as total_revenue,
        (SELECT COUNT(*) FROM sub_orders WHERE store_id = $1) as total_orders,
        (SELECT COUNT(*) FROM products WHERE store_id = $1) as total_products,
        (SELECT AVG(rating) FROM store_reviews WHERE store_id = $1) as average_rating,
        (SELECT views FROM stores WHERE id = $1) as total_views
    `;

    const result = await db.query(statsQuery, [store_id]);
    res.json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur Serveur');
  }
};

// --- AVIS SUR LA BOUTIQUE ---
exports.addStoreReview = async (req, res) => {
  try {
    const { store_id, rating, comment } = req.body;
    const user_id = req.user.id;

    const purchaseCheck = await db.query(`
      SELECT 1 FROM sub_orders so 
      JOIN orders o ON so.parent_order_id = o.id
      WHERE so.store_id = $1 AND o.user_id = $2
      LIMIT 1
    `, [store_id, user_id]);

    if (purchaseCheck.rows.length === 0) {
      return res.status(403).json({ error: "Vous devez avoir commandé ici pour noter la boutique." });
    }

    await db.query(
      'INSERT INTO store_reviews (store_id, user_id, rating, comment) VALUES ($1, $2, $3, $4)',
      [store_id, user_id, rating, comment]
    );

    res.json({ message: "Merci pour votre avis sur la boutique !" });

  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur');
  }
};

// --- CHART DATA (7 derniers jours) ---
exports.getSalesChart = async (req, res) => {
  try {
    const owner_id = req.user.id;
    const query = `
      SELECT TO_CHAR(created_at, 'Day') as day_name, SUM(payout_amount) as total
      FROM sub_orders 
      WHERE store_id = (SELECT id FROM stores WHERE owner_id = $1)
      AND created_at > NOW() - INTERVAL '7 days'
      GROUP BY day_name, DATE(created_at)
      ORDER BY DATE(created_at) ASC
    `;
    const result = await db.query(query, [owner_id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur');
  }
};

// --- PAGE PUBLIQUE BOUTIQUE ---
exports.getPublicStore = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('UPDATE stores SET views = views + 1 WHERE id = $1', [id]);

    const storeRes = await db.query('SELECT id, name, description, logo_url, created_at FROM stores WHERE id = $1', [id]);
    if (storeRes.rows.length === 0) return res.status(404).json({ error: "Boutique introuvable" });

    const productsRes = await db.query(`
      SELECT p.*,
      COALESCE(AVG(pr.rating), 0) as average_rating,
      COUNT(pr.id) as review_count
      FROM products p
      LEFT JOIN product_reviews pr ON p.id = pr.product_id
      WHERE p.store_id = $1 AND p.is_active = TRUE 
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `, [id]);

    res.json({
      store: storeRes.rows[0],
      products: productsRes.rows
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur Serveur');
  }
};

// --- METTRE À JOUR LA BOUTIQUE (CORRIGÉE : Utilise le buffer) ---
exports.updateStore = async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.id;
    
    let query = 'UPDATE stores SET name = $1, description = $2';
    let params = [name, description];
    
    if (req.file) {
      // ✅ Correction ici : on n'utilise plus req.file.path
      const result = await streamUpload(req.file);
      
      query += ', logo_url = $3 WHERE owner_id = $4 RETURNING *';
      params.push(result.secure_url, userId);
    } else {
      query += ' WHERE owner_id = $3 RETURNING *';
      params.push(userId);
    }

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Boutique introuvable" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("ERREUR UPDATE STORE:", err);
    res.status(500).send('Erreur serveur');
  }
};

// --- LISTER TOUTES LES BOUTIQUES ---
exports.getAllStores = async (req, res) => {
  try {
    const query = `
      SELECT s.id, s.name, s.logo_url, s.description, s.created_at,
      (SELECT COUNT(*) FROM products WHERE store_id = s.id AND is_active = TRUE) as product_count,
      (SELECT COUNT(*) FROM sub_orders WHERE store_id = s.id) as sales_count
      FROM stores s
      ORDER BY sales_count DESC
    `;
    const result = await db.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur Serveur');
  }
};