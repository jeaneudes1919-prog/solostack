const db = require('../config/db');
const slugify = require('slugify');

exports.createCategory = async (req, res) => {
  // Réservé Admin normalement (on simplifie pour le dev)
  try {
    const { name, parent_id } = req.body;
    const slug = slugify(name, { lower: true });
    
    const newCat = await db.query(
      'INSERT INTO categories (name, slug, parent_id) VALUES ($1, $2, $3) RETURNING *',
      [name, slug, parent_id || null]
    );
    res.json(newCat.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur Serveur');
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await db.query('SELECT * FROM categories ORDER BY id ASC');
    res.json(categories.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur Serveur');
  }
};