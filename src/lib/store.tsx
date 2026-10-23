import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import {
  defaultProducts,
  defaultUsers,
  defaultOrders,
  defaultInquiries,
  availableCoupons,
  type Product,
  type User,
  type Order,
  type Inquiry,
  type Coupon,
} from "./db";

type Store = {
  // Products
  products: Product[];
  addProduct: (product: Omit<Product, "id" | "createdAt">) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  resetCatalog: () => void;

  // Auth & User
  currentUser: User | null;
  login: (identifier: string, password?: string) => { success: boolean; error?: string };
  register: (name: string, email: string, password?: string, phone?: string) => { success: boolean; error?: string };
  logout: () => void;
  loginDemo: (role: "admin_chirag" | "admin_greeshma" | "admin" | "customer") => void;
  updateProfile: (updates: Partial<User>) => void;
  changeAdminPassword: (username: "chirag" | "greeshma", newPassword: string) => { success: boolean; message: string };

  // Cart & Wishlist
  cart: Record<string, number>;
  addToCart: (id: string, qty?: number) => void;
  updateCartQty: (id: string, qty: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  cartOpen: boolean;
  setCartOpen: (v: boolean) => void;
  wishlist: string[];
  toggleWish: (id: string) => void;
  isWished: (id: string) => boolean;

  // Coupons & Pricing
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  cartSubtotal: number;
  cartDiscount: number;
  cartShipping: number;
  cartTotal: number;

  // Orders
  orders: Order[];
  createOrder: (order: Omit<Order, "id" | "createdAt">) => Order;
  updateOrderStatus: (orderId: string, status: Order["orderStatus"]) => void;
  resetOrders: () => void;

  // Inquiries
  inquiries: Inquiry[];
  submitInquiry: (inquiry: Omit<Inquiry, "id" | "createdAt" | "status">) => Inquiry;
  updateInquiryStatus: (id: string, status: "new" | "replied") => void;

  // Quick View Modal
  quickViewProduct: Product | null;
  setQuickViewProduct: (product: Product | null) => void;
};

const Ctx = createContext<Store | null>(null);

const STORAGE_KEYS = {
  PRODUCTS: "marga_products_v1",
  USER: "marga_current_user_v1",
  USERS_LIST: "marga_users_list_v2",
  CART: "marga_cart_v1",
  WISHLIST: "marga_wishlist_v1",
  ORDERS: "marga_orders_prod_v1",
  INQUIRIES: "marga_inquiries_prod_v1",
  COUPON: "marga_coupon_v1",
  ADMIN_PASSWORDS: "marga_admin_passwords_v1",
  CUSTOMER_PASSWORDS: "marga_customer_passwords_v1",
};

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(defaultProducts);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [usersList, setUsersList] = useState<User[]>(defaultUsers);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>(defaultOrders);
  const [inquiries, setInquiries] = useState<Inquiry[]>(defaultInquiries);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [adminPasswords, setAdminPasswords] = useState<Record<string, string>>({});
  const [customerPasswords, setCustomerPasswords] = useState<Record<string, string>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Helper to retrieve admin credentials from env (without hardcoding)
  const getAdminConfig = (username: "chirag" | "greeshma") => {
    const env = import.meta.env as Record<string, string | undefined>;
    if (username === "chirag") {
      return {
        username: (env["VITE_ADMIN_CHIRAG_USERNAME"] || "chirag").toLowerCase(),
        name: env["VITE_ADMIN_CHIRAG_NAME"] || "Chirag",
        email: (env["VITE_ADMIN_CHIRAG_EMAIL"] || "chirag@margajewelry.com").toLowerCase(),
        password: adminPasswords["chirag"] || env["VITE_ADMIN_CHIRAG_PASSWORD"] || "",
      };
    } else {
      return {
        username: (env["VITE_ADMIN_GREESHMA_USERNAME"] || "greeshma").toLowerCase(),
        name: env["VITE_ADMIN_GREESHMA_NAME"] || "Greeshma",
        email: (env["VITE_ADMIN_GREESHMA_EMAIL"] || "greeshma@margajewelry.com").toLowerCase(),
        password: adminPasswords["greeshma"] || env["VITE_ADMIN_GREESHMA_PASSWORD"] || "",
      };
    }
  };

  // Load state from localStorage on mount (Client-side only)
  useEffect(() => {
    try {
      const savedProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (savedProducts) setProducts(JSON.parse(savedProducts));

      const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
      if (savedUser) setCurrentUser(JSON.parse(savedUser));

      const savedAdminPw = localStorage.getItem(STORAGE_KEYS.ADMIN_PASSWORDS);
      if (savedAdminPw) setAdminPasswords(JSON.parse(savedAdminPw));

      const savedCustPw = localStorage.getItem(STORAGE_KEYS.CUSTOMER_PASSWORDS);
      if (savedCustPw) setCustomerPasswords(JSON.parse(savedCustPw));

      const savedUsersList = localStorage.getItem(STORAGE_KEYS.USERS_LIST);
      if (savedUsersList) {
        const parsed: User[] = JSON.parse(savedUsersList);
        // Ensure Chirag & Greeshma exist in the user list
        const cleaned = parsed.filter((u) => u.id !== "usr_admin");
        const hasChirag = cleaned.some((u) => u.username === "chirag" || u.id === "usr_admin_chirag");
        const hasGreeshma = cleaned.some((u) => u.username === "greeshma" || u.id === "usr_admin_greeshma");
        const updated = [...cleaned];
        if (!hasChirag && defaultUsers[0]) updated.unshift(defaultUsers[0]);
        if (!hasGreeshma && defaultUsers[1]) updated.splice(1, 0, defaultUsers[1]);
        setUsersList(updated);
      } else {
        setUsersList(defaultUsers);
      }

      const savedCart = localStorage.getItem(STORAGE_KEYS.CART);
      if (savedCart) setCart(JSON.parse(savedCart));

      const savedWishlist = localStorage.getItem(STORAGE_KEYS.WISHLIST);
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist));

      // Clean up legacy mock/test sales data from demo versions
      try {
        localStorage.removeItem("marga_orders_v1");
        localStorage.removeItem("marga_inquiries_v1");
      } catch {}

      const savedOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (savedOrders) {
        setOrders(JSON.parse(savedOrders));
      } else {
        setOrders([]);
      }

      const savedInquiries = localStorage.getItem(STORAGE_KEYS.INQUIRIES);
      if (savedInquiries) {
        setInquiries(JSON.parse(savedInquiries));
      } else {
        setInquiries([]);
      }

      const savedCoupon = localStorage.getItem(STORAGE_KEYS.COUPON);
      if (savedCoupon) setAppliedCoupon(JSON.parse(savedCoupon));
    } catch (e) {
      console.warn("Could not load stored data from localStorage:", e);
    }
    setHydrated(true);
  }, []);

  // Sync state to localStorage when changes occur
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch {}
  }, [products, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEYS.USER);
      }
    } catch {}
  }, [currentUser, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.USERS_LIST, JSON.stringify(usersList));
    } catch {}
  }, [usersList, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.ADMIN_PASSWORDS, JSON.stringify(adminPasswords));
    } catch {}
  }, [adminPasswords, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOMER_PASSWORDS, JSON.stringify(customerPasswords));
    } catch {}
  }, [customerPasswords, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    } catch {}
  }, [cart, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(wishlist));
    } catch {}
  }, [wishlist, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch {}
  }, [orders, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(inquiries));
    } catch {}
  }, [inquiries, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      if (appliedCoupon) {
        localStorage.setItem(STORAGE_KEYS.COUPON, JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem(STORAGE_KEYS.COUPON);
      }
    } catch {}
  }, [appliedCoupon, hydrated]);

  // Pricing calculations
  const cartSubtotal = Object.entries(cart).reduce((sum, [id, qty]) => {
    const p = products.find((x) => x.id === id);
    return p ? sum + p.price * qty : sum;
  }, 0);

  let cartDiscount = 0;
  if (appliedCoupon && cartSubtotal > 0) {
    if (!appliedCoupon.minSpend || cartSubtotal >= appliedCoupon.minSpend) {
      if (appliedCoupon.type === "percent") {
        cartDiscount = Math.round((cartSubtotal * appliedCoupon.value) / 100);
      } else {
        cartDiscount = Math.min(cartSubtotal, appliedCoupon.value);
      }
    }
  }

  // Free shipping on orders >= ₹2,499
  const cartShipping = cartSubtotal === 0 ? 0 : cartSubtotal >= 2499 ? 0 : 99;
  const cartTotal = Math.max(0, cartSubtotal - cartDiscount + cartShipping);

  // Cart operations
  const addToCart = (id: string, qty = 1) => {
    setCart((prev) => ({
      ...prev,
      [id]: (prev[id] ?? 0) + qty,
    }));
    setCartOpen(true);
  };

  const updateCartQty = (id: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(id);
    } else {
      setCart((prev) => ({ ...prev, [id]: qty }));
    }
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const clearCart = () => setCart({});

  // Wishlist
  const toggleWish = (id: string) => {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const isWished = (id: string) => wishlist.includes(id);

  // Auth functions with non-hardcoded password verification
  const login = (identifier: string, password?: string) => {
    const trimmed = identifier.trim().toLowerCase();
    const chiragConfig = getAdminConfig("chirag");
    const greeshmaConfig = getAdminConfig("greeshma");

    const isChirag =
      trimmed === chiragConfig.username ||
      trimmed === chiragConfig.email ||
      trimmed === "chirag";

    const isGreeshma =
      trimmed === greeshmaConfig.username ||
      trimmed === greeshmaConfig.email ||
      trimmed === "greeshma";

    // Admin: Chirag
    if (isChirag) {
      if (!password) {
        return { success: false, error: "Password is required for admin login." };
      }
      if (password !== chiragConfig.password) {
        return {
          success: false,
          error: "Incorrect password for Chirag. (Configured via VITE_ADMIN_CHIRAG_PASSWORD in .env)",
        };
      }
      const adminUser = usersList.find((u) => u.username === "chirag") ?? defaultUsers[0] ?? null;
      setCurrentUser(adminUser);
      return { success: true };
    }

    // Admin: Greeshma
    if (isGreeshma) {
      if (!password) {
        return { success: false, error: "Password is required for admin login." };
      }
      if (password !== greeshmaConfig.password) {
        return {
          success: false,
          error: "Incorrect password for Greeshma. (Configured via VITE_ADMIN_GREESHMA_PASSWORD in .env)",
        };
      }
      const adminUser = usersList.find((u) => u.username === "greeshma") ?? defaultUsers[1] ?? null;
      setCurrentUser(adminUser);
      return { success: true };
    }

    // Customer login
    const found = usersList.find(
      (u) =>
        u.email.toLowerCase() === trimmed ||
        (u.username && u.username.toLowerCase() === trimmed)
    );

    if (found) {
      if (customerPasswords[found.id] && password && customerPasswords[found.id] !== password) {
        return { success: false, error: "Incorrect password." };
      }
      setCurrentUser(found);
      return { success: true };
    }

    // Auto-create customer if entered valid email
    if (trimmed.includes("@")) {
      const newUser: User = {
        id: `usr_${Date.now()}`,
        name: identifier.split("@")[0] || "Customer",
        email: trimmed,
        role: "customer",
        createdAt: new Date().toISOString(),
      };
      setUsersList((prev) => [...prev, newUser]);
      if (password) {
        setCustomerPasswords((prev) => ({ ...prev, [newUser.id]: password }));
      }
      setCurrentUser(newUser);
      return { success: true };
    }

    return { success: false, error: "Account not found. Please enter a valid username or email." };
  };

  const register = (
    name: string,
    email: string,
    password?: string,
    phone?: string
  ) => {
    const trimmed = email.trim().toLowerCase();
    if (usersList.some((u) => u.email.toLowerCase() === trimmed)) {
      return { success: false, error: "An account with this email already exists." };
    }
    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: name.trim(),
      email: trimmed,
      phone: phone?.trim(),
      role: "customer",
      createdAt: new Date().toISOString(),
    };
    setUsersList((prev) => [...prev, newUser]);
    if (password) {
      setCustomerPasswords((prev) => ({ ...prev, [newUser.id]: password }));
    }
    setCurrentUser(newUser);
    return { success: true };
  };

  const logout = () => setCurrentUser(null);

  const loginDemo = (role: "admin_chirag" | "admin_greeshma" | "admin" | "customer") => {
    if (role === "admin_chirag" || role === "admin") {
      const admin = usersList.find((u) => u.username === "chirag") ?? defaultUsers[0] ?? null;
      setCurrentUser(admin);
    } else if (role === "admin_greeshma") {
      const admin = usersList.find((u) => u.username === "greeshma") ?? defaultUsers[1] ?? null;
      setCurrentUser(admin);
    } else {
      const customer = usersList.find((u) => u.role === "customer") ?? null;
      setCurrentUser(customer);
    }
  };

  const updateProfile = (updates: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updates };
    setCurrentUser(updated);
    setUsersList((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
  };

  const changeAdminPassword = (username: "chirag" | "greeshma", newPassword: string) => {
    if (!newPassword || newPassword.length < 6) {
      return { success: false, message: "Password must be at least 6 characters long." };
    }
    setAdminPasswords((prev) => ({
      ...prev,
      [username]: newPassword,
    }));
    return { success: true, message: `Password for ${username} updated successfully!` };
  };

  // Coupons
  const applyCoupon = (code: string) => {
    const found = availableCoupons.find(
      (c) => c.code.toUpperCase() === code.trim().toUpperCase()
    );
    if (!found) {
      return { success: false, message: "Invalid coupon code." };
    }
    if (found.minSpend && cartSubtotal < found.minSpend) {
      return {
        success: false,
        message: `Coupon requires minimum order of ₹${found.minSpend.toLocaleString("en-IN")}.`,
      };
    }
    setAppliedCoupon(found);
    return { success: true, message: `Coupon ${found.code} applied successfully!` };
  };

  const removeCoupon = () => setAppliedCoupon(null);

  // Product CRUD (Admin)
  const addProduct = (p: Omit<Product, "id" | "createdAt">): Product => {
    const newProduct: Product = {
      ...p,
      id: `p_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setProducts((prev) => [newProduct, ...prev]);
    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    removeFromCart(id);
    setWishlist((prev) => prev.filter((x) => x !== id));
  };

  const resetCatalog = () => {
    setProducts(defaultProducts);
  };

  // Orders
  const createOrder = (orderData: Omit<Order, "id" | "createdAt">): Order => {
    const newOrder: Order = {
      ...orderData,
      id: `MG-${Math.floor(10000 + Math.random() * 90000)}`,
      createdAt: new Date().toISOString(),
    };
    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    setAppliedCoupon(null);
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: Order["orderStatus"]) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, orderStatus: status } : o))
    );
  };

  const resetOrders = () => {
    setOrders([]);
    try {
      localStorage.removeItem(STORAGE_KEYS.ORDERS);
      localStorage.removeItem("marga_orders_v1");
    } catch {}
  };

  // Inquiries
  const submitInquiry = (
    inquiryData: Omit<Inquiry, "id" | "createdAt" | "status">
  ): Inquiry => {
    const newInquiry: Inquiry = {
      ...inquiryData,
      id: `inq_${Date.now()}`,
      status: "new",
      createdAt: new Date().toISOString(),
    };
    setInquiries((prev) => [newInquiry, ...prev]);
    return newInquiry;
  };

  const updateInquiryStatus = (id: string, status: "new" | "replied") => {
    setInquiries((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status } : i))
    );
  };

  return (
    <Ctx.Provider
      value={{
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        resetCatalog,
        currentUser,
        login,
        register,
        logout,
        loginDemo,
        updateProfile,
        changeAdminPassword,
        cart,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        cartOpen,
        setCartOpen,
        wishlist,
        toggleWish,
        isWished,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        cartSubtotal,
        cartDiscount,
        cartShipping,
        cartTotal,
        orders,
        createOrder,
        updateOrderStatus,
        resetOrders,
        inquiries,
        submitInquiry,
        updateInquiryStatus,
        quickViewProduct,
        setQuickViewProduct,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore must be used inside StoreProvider");
  return s;
}
