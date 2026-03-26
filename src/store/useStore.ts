import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from '@/lib/types';

interface AuthState {
  user: { name: string; email: string } | null;
  login: (email: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: (email) => set({ user: { name: email.split('@')[0], email } }),
      logout: () => set({ user: null }),
    }),
    { name: 'ceyraa-auth' }
  )
);

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, color: string, size: string) => void;
  updateQuantity: (productId: string, color: string, size: string, delta: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (newItem) => set((state) => {
        const existing = state.items.find(
          (i) => i.productId === newItem.productId && i.color === newItem.color && i.size === newItem.size
        );
        if (existing) {
          return {
            items: state.items.map((i) =>
              i === existing ? { ...i, quantity: i.quantity + newItem.quantity } : i
            ),
          };
        }
        return { items: [...state.items, newItem] };
      }),
      removeItem: (productId, color, size) => set((state) => ({
        items: state.items.filter(
          (i) => !(i.productId === productId && i.color === color && i.size === size)
        ),
      })),
      updateQuantity: (productId, color, size, delta) => set((state) => ({
        items: state.items.map((i) =>
          (i.productId === productId && i.color === color && i.size === size)
            ? { ...i, quantity: Math.max(1, i.quantity + delta) }
            : i
        ),
      })),
      clearCart: () => set({ items: [] }),
    }),
    { name: 'ceyraa-cart' }
  )
);

interface UIState {
  isAuthModalOpen: boolean;
  setAuthModal: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isAuthModalOpen: false,
  setAuthModal: (open) => set({ isAuthModalOpen: open }),
}));
