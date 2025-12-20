const db = require('../config/db');
const slugify = require('slugify');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier'); // ⚠️ Installe-le : npm install streamifier

// --- FONCTION UTILITAIRE : Upload Buffer vers Cloudinary ---
// C'est ça qui va sauver ton déploiement Render !
const streamUpload = (file) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'ecommerce_products' },
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

// --- CRÉATION DE PRODUIT AVEC VARIANTES ---
exports.createProduct = async (req, res) => {
  const client = await db.pool.connect();
  
  try {
    await client.query('BEGIN');

    // 1. GESTION DE L'IMAGE (CORRIGÉE POUR RENDER)
    if (!req.file) {
      throw new Error("L'image du produit est obligatoire.");
    }

    // ✅ ON UTILISE LE STREAM AU LIEU DE req.file.path
    const result = await streamUpload(req.file);
    const image_url = result.secure_url;

    // 2. RÉCUPÉRATION DES DONNÉES
    const { 
      title, description, base_price, category_id, variants,
      discount_percent, is_promotion, promotion_end_date
    } = req.body;
    
    const validCategoryId = category_id && category_id !== '' ? parseInt(category_id) : null;
    if (!validCategoryId) throw new Error("La catégorie est obligatoire.");

    const parsedVariants = JSON.parse(variants); 
    const owner_id = req.user.id;

    const storeCheck = await client.query('SELECT id FROM stores WHERE owner_id = $1', [owner_id]);
    if (storeCheck.rows.length === 0) throw new Error("Boutique introuvable.");
    const store_id = storeCheck.rows[0].id;

    const slug = slugify(title, { lower: true, strict: true }) + '-' + Date.now();
    
    const isPromoBool = is_promotion === 'true' || is_promotion === true;
    const finalDiscount = isPromoBool ? parseInt(discount_percent) || 0 : 0;
    const finalEndDate = (isPromoBool && promotion_end_date) ? promotion_end_date : null;

    // 4. INSERTION PRODUIT
    const productRes = await client.query(
      `INSERT INTO products (
          store_id, category_id, title, slug, description, base_price, image_url,
          discount_percent, is_promotion, promotion_end_date
       ) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
       RETURNING id`,
      [
        store_id, validCategoryId, title, slug, description, base_price, image_url,
        finalDiscount, isPromoBool, finalEndDate
      ]
    );
    const productId = productRes.rows[0].id;

    for (const variant of parsedVariants) {
      await client.query(
        `INSERT INTO product_variants (product_id, sku, price_adjustment, stock_quantity, attributes) 
         VALUES ($1, $2, $3, $4, $5)`,
        [productId, variant.sku, variant.price_adjustment || 0, variant.stock_quantity, variant.attributes]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ message: "Produit créé avec succès", productId });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Erreur Création Produit:", err);
    res.status(500).json({ error: err.message || 'Erreur création produit' });
  } finally {
    client.release();
  }
};

// ... (Garde getAllProducts et getVendorProducts tels quels) ...
// --- LISTER LES PRODUITS (Public + Filtres) ---
exports.getAllProducts = async (req, res) => {
    try {
      const query = `
        SELECT p.*, s.name as store_name, s.logo_url,
        COALESCE(AVG(pr.rating), 0) as average_rating,
        COUNT(pr.id) as review_count,
        (
          SELECT json_agg(json_build_object(
            'id', pv.id,
            'price_adjustment', pv.price_adjustment,
            'stock_quantity', pv.stock_quantity,
            'attributes', pv.attributes
          ))
          FROM product_variants pv
          WHERE pv.product_id = p.id
        ) as variants
        FROM products p 
        JOIN stores s ON p.store_id = s.id 
        LEFT JOIN product_reviews pr ON p.id = pr.product_id
        WHERE p.is_active = TRUE 
        GROUP BY p.id, s.id 
        ORDER BY p.created_at DESC
      `;
      const result = await db.query(query);
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).send('Erreur Serveur');
    }
  };

  exports.getVendorProducts = async (req, res) => {
    try {
      const owner_id = req.user.id;
      const storeRes = await db.query('SELECT id FROM stores WHERE owner_id = $1', [owner_id]);
      if (storeRes.rows.length === 0) return res.status(404).json({ error: "Boutique introuvable" });
      const store_id = storeRes.rows[0].id;
      const query = `
        SELECT p.*, c.name as category_name,
        (SELECT COALESCE(SUM(stock_quantity), 0) FROM product_variants pv WHERE pv.product_id = p.id) as total_stock
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.store_id = $1
        ORDER BY p.created_at DESC
      `;
      const result = await db.query(query, [store_id]);
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).send('Erreur Serveur');
    }
  };

  exports.deleteProduct = async (req, res) => {
    try {
      const { id } = req.params;
      const owner_id = req.user.id;
      const checkQuery = `
        SELECT p.id 
        FROM products p 
        JOIN stores s ON p.store_id = s.id 
        WHERE p.id = $1 AND s.owner_id = $2
      `;
      const check = await db.query(checkQuery, [id, owner_id]);
      if (check.rows.length === 0) {
        return res.status(403).json({ error: "Accès interdit ou produit introuvable." });
      }
      await db.query('DELETE FROM products WHERE id = $1', [id]);
      res.json({ message: "Produit supprimé avec succès." });
    } catch (err) {
      console.error(err);
      res.status(500).send('Erreur Serveur');
    }
  };

// --- METTRE À JOUR UN PRODUIT (CORRIGÉ AUSSI) ---
exports.updateProduct = async (req, res) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;
    const { title, description, base_price, category_id, variants } = req.body;
    
    let imageQueryPart = "";
    const queryParams = [title, description, base_price, parseInt(category_id), id];
    let paramIndex = 6; 

    if (req.file) {
      // ✅ ON UTILISE LE STREAM ICI AUSSI
      const result = await streamUpload(req.file);
      const image_url = result.secure_url;
      
      imageQueryPart = `, image_url = $${paramIndex}`;
      queryParams.push(image_url);
    }

    await client.query(
      `UPDATE products 
       SET title = $1, description = $2, base_price = $3, category_id = $4 ${imageQueryPart}
       WHERE id = $5`,
      queryParams
    );

    await client.query('DELETE FROM product_variants WHERE product_id = $1', [id]);

    const parsedVariants = JSON.parse(variants);
    for (const variant of parsedVariants) {
      await client.query(
        `INSERT INTO product_variants (product_id, sku, price_adjustment, stock_quantity, attributes) 
         VALUES ($1, $2, $3, $4, $5)`,
        [id, variant.sku, variant.price_adjustment || 0, variant.stock_quantity, variant.attributes]
      );
    }

    await client.query('COMMIT');
    res.json({ message: "Produit mis à jour avec succès" });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Erreur Update Produit:", err);
    res.status(500).json({ error: "Erreur lors de la modification" });
  } finally {
    client.release();
  }
};

// ... (Le reste : getHomeData, addProductReview, getProductReviews reste identique) ...
exports.getHomeData = async (req, res) => {
    try {
      // 1. NOUVEAUTÉS (Les derniers ajoutés)
      const newProducts = await db.query(`
        SELECT p.*, s.name as store_name, s.logo_url,
        COALESCE(AVG(pr.rating), 0) as average_rating,
        COUNT(pr.id) as review_count,
        (SELECT json_agg(json_build_object('stock_quantity', pv.stock_quantity)) FROM product_variants pv WHERE pv.product_id = p.id) as variants
        FROM products p 
        JOIN stores s ON p.store_id = s.id 
        LEFT JOIN product_reviews pr ON p.id = pr.product_id
        WHERE p.is_active = TRUE 
        GROUP BY p.id, s.id
        ORDER BY p.created_at DESC LIMIT 8
      `);
  
      // 2. CRÈME DE LA CRÈME (Best Sellers + Mieux Notés)
      // Logique : On prend ceux qui ont des ventes ET une bonne note, triés par volume de vente
      const trendingProducts = await db.query(`
        SELECT p.*, s.name as store_name, s.logo_url,
        COALESCE(AVG(pr.rating), 0) as average_rating,
        COUNT(DISTINCT pr.id) as review_count,
        COUNT(DISTINCT oi.id) as sales_volume, -- On compte les ventes réelles
        (SELECT json_agg(json_build_object('stock_quantity', pv.stock_quantity)) FROM product_variants pv WHERE pv.product_id = p.id) as variants
        FROM products p
        JOIN stores s ON p.store_id = s.id
        JOIN product_variants pv ON p.id = pv.product_id
        JOIN order_items oi ON pv.id = oi.product_variant_id -- Liaison Ventes
        LEFT JOIN product_reviews pr ON p.id = pr.product_id
        WHERE p.is_active = TRUE
        GROUP BY p.id, s.id
        HAVING AVG(pr.rating) >= 4 OR COUNT(oi.id) > 0 -- Filtre : Bonne note OU au moins vendu
        ORDER BY sales_volume DESC, average_rating DESC -- Le TOP du TOP
        LIMIT 10
      `);
  
      // 3. TOP BOUTIQUES (Par chiffre d'affaires)
      const topStores = await db.query(`
        SELECT s.id, s.name, s.logo_url, s.description,
        (SELECT COUNT(*) FROM sub_orders WHERE store_id = s.id) as sales_count,
        (SELECT SUM(payout_amount) FROM sub_orders WHERE store_id = s.id) as revenue
        FROM stores s
        ORDER BY revenue DESC LIMIT 4
      `);
  
      res.json({
        newArrivals: newProducts.rows,
        trending: trendingProducts.rows,
        topStores: topStores.rows
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Erreur Serveur');
    }
  };

  exports.addProductReview = async (req, res) => {
    const client = await db.pool.connect();
    try {
      const { id } = req.params; 
      const { rating, comment } = req.body;
      const user_id = req.user.id;
  
      // VÉRIFICATION D'ACHAT
      const purchaseCheck = await client.query(`
        SELECT 1 
        FROM order_items oi
        JOIN product_variants pv ON oi.product_variant_id = pv.id  -- << CORRECTION ICI
        JOIN sub_orders so ON oi.sub_order_id = so.id
        JOIN orders o ON so.parent_order_id = o.id
        WHERE pv.product_id = $1   
        AND o.user_id = $2 
        AND o.payment_status = 'paid'
        LIMIT 1
      `, [id, user_id]);
  
      if (purchaseCheck.rows.length === 0) {
        return res.status(403).json({ error: "Vous devez avoir acheté ce produit pour le noter." });
      }
  
      // INSERTION
      await client.query(
        `INSERT INTO product_reviews (product_id, user_id, rating, comment) VALUES ($1, $2, $3, $4)`,
        [id, user_id, rating, comment]
      );
  
      res.json({ message: "Votre avis a été publié !" });
  
    } catch (err) {
      if (err.code === '23505') return res.status(400).json({ error: "Vous avez déjà noté ce produit." });
      console.error(err);
      res.status(500).send('Erreur Serveur');
    } finally {
      client.release();
    }
  };
  // --- RÉCUPÉRER LES AVIS D'UN PRODUIT ---
  exports.getProductReviews = async (req, res) => {
    try {
      const { id } = req.params;
      const result = await db.query(`
        SELECT pr.*, u.first_name, u.last_name 
        FROM product_reviews pr
        JOIN users u ON pr.user_id = u.id
        WHERE pr.product_id = $1
        ORDER BY pr.created_at DESC
      `, [id]);
      
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).send('Erreur');
    }
  };