import { create } from 'zustand';

export interface CartItem { id: number; name: string; price: number; quantity: number; stock: number; notes: string; }
interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity' | 'notes'>) => void;
  updateQuantity: (id: number, quantity: number) => void;
  updateNotes: (id: number, notes: string) => void;
  removeItem: (id: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addItem: (newItem) => set((state) => {
    const existing = state.items.find(i => i.id === newItem.id);
    if (existing) {
      if (existing.quantity >= newItem.stock) return state;
      return { items: state.items.map(i => i.id === newItem.id ? { ...i, quantity: i.quantity + 1 } : i) };
    }
    return { items: [...state.items, { ...newItem, quantity: 1, notes: '' }] };
  }),
  updateQuantity: (id, quantity) => set((state) => ({
    items: quantity === 0 
      ? state.items.filter(i => i.id !== id)
      : state.items.map(i => i.id === id ? { ...i, quantity: Math.min(quantity, i.stock) } : i)
  })),
  updateNotes: (id, notes) => set((state) => ({ items: state.items.map(i => i.id === id ? { ...i, notes } : i) })),
  removeItem: (id) => set((state) => ({ items: state.items.filter(i => i.id !== id) })),
  clearCart: () => set({ items: [] }),
  getTotal: () => get().items.reduce((total, item) => total + (item.price * item.quantity), 0),
  getTotalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),
}));
