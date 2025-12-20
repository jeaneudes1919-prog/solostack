import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'react-hot-toast';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      // --- AJOUTER AU PANIER AVEC VÉRIF STOCK ---
      addToCart: (product, variant, quantity) => {
        const items = get().items;
        const cartItemId = `${product.id}-${variant?.id || 'base'}`;
        
        // On récupère le stock disponible pour cette variante
        const availableStock = variant?.stock_quantity || 0;

        const existingItem = items.find(item => item.cartItemId === cartItemId);

        if (existingItem) {
          // Calcul de la nouvelle quantité totale (actuelle + nouvelle)
          const newTotalQuantity = existingItem.quantity + quantity;

          // ✅ BLOCAGE SI DÉPASSEMENT STOCK
          if (newTotalQuantity > availableStock) {
            toast.error(`Stock insuffisant. Limite atteinte (${availableStock} max)`);
            return;
          }

          set({
            items: items.map(item => 
              item.cartItemId === cartItemId 
                ? { ...item, quantity: newTotalQuantity }
                : item
            )
          });
        } else {
          // ✅ VÉRIF STOCK POUR NOUVEL ARTICLE
          if (quantity > availableStock) {
            toast.error(`Désolé, il ne reste que ${availableStock} articles.`);
            return;
          }

          set({
            items: [...items, {
              cartItemId,
              product_id: product.id,
              variant_id: variant?.id,
              title: product.title,
              price: parseFloat(product.base_price),
              // On utilise image_url qui est notre standard Cloudinary
              image_url: product.image_url || product.images?.[0], 
              store_id: product.store_id,
              store_name: product.store_name,
              attributes: variant?.attributes,
              stock_quantity: availableStock, // ✅ ON SAUVEGARDE LA LIMITE ICI
              quantity
            }]
          });
        }
      },

      // --- MODIFIER QUANTITÉ AVEC VÉRIF STOCK ---
      updateQuantity: (cartItemId, quantity) => {
        const items = get().items;
        const item = items.find(i => i.cartItemId === cartItemId);

        if (!item) return;

        if (quantity < 1) {
          set({ items: items.filter(i => i.cartItemId !== cartItemId) });
          return;
        }

        // ✅ VÉRIFICATION CONTRE LE STOCK ENREGISTRÉ
        if (quantity > item.stock_quantity) {
          toast.error(`Limite de stock atteinte (${item.stock_quantity})`);
          return;
        }

        set({
          items: items.map(i => i.cartItemId === cartItemId ? { ...i, quantity } : i)
        });
      },

      removeFromCart: (cartItemId) => {
        set({ items: get().items.filter(i => i.cartItemId !== cartItemId) });
      },

      clearCart: () => set({ items: [] }),

      getTotal: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
      }
    }),
    {
      name: 'solostack-cart', 
    }
  )
);

export default useCartStore;