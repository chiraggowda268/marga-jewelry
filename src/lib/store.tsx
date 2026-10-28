import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { idbGet, idbSet } from "./idb";
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
  coupons: Coupon[];
  addCoupon: (coupon: Coupon) => { success: boolean; message: string };
  deleteCoupon: (code: string) => { success: boolean; message: string };
  resetCoupons: () => void;
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
  COUPONS_LIST: "marga_coupons_list_v1",
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
  const [coupons, setCoupons] = useState<Coupon[]>(availableCoupons);
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

  // Load state from IndexedDB (for unlimited product/image storage) and localStorage on mount
  useEffect(() => {
    let isMounted = true;

    async function initializeStore() {
      // 1. Instant optimistic load from localStorage if available
      try {
        const savedProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
        if (savedProducts) {
          const parsed = JSON.parse(savedProducts);
          if (Array.isArray(parsed) && parsed.length > 0 && isMounted) {
            setProducts(parsed);
          }
        }
      } catch {}

      // 2. Authoritative load from IndexedDB (modern, multi-gigabyte quota, handles 100+ multi-image products)
      try {
        const idbProducts = await idbGet<Product[]>(STORAGE_KEYS.PRODUCTS);
        if (idbProducts && Array.isArray(idbProducts) && idbProducts.length > 0) {
          if (isMounted) setProducts(idbProducts);
        } else {
          // If IndexedDB is empty yet, check localStorage to migrate existing catalog
          const localSaved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
          if (localSaved) {
            try {
              const parsed = JSON.parse(localSaved);
              if (Array.isArray(parsed) && parsed.length > 0) {
                await idbSet(STORAGE_KEYS.PRODUCTS, parsed);
                if (isMounted) setProducts(parsed);
              }
            } catch {}
          } else {
            // First time load: seed IndexedDB with default products
            await idbSet(STORAGE_KEYS.PRODUCTS, defaultProducts);
          }
        }
      } catch (err) {
        console.warn("[Store] IndexedDB load error for products:", err);
      }

      // 3. Load remaining state (user, cart, wishlist, orders, inquiries, coupons)
      try {
        const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
        if (savedUser && isMounted) setCurrentUser(JSON.parse(savedUser));

        const savedAdminPw = localStorage.getItem(STORAGE_KEYS.ADMIN_PASSWORDS);
        if (savedAdminPw && isMounted) setAdminPasswords(JSON.parse(savedAdminPw));

        const savedCustPw = localStorage.getItem(STORAGE_KEYS.CUSTOMER_PASSWORDS);
        if (savedCustPw && isMounted) setCustomerPasswords(JSON.parse(savedCustPw));

        const savedUsersList = localStorage.getItem(STORAGE_KEYS.USERS_LIST);
        if (savedUsersList && isMounted) {
          const parsed: User[] = JSON.parse(savedUsersList);
          // Ensure Chirag & Greeshma exist in the user list
          const cleaned = parsed.filter((u) => u.id !== "usr_admin");
          const hasChirag = cleaned.some((u) => u.username === "chirag" || u.id === "usr_admin_chirag");
          const hasGreeshma = cleaned.some((u) => u.username === "greeshma" || u.id === "usr_admin_greeshma");
          const updated = [...cleaned];
          if (!hasChirag && defaultUsers[0]) updated.unshift(defaultUsers[0]);
          if (!hasGreeshma && defaultUsers[1]) updated.splice(1, 0, defaultUsers[1]);
          setUsersList(updated);
        } else if (isMounted) {
          setUsersList(defaultUsers);
        }

        const savedCart = localStorage.getItem(STORAGE_KEYS.CART);
        if (savedCart && isMounted) setCart(JSON.parse(savedCart));

        const savedWishlist = localStorage.getItem(STORAGE_KEYS.WISHLIST);
        if (savedWishlist && isMounted) setWishlist(JSON.parse(savedWishlist));

        // Clean up legacy mock/test sales data from demo versions
        try {
          localStorage.removeItem("marga_orders_v1");
          localStorage.removeItem("marga_inquiries_v1");
        } catch {}

        // Load orders: Check IndexedDB then localStorage
        let loadedOrders: Order[] | null = null;
        try {
          const idbOrders = await idbGet<Order[]>(STORAGE_KEYS.ORDERS);
          if (idbOrders && Array.isArray(idbOrders)) {
            loadedOrders = idbOrders;
          }
        } catch {}

        if (!loadedOrders) {
          const savedOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);
          if (savedOrders) {
            try {
              loadedOrders = JSON.parse(savedOrders);
            } catch {}
          }
        }
        if (isMounted) {
          setOrders(loadedOrders ?? []);
        }

        // Load inquiries: Check IndexedDB then localStorage
        let loadedInquiries: Inquiry[] | null = null;
        try {
          const idbInq = await idbGet<Inquiry[]>(STORAGE_KEYS.INQUIRIES);
          if (idbInq && Array.isArray(idbInq)) {
            loadedInquiries = idbInq;
          }
        } catch {}

        if (!loadedInquiries) {
          const savedInquiries = localStorage.getItem(STORAGE_KEYS.INQUIRIES);
          if (savedInquiries) {
            try {
              loadedInquiries = JSON.parse(savedInquiries);
            } catch {}
          }
        }
        if (isMounted) {
          setInquiries(loadedInquiries ?? []);
        }

        const savedCoupon = localStorage.getItem(STORAGE_KEYS.COUPON);
        if (savedCoupon && isMounted) setAppliedCoupon(JSON.parse(savedCoupon));

        const savedCoupons = localStorage.getItem(STORAGE_KEYS.COUPONS_LIST);
        if (savedCoupons && isMounted) setCoupons(JSON.parse(savedCoupons));
      } catch (e) {
        console.warn("Could not load stored data from localStorage:", e);
      }

      if (isMounted) {
        setHydrated(true);
      }
    }

    initializeStore();

    return () => {
      isMounted = false;
    };
  }, []);

  // Sync products state to IndexedDB (authoritative) and localStorage (fallback)
  useEffect(() => {
    if (!hydrated) return;

    // 1. Always write to IndexedDB (guaranteed persistence, no 5MB quota limit)
    idbSet(STORAGE_KEYS.PRODUCTS, products).catch((err) => {
      console.warn("Could not save products to IndexedDB:", err);
    });

    // 2. Best-effort sync to localStorage
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch (err) {
      // If localStorage 5MB quota is exceeded, clean up the bloated key so other keys (cart, auth) keep working
      console.warn(
        "localStorage quota reached for products. Product catalog is safely persisted in IndexedDB."
      );
      try {
        localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
      } catch {}
    }
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
    idbSet(STORAGE_KEYS.ORDERS, orders).catch(() => {});
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch {}
  }, [orders, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    idbSet(STORAGE_KEYS.INQUIRIES, inquiries).catch(() => {});
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

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.COUPONS_LIST, JSON.stringify(coupons));
    } catch {}
  }, [coupons, hydrated]);

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

  // Coupons Management
  const addCoupon = (newCoupon: Coupon) => {
    const formattedCode = newCoupon.code.trim().toUpperCase();
    if (!formattedCode) {
      return { success: false, message: "Coupon code is required." };
    }
    if (coupons.some((c) => c.code.toUpperCase() === formattedCode)) {
      return { success: false, message: `Promo code ${formattedCode} already exists.` };
    }
    if (newCoupon.value <= 0) {
      return { success: false, message: "Discount value must be greater than zero." };
    }
    const cleanCoupon: Coupon = {
      code: formattedCode,
      type: newCoupon.type,
      value: Number(newCoupon.value),
      minSpend: newCoupon.minSpend ? Number(newCoupon.minSpend) : undefined,
      description: newCoupon.description.trim() || `${newCoupon.type === "percent" ? `${newCoupon.value}% off` : `Flat ₹${newCoupon.value} off`}`,
    };
    setCoupons((prev) => [cleanCoupon, ...prev]);
    return { success: true, message: `Promo code ${formattedCode} created successfully!` };
  };

  const deleteCoupon = (code: string) => {
    const formatted = code.trim().toUpperCase();
    setCoupons((prev) => prev.filter((c) => c.code.toUpperCase() !== formatted));
    if (appliedCoupon?.code.toUpperCase() === formatted) {
      setAppliedCoupon(null);
    }
    return { success: true, message: `Promo code ${formatted} deleted.` };
  };

  const resetCoupons = () => {
    setCoupons(availableCoupons);
  };

  const applyCoupon = (code: string) => {
    const found = coupons.find(
      (c) => c.code.toUpperCase() === code.trim().toUpperCase()
    );
    if (!found) {
      return { success: false, message: "Invalid promo code." };
    }
    if (found.minSpend && cartSubtotal < found.minSpend) {
      return {
        success: false,
        message: `Promo code requires minimum order of ₹${found.minSpend.toLocaleString("en-IN")}.`,
      };
    }
    setAppliedCoupon(found);
    return { success: true, message: `Promo code ${found.code} applied successfully!` };
  };

  const removeCoupon = () => setAppliedCoupon(null);

  // Product CRUD (Admin)
  const addProduct = (p: Omit<Product, "id" | "createdAt">): Product => {
    const newProduct: Product = {
      ...p,
      id: `p_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setProducts((prev) => {
      const next = [newProduct, ...prev];
      idbSet(STORAGE_KEYS.PRODUCTS, next).catch(() => {});
      return next;
    });
    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, ...updates } : p));
      idbSet(STORAGE_KEYS.PRODUCTS, next).catch(() => {});
      return next;
    });
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => {
      const next = prev.filter((p) => p.id !== id);
      idbSet(STORAGE_KEYS.PRODUCTS, next).catch(() => {});
      return next;
    });
    removeFromCart(id);
    setWishlist((prev) => prev.filter((x) => x !== id));
  };

  const resetCatalog = () => {
    setProducts(defaultProducts);
    idbSet(STORAGE_KEYS.PRODUCTS, defaultProducts).catch(() => {});
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(defaultProducts));
    } catch {}
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
        coupons,
        addCoupon,
        deleteCoupon,
        resetCoupons,
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
