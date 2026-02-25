import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
  color?: string;
}

interface CartState {
  items: CartItem[];
  itemCount: number;
  total: number;
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (productId: string, size?: string, color?: string) => boolean;
}

// Helper to calculate derived values
const calculateTotals = (items: CartItem[]) => ({
  itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
  total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
});

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      itemCount: 0,
      total: 0,

      addToCart: (newItem) => {
        set((state) => {
          // Check if item with same productId, size, and color exists
          const existingIndex = state.items.findIndex(
            (item) =>
              item.productId === newItem.productId &&
              item.size === newItem.size &&
              item.color === newItem.color
          );

          let updatedItems: CartItem[];

          if (existingIndex >= 0) {
            // Update quantity of existing item
            updatedItems = [...state.items];
            updatedItems[existingIndex] = {
              ...updatedItems[existingIndex],
              quantity: updatedItems[existingIndex].quantity + newItem.quantity,
            };
          } else {
            // Add new item with unique ID
            const id = `${newItem.productId}-${newItem.size || 'none'}-${newItem.color || 'none'}-${Date.now()}`;
            updatedItems = [...state.items, { ...newItem, id }];
          }

          return {
            items: updatedItems,
            ...calculateTotals(updatedItems),
          };
        });
      },

      removeFromCart: (itemId) => {
        set((state) => {
          const updatedItems = state.items.filter((item) => item.id !== itemId);
          return {
            items: updatedItems,
            ...calculateTotals(updatedItems),
          };
        });
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity < 1) {
          get().removeFromCart(itemId);
          return;
        }

        set((state) => {
          const updatedItems = state.items.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          );
          return {
            items: updatedItems,
            ...calculateTotals(updatedItems),
          };
        });
      },

      clearCart: () => {
        set({ items: [], itemCount: 0, total: 0 });
      },

      isInCart: (productId, size, color) => {
        return get().items.some(
          (item) =>
            item.productId === productId &&
            item.size === size &&
            item.color === color
        );
      },
    }),
    {
      name: 'divadons-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }), // Only persist items
      onRehydrateStorage: () => (state) => {
        // Recalculate totals after rehydration
        if (state) {
          const totals = calculateTotals(state.items);
          state.itemCount = totals.itemCount;
          state.total = totals.total;
        }
      },
    }
  )
);

// For backwards compatibility / simpler hook name
export const useCart = useCartStore;
