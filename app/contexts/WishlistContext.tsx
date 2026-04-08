import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface WishlistItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  addedAt: number;
}

interface WishlistState {
  items: WishlistItem[];
  itemCount: number;
  addToWishlist: (item: Omit<WishlistItem, 'id' | 'addedAt'>) => void;
  removeFromWishlist: (productId: string) => void;
  clearWishlist: () => void;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (item: Omit<WishlistItem, 'id' | 'addedAt'>) => boolean; // returns true if added, false if removed
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      itemCount: 0,

      addToWishlist: (newItem) => {
        set((state) => {
          // Check if item already exists
          const exists = state.items.some((item) => item.productId === newItem.productId);
          if (exists) return state;

          const id = `wishlist-${newItem.productId}-${Date.now()}`;
          const updatedItems = [...state.items, { ...newItem, id, addedAt: Date.now() }];

          return {
            items: updatedItems,
            itemCount: updatedItems.length,
          };
        });
      },

      removeFromWishlist: (productId) => {
        set((state) => {
          const updatedItems = state.items.filter((item) => item.productId !== productId);
          return {
            items: updatedItems,
            itemCount: updatedItems.length,
          };
        });
      },

      clearWishlist: () => {
        set({ items: [], itemCount: 0 });
      },

      isInWishlist: (productId) => {
        return get().items.some((item) => item.productId === productId);
      },

      toggleWishlist: (newItem) => {
        const isInList = get().isInWishlist(newItem.productId);
        if (isInList) {
          get().removeFromWishlist(newItem.productId);
          return false;
        } else {
          get().addToWishlist(newItem);
          return true;
        }
      },
    }),
    {
      name: 'boutique-wishlist',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.itemCount = state.items.length;
        }
      },
    }
  )
);

// Simpler hook name
export const useWishlist = useWishlistStore;
