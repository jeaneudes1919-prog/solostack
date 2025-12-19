const db = require('../config/db');

exports.addReview = async (req, res) => {
  try {
    const { product_id, rating, comment } = req.body;
    const user_id = req.user.id;

    // 1. VÉRIFICATION D'ACHAT (La requête SQL magique)
    // On cherche si une ligne de commande existe pour cet user et ce produit
    const purchaseCheck = await db.query(`
      SELECT 1 
      FROM orders o
      JOIN sub_orders so ON o.id = so.parent_order_id
      JOIN order_items oi ON so.id = oi.sub_order_id
      JOIN product_variants pv ON oi.product_variant_id = pv.id
      WHERE o.user_id = $1 AND pv.product_id = $2
      LIMIT 1
    `, [user_id, product_id]);

    if (purchaseCheck.rows.length === 0) {
      return res.status(403).json({ error: "Vous devez acheter ce produit avant de laisser un avis." });
    }

    // 2. Insérer l'avis
    await db.query(
      'INSERT INTO reviews (user_id, product_id, rating, comment) VALUES ($1, $2, $3, $4)',
      [user_id, product_id, rating, comment]
    );

    res.json({ message: "Avis publié !" });

  } catch (err) {
    if (err.code === '23505') { // Déjà noté
      return res.status(400).json({ error: "Vous avez déjà noté ce produit." });
    }
    console.error(err);
    res.status(500).send('Erreur Serveur');
  }
};

exports.getProductReviews = async (req, res) => {
  try {
    const { id } = req.params; // ID du produit
    const reviews = await db.query(`
      SELECT r.*, u.first_name, u.last_name 
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.product_id = $1
      ORDER BY r.created_at DESC
    `, [id]);
    
    res.json(reviews.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur Serveur');
  }
};