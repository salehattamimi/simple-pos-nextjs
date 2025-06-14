import { create } from "zustand";

type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
};

type addToCartItem = Omit<CartItem, "quantity">;
// ini artinya ngambil cart item terus di omit( jangan include) quantity

interface CartState {
  items: CartItem[];
  addToCart: (newItem: addToCartItem) => void;
  clearCart: () => void
}

export const useCartStore = create<CartState>()((set) => ({
  items: [],
  addToCart: (newItem) => {
    // 1. kalo item belum ada di cart, push item ke cart dfengan quantity 1
    // 2. kalo item udah ada dicart, modify quantity dengan tambah 1
    set((currentState) => {
      // State = imutable => gaboleh valuenya diubah secara langsung

      const duplicateItems = [...currentState.items]; // duplikat isi items ke array baru

      const existingItemIndex = duplicateItems.findIndex(
        (item) => item.productId === newItem.productId,
      );

      if (existingItemIndex === -1) {
        duplicateItems.push({
          productId: newItem.productId,
          name: newItem.name,
          imageUrl: newItem.imageUrl,
          price: newItem.price,
          quantity: 1,
        });
      } else {
        const itemToUpdate = duplicateItems[existingItemIndex];
        if (!itemToUpdate) {
          return { ...currentState };
        }

        itemToUpdate.quantity += 1;
      }

      return {
        ...currentState,
        items: duplicateItems,
      };
    });
  },
  clearCart: () => {
    set((currentState) => {
      return {
        ...currentState,
        items: [],
      }
    })
  }
}));
