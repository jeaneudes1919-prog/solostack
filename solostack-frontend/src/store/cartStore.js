import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      // Ajouter au panier
      addToCart: (product, variant, quantity) => {
        const items = get().items;
        // On crée un ID unique pour l'article du panier (ProduitID + VarianteID)
        const cartItemId = `${product.id}-${variant?.id || 'base'}`;
        
        const existingItem = items.find(item => item.cartItemId === cartItemId);

        if (existingItem) {
          // Si existe déjà, on augmente la quantité
          set({
            items: items.map(item => 
              item.cartItemId === cartItemId 
                ? { ...item, quantity: item.quantity + quantity }
                : item
            )
          });
        } else {
          // Sinon on ajoute
          set({
            items: [...items, {
              cartItemId,
              product_id: product.id,
              variant_id: variant?.id, // ID important pour le backend
              title: product.title,
              price: parseFloat(product.base_price), // On simplifie (prix de base)
              image: product.images?.[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1999&auto=format&fit=crop",
              store_id: product.store_id, // Important pour le split order
              store_name: product.store_name,
              attributes: variant?.attributes, // {color: "Red", size: "L"}
              quantity
            }]
          });
        }
      },

      // Modifier quantité
      updateQuantity: (cartItemId, quantity) => {
        const items = get().items;
        if (quantity < 1) {
          // Supprimer si < 1
          set({ items: items.filter(i => i.cartItemId !== cartItemId) });
        } else {
          set({
            items: items.map(i => i.cartItemId === cartItemId ? { ...i, quantity } : i)
          });
        }
      },

      // Supprimer un article
      removeFromCart: (cartItemId) => {
        set({ items: get().items.filter(i => i.cartItemId !== cartItemId) });
      },

      // Vider le panier (après commande)
      clearCart: () => set({ items: [] }),

      // Calcul du total
      getTotal: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
      }
    }),
    {
      name: 'solostack-cart', // Nom dans le localStorage
    }
  )
);

export default useCartStore;