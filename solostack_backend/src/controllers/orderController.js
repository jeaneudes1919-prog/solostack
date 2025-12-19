const db = require('../config/db');

// --- PASSER COMMANDE (CHECKOUT) ---
exports.createOrder = async (req, res) => {
  const client = await db.pool.connect();
  
  try {
    await client.query('BEGIN'); // Début de la transaction critique

    const { items, shipping_address } = req.body; 
    // items attendu: [{ variant_id: 1, quantity: 2, store_id: 5, price: 20.00 }, ...]
    const user_id = req.user.id;

    // 1. Calcul du Total Global
    const total_amount = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    // 2. Création de la Commande Parent
    // Note: Dans un vrai cas Stripe, on mettrait ici le payment_intent_id
    const parentOrderRes = await client.query(
      `INSERT INTO orders (user_id, total_amount, payment_status, shipping_address) 
       VALUES ($1, $2, 'paid', $3) RETURNING id`,
      [user_id, total_amount, JSON.stringify(shipping_address)]
    );
    const parent_order_id = parentOrderRes.rows[0].id;

    // 3. Regrouper les items par Store (Logique de Split)
    // On transforme le tableau à plat en objet : { store_id_1: [items...], store_id_2: [items...] }
    const itemsByStore = items.reduce((acc, item) => {
      if (!acc[item.store_id]) acc[item.store_id] = [];
      acc[item.store_id].push(item);
      return acc;
    }, {});

    // 4. Boucle sur chaque Boutique pour créer les Sous-Commandes
    for (const [storeId, storeItems] of Object.entries(itemsByStore)) {
      
      // Calcul du sous-total pour cette boutique
      const subTotal = storeItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      const commission = subTotal * 0.10; // Exemple: La plateforme prend 10%
      const payout = subTotal - commission;

      // Création de la Sous-commande
      const subOrderRes = await client.query(
        `INSERT INTO sub_orders (parent_order_id, store_id, sub_total, commission_amount, payout_amount) 
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [parent_order_id, storeId, subTotal, commission, payout]
      );
      const sub_order_id = subOrderRes.rows[0].id;

      // 5. Insérer les articles et Décrémenter le Stock
      for (const item of storeItems) {
        // Insertion ligne commande
        await client.query(
          `INSERT INTO order_items (sub_order_id, product_variant_id, quantity, price_at_purchase) 
           VALUES ($1, $2, $3, $4)`,
          [sub_order_id, item.variant_id, item.quantity, item.price]
        );

        // Décrémentation Stock
        await client.query(
          `UPDATE product_variants SET stock_quantity = stock_quantity - $1 
           WHERE id = $2`,
          [item.quantity, item.variant_id]
        );
      }
    }

    await client.query('COMMIT'); // Tout est bon, on valide !
    
    res.status(201).json({ 
      message: "Commande effectuée avec succès !", 
      order_id: parent_order_id 
    });

  } catch (err) {
    await client.query('ROLLBACK'); // En cas d'erreur, on annule tout
    console.error(err);
    res.status(500).json({ error: "Erreur lors du traitement de la commande." });
  } finally {
    client.release();
  }
};

// --- HISTORIQUE ACHETEUR ---

exports.getMyOrders = async (req, res) => {
  try {
    const query = `
      SELECT o.id, o.total_amount, o.created_at, o.payment_status,
      (
        SELECT json_agg(json_build_object(
          'id', so.id,
          'store_name', s.name,
          'status', so.status,
          'items', (
            SELECT json_agg(json_build_object(
              'product_title', p.title,
              'product_id', p.id,            -- Vital pour le frontend
              'quantity', oi.quantity,
              'price', oi.price_at_purchase
            ))
            FROM order_items oi
            JOIN product_variants pv ON oi.product_variant_id = pv.id  -- << CORRECTION ICI
            JOIN products p ON pv.product_id = p.id
            WHERE oi.sub_order_id = so.id
          )
        ))
        FROM sub_orders so
        JOIN stores s ON so.store_id = s.id
        WHERE so.parent_order_id = o.id
      ) as sub_orders
      FROM orders o
      WHERE o.user_id = $1
      ORDER BY o.created_at DESC
    `;
    
    const orders = await db.query(query, [req.user.id]);
    res.json(orders.rows);

  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur Serveur');
  }
};
// --- GESTION VENDEUR (Commandes reçues) ---
exports.getVendorOrders = async (req, res) => {
  try {
    // 1. Trouver l'ID de la boutique du vendeur connecté
    const store = await db.query('SELECT id FROM stores WHERE owner_id = $1', [req.user.id]);
    if (store.rows.length === 0) return res.status(404).json({ error: "Pas de boutique" });
    
    const store_id = store.rows[0].id;

    // 2. Récupérer uniquement les sous-commandes qui concernent ce vendeur
    const query = `
      SELECT so.id, so.sub_total, so.status, so.created_at,
             u.first_name, u.last_name, u.email,
             (
               SELECT json_agg(json_build_object(
                 'product', p.title,
                 'sku', pv.sku,
                 'quantity', oi.quantity
               ))
               FROM order_items oi
               JOIN product_variants pv ON oi.product_variant_id = pv.id
               JOIN products p ON pv.product_id = p.id
               WHERE oi.sub_order_id = so.id
             ) as items
      FROM sub_orders so
      JOIN orders o ON so.parent_order_id = o.id
      JOIN users u ON o.user_id = u.id
      WHERE so.store_id = $1
      ORDER BY so.created_at DESC
    `;

    const orders = await db.query(query, [store_id]);
    res.json(orders.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur Serveur');
  }
};