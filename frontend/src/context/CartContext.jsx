import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

const STORAGE_KEY = 'merc_cart';

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Сохраняем в localStorage при каждом изменении
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (product, size) => {
    setItems(prev => {
      const key = product._id + (size || '');
      const existing = prev.find(i => i._key === key);
      if (existing) return prev.map(i => i._key === key ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...product, quantity: 1, size: size || null, _key: key }];
    });
  };

  const removeItem = (key) => setItems(prev => prev.filter(i => i._key !== key));
  const updateQty = (key, qty) => {
    if (qty < 1) return removeItem(key);
    setItems(prev => prev.map(i => i._key === key ? { ...i, quantity: qty } : i));
  };
  const clearCart = () => setItems([]);

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const count = items.reduce((s, i) => s + i.quantity, 0);

  // Форматирование цены: $29.90
  const fmt = (n) => `$${Number(n).toFixed(2)}`;

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, total, count, fmt }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
