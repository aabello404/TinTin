import React, { createContext, useContext, useState, useEffect } from "react";

type CartItem = {
  id: string;
  productId: string;
  name: string;
  price: number;
  size: number;
  quantity: number;
  image: string;
};

type WishlistItem = {
  productId: string;
  name: string;
  price: number;
  image: string;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  wishlist: WishlistItem[];
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (productId: string) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  // NEW: Add a flag to track if the initial load is complete
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("tintin_cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }

    const savedWishlist = localStorage.getItem("tintin_wishlist");
    if (savedWishlist) {
      try {
        setWishlist(JSON.parse(savedWishlist));
      } catch (e) {
        console.error("Failed to parse wishlist", e);
      }
    }

    // Mark as loaded after reading from local storage
    setIsLoaded(true);
  }, []);

  // Save to local storage whenever cart changes, BUT ONLY if loaded
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("tintin_cart", JSON.stringify(cart));
    }
  }, [cart, isLoaded]);

  // Save to local storage whenever wishlist changes, BUT ONLY if loaded
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("tintin_wishlist", JSON.stringify(wishlist));
    }
  }, [wishlist, isLoaded]);

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find(
        (i) => i.productId === item.productId && i.size === item.size,
      );
      if (existing) {
        return prev.map((i) =>
          i.id === existing.id
            ? { ...i, quantity: i.quantity + item.quantity }
            : i,
        );
      }
      return [
        ...prev,
        { ...item, id: Math.random().toString(36).substring(7) },
      ];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const addToWishlist = (item: WishlistItem) => {
    setWishlist((prev) => {
      if (prev.some((i) => i.productId === item.productId)) return prev;
      return [...prev, item];
    });
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist((prev) => prev.filter((item) => item.productId !== productId));
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        wishlist,
        addToWishlist,
        removeFromWishlist,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
