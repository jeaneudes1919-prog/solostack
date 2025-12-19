const db = require('../config/db'); // Assure-toi que le chemin vers ta DB est bon

exports.getGlobalStats = async (req, res) => {
    try {
        // On lance les 3 requêtes en parallèle pour aller plus vite
        const [products, vendors, sales] = await Promise.all([
            db.query('SELECT COUNT(*) FROM products'),
            db.query('SELECT COUNT(*) FROM stores'),
            // Si tu as une table 'orders' ou 'sub_orders', adapte ici :
            db.query('SELECT COUNT(*) FROM sub_orders') 
        ]);

        res.json({
            products: parseInt(products.rows[0].count),
            vendors: parseInt(vendors.rows[0].count),
            sales: parseInt(sales.rows[0].count)
        });
    } catch (err) {
        console.error("Erreur stats globales:", err);
        // En cas d'erreur, on renvoie des valeurs par défaut pour ne pas casser le front
        res.json({ products: 0, vendors: 0, sales: 0 });
    }
};