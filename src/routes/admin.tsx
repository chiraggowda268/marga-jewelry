import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  MessageSquare,
  Settings,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  TrendingUp,
  DollarSign,
  Users,
  AlertCircle,
  Search,
  Filter,
  ArrowUpRight,
  ShieldAlert,
  ShieldCheck,
  ArrowLeft,
  X,
  Sparkles,
} from "lucide-react";
import { useStore } from "@/lib/store";
import {
  defaultCategories,
  formatINR,
  type Product,
  type Order,
  availableCoupons,
} from "@/lib/db";

// Built-in image assets for easy selection when creating products
import necklaceImg from "@/assets/necklace.jpg";
import earringsImg from "@/assets/earrings.jpg";
import braceletImg from "@/assets/bracelet.jpg";
import ringImg from "@/assets/ring.jpg";
import layeringImg from "@/assets/layering.jpg";
import everydayImg from "@/assets/everyday.jpg";
import editorialImg from "@/assets/editorial.jpg";
import heroImg from "@/assets/hero.jpg";
import promoImg from "@/assets/promo.jpg";

const PRESET_IMAGES = [
  { label: "Necklace", url: necklaceImg },
  { label: "Earrings", url: earringsImg },
  { label: "Bracelet", url: braceletImg },
  { label: "Ring", url: ringImg },
  { label: "Layering Set", url: layeringImg },
  { label: "Everyday Duo", url: everydayImg },
  { label: "Editorial", url: editorialImg },
  { label: "Hero Jewelry", url: heroImg },
  { label: "Linen Promo", url: promoImg },
];

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Portal — Marga Jewelry" },
      { name: "description", content: "Marga Jewelry store administration, products, orders and analytics." },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const {
    currentUser,
    login,
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    resetCatalog,
    orders,
    updateOrderStatus,
    resetOrders,
    inquiries,
    updateInquiryStatus,
    changeAdminPassword,
  } = useStore();

  const [activeTab, setActiveTab] = useState<"dashboard" | "products" | "orders" | "inquiries" | "settings">("dashboard");

  // Admin Auth inputs (for unauthenticated state)
  const [adminIdentifier, setAdminIdentifier] = useState("chirag");
  const [adminPassword, setAdminPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  // Settings tab: Change password state
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [passwordChangeStatus, setPasswordChangeStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  // Settings tab: Razorpay Gateway Configuration state
  const [razorpayKeyInput, setRazorpayKeyInput] = useState(() => {
    if (typeof window !== "undefined") {
      const envKey = (import.meta.env as Record<string, string | undefined>)["VITE_RAZORPAY_KEY_ID"];
      return localStorage.getItem("marga_razorpay_key_id") || envKey || "rzp_test_SPnZED73FNEVZM";
    }
    return "rzp_test_SPnZED73FNEVZM";
  });
  const [keySavedMessage, setKeySavedMessage] = useState(false);

  // Products Tab states
  const [productSearch, setProductSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Orders Tab states
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");
  const [orderSearch, setOrderSearch] = useState("");

  // Add/Edit Product Form state
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    category: "necklaces",
    price: 1999,
    originalPrice: 2499,
    stock: 20,
    badge: "" as "" | "Bestseller" | "New" | "Trending" | "Limited",
    image: necklaceImg,
    customImageUrl: "",
    description: "",
    material: "18K Gold Vermeil over 925 Sterling Silver",
  });

  // If user is not an admin, render the Admin Login Screen
  if (currentUser?.role !== "admin") {
    return (
      <section className="mx-auto max-w-md px-4 py-20 animate-in fade-in duration-200">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-lg text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-butter text-petrol mb-4">
            <ShieldAlert size={28} />
          </div>
          <h1 className="font-serif text-3xl text-petrol">Marga Admin Portal</h1>
          <p className="mt-2 text-xs text-muted-foreground">
            Administrative access for store owners <strong>Chirag</strong> and <strong>Greeshma</strong>. Passwords are securely loaded from your environment configuration (<code className="bg-muted px-1.5 py-0.5 rounded text-[11px]">.env</code>).
          </p>

          {/* Quick Admin Selector */}
          <div className="mt-6 rounded-xl border border-gold/40 bg-butter/30 p-4 text-left">
            <p className="text-xs font-semibold text-petrol mb-2 flex items-center gap-1.5">
              <span>👑</span> Select Admin Account:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setAdminIdentifier("chirag");
                  setAuthError(null);
                }}
                className={`rounded-lg p-2.5 text-xs text-left transition-colors border ${
                  adminIdentifier === "chirag"
                    ? "bg-petrol text-ivory border-petrol font-semibold"
                    : "bg-card text-charcoal border-border hover:border-gold"
                }`}
              >
                <p className="font-bold">Chirag</p>
                <p className={`text-[10px] ${adminIdentifier === "chirag" ? "text-ivory/80" : "text-muted-foreground"}`}>
                  @chirag
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAdminIdentifier("greeshma");
                  setAuthError(null);
                }}
                className={`rounded-lg p-2.5 text-xs text-left transition-colors border ${
                  adminIdentifier === "greeshma"
                    ? "bg-petrol text-ivory border-petrol font-semibold"
                    : "bg-card text-charcoal border-border hover:border-gold"
                }`}
              >
                <p className="font-bold">Greeshma</p>
                <p className={`text-[10px] ${adminIdentifier === "greeshma" ? "text-ivory/80" : "text-muted-foreground"}`}>
                  @greeshma
                </p>
              </button>
            </div>
          </div>

          {authError && (
            <div className="mt-4 rounded-lg bg-destructive/10 p-3 text-xs text-destructive text-left">
              {authError}
            </div>
          )}

          <form
            onSubmit={(e: FormEvent) => {
              e.preventDefault();
              setAuthError(null);
              if (!adminIdentifier.trim()) {
                setAuthError("Please specify username (chirag or greeshma)");
                return;
              }
              if (!adminPassword) {
                setAuthError("Please enter your admin password.");
                return;
              }
              const res = login(adminIdentifier.trim(), adminPassword);
              if (!res.success) setAuthError(res.error || "Authentication failed");
            }}
            className="mt-4 space-y-4 text-left"
          >
            <div>
              <label className="mb-1 block text-xs eyebrow text-muted-foreground">Username or Email *</label>
              <input
                type="text"
                required
                value={adminIdentifier}
                onChange={(e) => setAdminIdentifier(e.target.value)}
                placeholder="chirag or greeshma"
                className="h-11 w-full rounded-lg border border-input bg-ivory px-3 text-sm text-charcoal outline-none focus:border-gold"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs eyebrow text-muted-foreground">Admin Password *</label>
                <span className="text-[10px] text-muted-foreground">Defined in .env</span>
              </div>
              <input
                type="password"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Enter password..."
                className="h-11 w-full rounded-lg border border-input bg-ivory px-3 text-sm text-charcoal outline-none focus:border-gold"
              />
            </div>

            <button
              type="submit"
              className="h-11 w-full rounded-lg bg-petrol eyebrow text-xs text-ivory hover:bg-charcoal transition-colors shadow-xs"
            >
              Sign In as Admin
            </button>
          </form>

          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-petrol"
          >
            <ArrowLeft size={13} /> Back to Storefront
          </Link>
        </div>
      </section>
    );
  }

  // CALCULATE LIVE DASHBOARD METRICS
  const totalRevenue = orders.reduce((s, o) => s + (o.paymentStatus === "Paid" ? o.total : 0), 0);
  const pendingOrdersCount = orders.filter((o) => o.orderStatus === "Processing").length;
  const lowStockProducts = products.filter((p) => p.stock <= 15);
  const newInquiriesCount = inquiries.filter((i) => i.status === "new").length;

  // Handle Add Product Form submission
  const handleSaveProduct = (e: FormEvent) => {
    e.preventDefault();
    const finalImage = formData.customImageUrl.trim() || formData.image;

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: formData.name.trim(),
        category: formData.category,
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
        stock: Number(formData.stock),
        badge: formData.badge || undefined,
        image: finalImage,
        description: formData.description.trim(),
        material: formData.material.trim(),
      });
      setEditingProduct(null);
    } else {
      addProduct({
        name: formData.name.trim(),
        slug: formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        category: formData.category,
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
        stock: Number(formData.stock),
        badge: formData.badge || undefined,
        image: finalImage,
        description: formData.description.trim() || "Handcrafted everyday fine jewelry designed to layer and stack.",
        material: formData.material.trim() || "18K Gold Vermeil over 925 Sterling Silver",
        rating: 5.0,
        reviewsCount: 1,
        details: [
          formData.material.trim(),
          "Hypoallergenic & 100% Nickel-free",
          "Anti-tarnish protective coating",
        ],
      });
      setIsAddModalOpen(false);
    }

    // Reset form
    setFormData({
      name: "",
      slug: "",
      category: "necklaces",
      price: 1999,
      originalPrice: 2499,
      stock: 20,
      badge: "",
      image: necklaceImg,
      customImageUrl: "",
      description: "",
      material: "18K Gold Vermeil over 925 Sterling Silver",
    });
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      slug: p.slug,
      category: p.category,
      price: p.price,
      originalPrice: p.originalPrice ?? p.price,
      stock: p.stock,
      badge: p.badge ?? "",
      image: p.image,
      customImageUrl: p.image.startsWith("http") ? p.image : "",
      description: p.description,
      material: p.material,
    });
  };

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchCat = categoryFilter === "all" || p.category === categoryFilter;
    const matchSearch =
      !productSearch ||
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    const matchStatus = orderStatusFilter === "all" || o.orderStatus === orderStatusFilter;
    const matchSearch =
      !orderSearch ||
      o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(orderSearch.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="min-h-screen bg-ivory">
      {/* Top Admin Sub-bar */}
      <div className="border-b border-border bg-petrol text-ivory px-4 py-3 md:px-8">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="rounded-md bg-butter px-2.5 py-1 text-xs font-bold uppercase text-petrol">
              Admin Suite
            </span>
            <span className="font-serif text-lg tracking-wide">Marga Jewelry Control Center</span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-ivory/80">
              Logged in: <strong>{currentUser.name}</strong> ({currentUser.email})
            </span>
            <Link
              to="/"
              className="inline-flex items-center gap-1 rounded-lg border border-ivory/30 px-3 py-1.5 text-ivory hover:bg-ivory/10 transition-colors"
            >
              <ArrowLeft size={13} /> View Storefront
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b border-border pb-px overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 eyebrow text-xs transition-colors whitespace-nowrap ${
              activeTab === "dashboard"
                ? "border-petrol text-petrol font-semibold bg-card/60 rounded-t-lg"
                : "border-transparent text-muted-foreground hover:text-charcoal"
            }`}
          >
            <LayoutDashboard size={16} /> Overview
          </button>

          <button
            onClick={() => setActiveTab("products")}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 eyebrow text-xs transition-colors whitespace-nowrap ${
              activeTab === "products"
                ? "border-petrol text-petrol font-semibold bg-card/60 rounded-t-lg"
                : "border-transparent text-muted-foreground hover:text-charcoal"
            }`}
          >
            <ShoppingBag size={16} /> Products ({products.length})
          </button>

          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 eyebrow text-xs transition-colors whitespace-nowrap ${
              activeTab === "orders"
                ? "border-petrol text-petrol font-semibold bg-card/60 rounded-t-lg"
                : "border-transparent text-muted-foreground hover:text-charcoal"
            }`}
          >
            <Package size={16} /> Orders ({orders.length})
            {pendingOrdersCount > 0 && (
              <span className="rounded-full bg-butter px-1.5 py-0.2 text-[10px] font-bold text-petrol">
                {pendingOrdersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("inquiries")}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 eyebrow text-xs transition-colors whitespace-nowrap ${
              activeTab === "inquiries"
                ? "border-petrol text-petrol font-semibold bg-card/60 rounded-t-lg"
                : "border-transparent text-muted-foreground hover:text-charcoal"
            }`}
          >
            <MessageSquare size={16} /> Inquiries ({inquiries.length})
            {newInquiriesCount > 0 && (
              <span className="rounded-full bg-gold px-1.5 py-0.2 text-[10px] font-bold text-charcoal">
                {newInquiriesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 eyebrow text-xs transition-colors whitespace-nowrap ${
              activeTab === "settings"
                ? "border-petrol text-petrol font-semibold bg-card/60 rounded-t-lg"
                : "border-transparent text-muted-foreground hover:text-charcoal"
            }`}
          >
            <Settings size={16} /> Store Settings
          </button>
        </div>

        {/* ============================================================== */}
        {/* TAB 1: DASHBOARD OVERVIEW */}
        {/* ============================================================== */}
        {activeTab === "dashboard" && (
          <div className="mt-8 space-y-8 animate-in fade-in duration-150">
            {/* KPI Stat Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-2xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="eyebrow text-xs">Total Revenue</span>
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                    <DollarSign size={20} />
                  </div>
                </div>
                <p className="mt-4 font-serif text-3xl text-petrol font-semibold">{formatINR(totalRevenue)}</p>
                <p className="mt-1 text-xs text-emerald-700 flex items-center gap-1 font-medium">
                  <TrendingUp size={14} /> +18.4% from last month
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-6 shadow-2xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="eyebrow text-xs">Total Orders</span>
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-700">
                    <Package size={20} />
                  </div>
                </div>
                <p className="mt-4 font-serif text-3xl text-petrol font-semibold">{orders.length}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {pendingOrdersCount} orders currently processing
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-6 shadow-2xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="eyebrow text-xs">Catalog Items</span>
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-700">
                    <ShoppingBag size={20} />
                  </div>
                </div>
                <p className="mt-4 font-serif text-3xl text-petrol font-semibold">{products.length}</p>
                <p className="mt-1 text-xs text-amber-700">
                  {lowStockProducts.length} low stock warnings
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-6 shadow-2xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="eyebrow text-xs">Client Inquiries</span>
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-purple-50 text-purple-700">
                    <MessageSquare size={20} />
                  </div>
                </div>
                <p className="mt-4 font-serif text-3xl text-petrol font-semibold">{inquiries.length}</p>
                <p className="mt-1 text-xs text-purple-700">
                  {newInquiriesCount} waiting for concierge reply
                </p>
              </div>
            </div>

            {/* Quick Actions & Recent Orders Row */}
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Recent Orders (2 Cols) */}
              <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-xl text-petrol">Recent Customer Orders</h3>
                  <button
                    onClick={() => setActiveTab("orders")}
                    className="eyebrow text-xs text-petrol underline"
                  >
                    View All Orders
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground eyebrow">
                        <th className="pb-3">Order ID</th>
                        <th className="pb-3">Customer</th>
                        <th className="pb-3">Items</th>
                        <th className="pb-3">Total</th>
                        <th className="pb-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {orders.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-muted-foreground">
                            No sales or customer orders placed yet. Live orders will appear here automatically.
                          </td>
                        </tr>
                      ) : (
                        orders.slice(0, 5).map((o) => (
                          <tr key={o.id} className="hover:bg-muted/40">
                            <td className="py-3 font-semibold text-petrol">{o.id}</td>
                            <td className="py-3">
                              <p className="font-medium text-charcoal">{o.customerName}</p>
                              <p className="text-[11px] text-muted-foreground">{o.customerEmail}</p>
                            </td>
                            <td className="py-3">{o.items.length} pcs</td>
                            <td className="py-3 font-medium text-charcoal">{formatINR(o.total)}</td>
                            <td className="py-3">
                              <span
                                className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                                  o.orderStatus === "Delivered"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : o.orderStatus === "Shipped"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-amber-100 text-amber-800"
                                }`}
                              >
                                {o.orderStatus}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Quick Shortcuts & Inventory Health (1 Col) */}
              <div className="space-y-6">
                <div className="rounded-2xl border border-border bg-card p-6 shadow-2xs space-y-3">
                  <h3 className="font-serif text-lg text-petrol">Quick Actions</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setActiveTab("products");
                        setIsAddModalOpen(true);
                      }}
                      className="flex w-full items-center justify-between rounded-lg bg-petrol p-3 eyebrow text-xs text-ivory hover:bg-charcoal transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Plus size={16} /> Add New Jewelry Piece
                      </span>
                      <ArrowUpRight size={14} />
                    </button>

                    <button
                      onClick={() => setActiveTab("orders")}
                      className="flex w-full items-center justify-between rounded-lg border border-border bg-ivory p-3 eyebrow text-xs text-petrol hover:border-gold transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Package size={16} /> Process Pending Orders
                      </span>
                      <ArrowUpRight size={14} />
                    </button>

                    <button
                      onClick={() => setActiveTab("inquiries")}
                      className="flex w-full items-center justify-between rounded-lg border border-border bg-ivory p-3 eyebrow text-xs text-petrol hover:border-gold transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <MessageSquare size={16} /> Answer Inquiries
                      </span>
                      <ArrowUpRight size={14} />
                    </button>
                  </div>
                </div>

                {/* Low Stock Warning Box */}
                <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-6 space-y-3">
                  <div className="flex items-center gap-2 text-amber-900 font-semibold text-sm">
                    <AlertCircle size={18} />
                    <span>Low Stock Watchlist ({lowStockProducts.length})</span>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {lowStockProducts.map((p) => (
                      <div key={p.id} className="flex items-center justify-between text-xs py-1 border-b border-amber-200/60">
                        <span className="text-charcoal font-medium truncate max-w-[150px]">{p.name}</span>
                        <span className="font-bold text-amber-800">{p.stock} units left</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: PRODUCTS CRUD MANAGEMENT */}
        {/* ============================================================== */}
        {activeTab === "products" && (
          <div className="mt-8 space-y-6 animate-in fade-in duration-150">
            {/* Header Controls: Search, Category Filter, Add Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="flex flex-1 flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[240px]">
                  <Search size={16} className="absolute left-3 top-3 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search by product name or category…"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="h-10 w-full rounded-lg border border-input bg-card pl-9 pr-3 text-xs outline-none focus:border-gold"
                  />
                </div>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="h-10 rounded-lg border border-input bg-card px-3 text-xs text-charcoal outline-none focus:border-gold"
                >
                  <option value="all">All Categories</option>
                  {defaultCategories.map((c) => (
                    <option key={c.slug} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={resetCatalog}
                  className="h-10 rounded-lg border border-border bg-card px-3 eyebrow text-[10px] text-muted-foreground hover:text-petrol transition-colors"
                  title="Restore original jewelry catalog"
                >
                  Restore Catalog
                </button>
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setFormData({
                      name: "",
                      slug: "",
                      category: "necklaces",
                      price: 1999,
                      originalPrice: 2499,
                      stock: 20,
                      badge: "",
                      image: necklaceImg,
                      customImageUrl: "",
                      description: "",
                      material: "18K Gold Vermeil over 925 Sterling Silver",
                    });
                    setIsAddModalOpen(true);
                  }}
                  className="flex h-10 items-center gap-1.5 rounded-lg bg-petrol px-4 eyebrow text-xs text-ivory hover:bg-charcoal transition-colors shadow-xs"
                >
                  <Plus size={16} /> Add Product
                </button>
              </div>
            </div>

            {/* Products Table */}
            <div className="rounded-2xl border border-border bg-card shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/40 border-b border-border text-muted-foreground eyebrow">
                    <tr>
                      <th className="py-3 px-4">Piece</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Price</th>
                      <th className="py-3 px-4">Stock</th>
                      <th className="py-3 px-4">Badge</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4 flex items-center gap-3">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="h-12 w-12 rounded-lg object-cover border border-border shrink-0"
                          />
                          <div>
                            <p className="font-serif text-sm text-charcoal font-medium">{p.name}</p>
                            <p className="text-[11px] text-muted-foreground line-clamp-1">{p.material}</p>
                          </div>
                        </td>

                        <td className="py-3 px-4 capitalize text-charcoal/80">
                          {p.category.replace("-", " ")}
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-semibold text-petrol">{formatINR(p.price)}</div>
                          {p.originalPrice && (
                            <div className="text-[11px] text-muted-foreground line-through">
                              {formatINR(p.originalPrice)}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                              p.stock > 15
                                ? "bg-emerald-100 text-emerald-800"
                                : p.stock > 0
                                ? "bg-amber-100 text-amber-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {p.stock > 0 ? `${p.stock} in stock` : "Out of stock"}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          {p.badge ? (
                            <span className="rounded-full bg-butter px-2.5 py-0.5 text-[10px] font-semibold text-petrol">
                              {p.badge}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => openEditModal(p)}
                            className="rounded-md border border-border p-1.5 text-charcoal hover:bg-muted hover:text-petrol transition-colors"
                            title="Edit product"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(p.id)}
                            className="rounded-md border border-border p-1.5 text-charcoal hover:bg-destructive/10 hover:text-destructive transition-colors"
                            title="Delete product"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: ORDERS MANAGEMENT */}
        {/* ============================================================== */}
        {activeTab === "orders" && (
          <div className="mt-8 space-y-6 animate-in fade-in duration-150">
            {/* Filter and Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search size={16} className="absolute left-3 top-3 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by Order ID, customer name, email…"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="h-10 w-full rounded-lg border border-input bg-card pl-9 pr-3 text-xs outline-none focus:border-gold"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {["all", "Processing", "Confirmed", "Shipped", "Delivered", "Cancelled"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setOrderStatusFilter(st)}
                    className={`rounded-lg px-3 py-1.5 text-xs eyebrow transition-colors ${
                      orderStatusFilter === st
                        ? "bg-petrol text-ivory font-semibold"
                        : "border border-border bg-card text-charcoal hover:bg-muted"
                    }`}
                  >
                    {st}
                  </button>
                ))}

                {orders.length > 0 && (
                  <button
                    onClick={() => {
                      if (window.confirm("Reset all orders and sales data back to 0 for production?")) {
                        resetOrders();
                      }
                    }}
                    className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-1.5 text-xs eyebrow text-destructive hover:bg-destructive hover:text-white transition-colors ml-auto"
                    title="Wipe test orders"
                  >
                    Reset Sales to Zero
                  </button>
                )}
              </div>
            </div>

            {/* Orders Feed */}
            <div className="space-y-4">
              {filteredOrders.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
                  No orders match your filter criteria.
                </div>
              ) : (
                filteredOrders.map((o) => (
                  <div
                    key={o.id}
                    className="rounded-2xl border border-border bg-card p-6 shadow-2xs space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-serif text-lg font-semibold text-petrol">{o.id}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(o.createdAt).toLocaleString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-charcoal font-medium mt-0.5">
                          {o.customerName} · {o.customerEmail} · {o.customerPhone}
                        </p>
                      </div>

                      {/* Status Selector Dropdown */}
                      <div className="flex items-center gap-3">
                        <label className="text-xs eyebrow text-muted-foreground">Update Status:</label>
                        <select
                          value={o.orderStatus}
                          onChange={(e) =>
                            updateOrderStatus(o.id, e.target.value as Order["orderStatus"])
                          }
                          className="h-9 rounded-lg border border-input bg-ivory px-3 text-xs font-semibold text-petrol outline-none focus:border-gold"
                        >
                          <option value="Processing">Processing</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>

                    {/* Ordered Items */}
                    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                      {o.items.map((it, idx) => (
                        <div key={idx} className="flex items-center gap-3 rounded-lg border border-border p-2 bg-ivory/50">
                          <img
                            src={it.image}
                            alt={it.name}
                            className="h-12 w-12 rounded-md object-cover border border-border"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-serif text-xs text-charcoal truncate">{it.name}</p>
                            <p className="text-[11px] text-muted-foreground">
                              Qty: {it.quantity} × {formatINR(it.price)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Meta info bar */}
                    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4 text-xs text-muted-foreground">
                      <div>
                        <span className="font-medium text-charcoal">Delivery Address: </span>
                        {o.shippingAddress.street}, {o.shippingAddress.city}, {o.shippingAddress.state} - {o.shippingAddress.pinCode}
                      </div>

                      <div className="flex items-center gap-4">
                        <span>
                          <strong className="text-charcoal">Payment: </strong>
                          <span className="font-semibold text-petrol">{o.paymentMethod.toUpperCase()}</span> ({o.paymentStatus})
                          {o.razorpayPaymentId && (
                            <span className="ml-2 inline-flex items-center gap-1 font-mono text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-300">
                              <ShieldCheck size={11} className="text-emerald-700" />
                              {o.razorpayPaymentId}
                            </span>
                          )}
                        </span>
                        <span className="font-serif text-base font-semibold text-petrol">
                          Total: {formatINR(o.total)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: CLIENT INQUIRIES */}
        {/* ============================================================== */}
        {activeTab === "inquiries" && (
          <div className="mt-8 space-y-4 animate-in fade-in duration-150">
            {inquiries.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
                No customer inquiries received yet.
              </div>
            ) : (
              inquiries.map((inq) => (
                <div
                  key={inq.id}
                  className="rounded-2xl border border-border bg-card p-6 shadow-2xs space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-3">
                    <div>
                      <h4 className="font-serif text-lg text-petrol font-medium">
                        {inq.subject || "Customer Inquiry"}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        From <strong>{inq.name}</strong> ({inq.email}) on{" "}
                        {new Date(inq.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                          inq.status === "new"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {inq.status === "new" ? "New Message" : "Replied"}
                      </span>
                      <button
                        onClick={() =>
                          updateInquiryStatus(inq.id, inq.status === "new" ? "replied" : "new")
                        }
                        className="rounded-lg border border-border px-3 py-1 text-xs text-charcoal hover:bg-muted transition-colors"
                      >
                        Mark as {inq.status === "new" ? "Replied" : "Unread"}
                      </button>
                    </div>
                  </div>

                  <p className="text-xs leading-relaxed text-charcoal/90 bg-ivory p-4 rounded-xl border border-border">
                    "{inq.message}"
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 5: STORE SETTINGS */}
        {/* ============================================================== */}
        {activeTab === "settings" && (
          <div className="mt-8 max-w-2xl space-y-6 animate-in fade-in duration-150">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-2xs space-y-4">
              <h3 className="font-serif text-xl text-petrol">Store Configuration</h3>
              <p className="text-xs text-muted-foreground">
                Marga Jewelry global settings and promotional coupon parameters.
              </p>

              <div className="space-y-3 pt-2 text-xs">
                <div className="flex justify-between border-b border-border py-2.5">
                  <span className="font-medium text-charcoal">Base Currency</span>
                  <span className="text-petrol font-semibold">INR (₹)</span>
                </div>
                <div className="flex justify-between border-b border-border py-2.5">
                  <span className="font-medium text-charcoal">Free Shipping Threshold</span>
                  <span className="text-petrol font-semibold">₹2,499</span>
                </div>
                <div className="flex justify-between border-b border-border py-2.5">
                  <span className="font-medium text-charcoal">Standard Courier Fee</span>
                  <span className="text-petrol font-semibold">₹99</span>
                </div>
                <div className="flex justify-between border-b border-border py-2.5">
                  <span className="font-medium text-charcoal">Concierge Email</span>
                  <span className="text-petrol font-semibold">concierge@margajewelry.com</span>
                </div>
              </div>
            </div>

            {/* Active Coupon Codes */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-2xs space-y-4">
              <h3 className="font-serif text-xl text-petrol">Active Promotional Coupons</h3>
              <div className="space-y-3">
                {availableCoupons.map((c) => (
                  <div key={c.code} className="flex items-center justify-between rounded-xl border border-border bg-ivory p-3 text-xs">
                    <div>
                      <span className="font-semibold text-petrol uppercase tracking-wider">{c.code}</span>
                      <p className="text-muted-foreground text-[11px]">{c.description}</p>
                    </div>
                    <span className="rounded-md bg-butter px-2.5 py-1 text-[10px] font-bold text-petrol">
                      {c.type === "percent" ? `${c.value}% OFF` : `₹${c.value} OFF`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Admin Team & Password Management */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-xl text-petrol">Administrator Access</h3>
                  <p className="text-xs text-muted-foreground">
                    Store management privileges assigned to <strong>Chirag</strong> and <strong>Greeshma</strong>.
                  </p>
                </div>
                <span className="rounded-full bg-butter px-2.5 py-0.5 text-[10px] font-bold uppercase text-petrol">
                  2 Admins
                </span>
              </div>

              <div className="space-y-3 pt-2">
                <div className="rounded-xl border border-border bg-ivory p-3 text-xs flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-petrol">Chirag</p>
                    <p className="text-[11px] text-muted-foreground">Username: <code className="bg-card px-1 py-0.5 rounded">chirag</code> · chirag@margajewelry.com</p>
                  </div>
                  <span className="text-[11px] text-muted-foreground bg-card px-2 py-1 rounded border border-border">
                    {currentUser.username === "chirag" ? "Active Now (You)" : "Admin"}
                  </span>
                </div>

                <div className="rounded-xl border border-border bg-ivory p-3 text-xs flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-petrol">Greeshma</p>
                    <p className="text-[11px] text-muted-foreground">Username: <code className="bg-card px-1 py-0.5 rounded">greeshma</code> · greeshma@margajewelry.com</p>
                  </div>
                  <span className="text-[11px] text-muted-foreground bg-card px-2 py-1 rounded border border-border">
                    {currentUser.username === "greeshma" ? "Active Now (You)" : "Admin"}
                  </span>
                </div>
              </div>

              {/* Password update form for currently logged-in admin */}
              <div className="border-t border-border pt-4 mt-4">
                <h4 className="font-serif text-base text-petrol mb-1">
                  Change Password for {currentUser.name}
                </h4>
                <p className="text-[11px] text-muted-foreground mb-3">
                  Passwords can be set via <code className="bg-muted px-1 rounded">.env</code> or updated directly here.
                </p>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newPasswordInput) return;
                    const res = changeAdminPassword(
                      (currentUser.username as "chirag" | "greeshma") || "chirag",
                      newPasswordInput
                    );
                    setPasswordChangeStatus({ ok: res.success, msg: res.message });
                    if (res.success) setNewPasswordInput("");
                  }}
                  className="space-y-3"
                >
                  <div className="flex gap-2">
                    <input
                      type="password"
                      placeholder="Enter new strong password (min 6 chars)..."
                      value={newPasswordInput}
                      onChange={(e) => setNewPasswordInput(e.target.value)}
                      className="h-10 flex-1 rounded-lg border border-input bg-ivory px-3 text-xs outline-none focus:border-gold"
                    />
                    <button
                      type="submit"
                      className="rounded-lg bg-petrol px-4 py-2 eyebrow text-xs text-ivory hover:bg-charcoal transition-colors"
                    >
                      Update Password
                    </button>
                  </div>

                  {passwordChangeStatus && (
                    <p className={`text-xs ${passwordChangeStatus.ok ? "text-emerald-700" : "text-destructive"}`}>
                      {passwordChangeStatus.msg}
                    </p>
                  )}
                </form>
              </div>
            </div>

            {/* Razorpay Gateway Configuration */}
            <div className="rounded-2xl border-2 border-gold/40 bg-card p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-petrol text-ivory">
                    <ShieldCheck size={18} className="text-butter" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl text-petrol">Razorpay Payment Gateway</h3>
                    <p className="text-xs text-muted-foreground">
                      Handles instant customer UPI (GPay, PhonePe, Paytm), Cards & NetBanking.
                    </p>
                  </div>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                  razorpayKeyInput.trim() ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                }`}>
                  {razorpayKeyInput.trim() ? "Gateway Active" : "Key Needed"}
                </span>
              </div>

              <div className="rounded-xl border border-border bg-ivory p-4 text-xs space-y-2 text-charcoal/80">
                <p className="font-semibold text-petrol">How to get your Razorpay Key ID:</p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>In your Razorpay Dashboard, look at the bottom left menu: click <strong>Account & Settings</strong>.</li>
                  <li>Under <em>Website and app settings</em>, click <strong>API Keys</strong>.</li>
                  <li>Click <strong>Generate Key</strong> (or copy your existing Key ID starting with <code className="bg-card px-1 py-0.5 rounded text-charcoal font-mono">rzp_test_...</code> or <code className="bg-card px-1 py-0.5 rounded text-charcoal font-mono">rzp_live_...</code>).</li>
                  <li>Paste the Key ID below and click <strong>Save Key</strong> (or put it in <code className="bg-card px-1 rounded">.env</code> as <code className="font-mono">VITE_RAZORPAY_KEY_ID</code>).</li>
                </ol>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  localStorage.setItem("marga_razorpay_key_id", razorpayKeyInput.trim());
                  setKeySavedMessage(true);
                  setTimeout(() => setKeySavedMessage(false), 2500);
                }}
                className="space-y-3 pt-1"
              >
                <div>
                  <label className="mb-1 block text-xs eyebrow text-muted-foreground">Razorpay Key ID</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. rzp_test_1DP5mmOlF5G5ag"
                      value={razorpayKeyInput}
                      onChange={(e) => setRazorpayKeyInput(e.target.value)}
                      className="h-10 flex-1 rounded-lg border border-input bg-ivory px-3 font-mono text-xs text-charcoal outline-none focus:border-gold"
                    />
                    <button
                      type="submit"
                      className="rounded-lg bg-petrol px-5 py-2 eyebrow text-xs text-ivory hover:bg-charcoal transition-colors shadow-xs"
                    >
                      Save Key
                    </button>
                  </div>
                </div>

                {keySavedMessage && (
                  <p className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                    <CheckCircle2 size={14} /> Razorpay Key ID saved and active for store checkout!
                  </p>
                )}
              </form>
            </div>

            {/* Production Sales & Order Reset */}
            <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 shadow-2xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-serif text-lg text-destructive font-semibold">Store Sales & Orders Reset</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Clear all testing and past sales data to reset your revenue, transaction metrics, and order count to zero.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Are you sure you want to reset all sales and orders to 0? This will wipe the order list clean for production.")) {
                      resetOrders();
                      alert("Store orders and revenue have been reset to zero.");
                    }
                  }}
                  className="rounded-lg bg-destructive px-4 py-2 eyebrow text-xs text-white hover:bg-destructive/90 transition-colors shadow-2xs shrink-0"
                >
                  Reset Sales to Zero
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* MODAL: ADD / EDIT PRODUCT */}
      {/* ============================================================== */}
      {(isAddModalOpen || editingProduct) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/60 p-4 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => {
            setIsAddModalOpen(false);
            setEditingProduct(null);
          }}
        >
          <div
            className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-ivory p-6 md:p-8 shadow-2xl no-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h2 className="font-serif text-2xl text-petrol">
                {editingProduct ? "Edit Jewelry Piece" : "Add New Jewelry Piece"}
              </h2>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingProduct(null);
                }}
                className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted text-charcoal"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="mt-6 space-y-4 text-xs">
              <div>
                <label className="mb-1 block eyebrow text-muted-foreground">Product Title *</label>
                <input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Celestial Moonstone Pendant"
                  className="h-11 w-full rounded-lg border border-input bg-card px-3 text-sm text-charcoal outline-none focus:border-gold"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block eyebrow text-muted-foreground">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="h-11 w-full rounded-lg border border-input bg-card px-3 text-sm text-charcoal outline-none focus:border-gold"
                  >
                    {defaultCategories.map((c) => (
                      <option key={c.slug} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block eyebrow text-muted-foreground">Badge (Optional)</label>
                  <select
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value as any })}
                    className="h-11 w-full rounded-lg border border-input bg-card px-3 text-sm text-charcoal outline-none focus:border-gold"
                  >
                    <option value="">None</option>
                    <option value="Bestseller">Bestseller</option>
                    <option value="New">New</option>
                    <option value="Trending">Trending</option>
                    <option value="Limited">Limited</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block eyebrow text-muted-foreground">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="h-11 w-full rounded-lg border border-input bg-card px-3 text-sm text-charcoal outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="mb-1 block eyebrow text-muted-foreground">Compare Price (₹)</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: Number(e.target.value) })}
                    className="h-11 w-full rounded-lg border border-input bg-card px-3 text-sm text-charcoal outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="mb-1 block eyebrow text-muted-foreground">Stock Units *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="h-11 w-full rounded-lg border border-input bg-card px-3 text-sm text-charcoal outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block eyebrow text-muted-foreground">Material & Craftsmanship</label>
                <input
                  value={formData.material}
                  onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                  placeholder="e.g. 18K Gold Vermeil over 925 Sterling Silver"
                  className="h-11 w-full rounded-lg border border-input bg-card px-3 text-sm text-charcoal outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="mb-1 block eyebrow text-muted-foreground">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the aesthetic, fit and styling recommendation…"
                  className="w-full rounded-lg border border-input bg-card p-3 text-sm text-charcoal outline-none focus:border-gold"
                />
              </div>

              {/* Image Picker */}
              <div>
                <label className="mb-2 block eyebrow text-muted-foreground">Select Product Photography</label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3">
                  {PRESET_IMAGES.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setFormData({ ...formData, image: img.url, customImageUrl: "" })}
                      className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                        formData.image === img.url && !formData.customImageUrl
                          ? "border-petrol ring-2 ring-gold"
                          : "border-border hover:border-gold"
                      }`}
                    >
                      <img src={img.url} alt={img.label} className="h-full w-full object-cover" />
                      <span className="absolute inset-x-0 bottom-0 bg-petrol/75 py-0.5 text-center text-[9px] text-ivory">
                        {img.label}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] text-muted-foreground">Or provide custom image web URL:</span>
                  <input
                    type="url"
                    value={formData.customImageUrl}
                    onChange={(e) => setFormData({ ...formData, customImageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="h-10 w-full rounded-lg border border-input bg-card px-3 text-xs text-charcoal outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingProduct(null);
                  }}
                  className="rounded-lg border border-border px-5 py-2.5 eyebrow text-xs text-charcoal hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-petrol px-6 py-2.5 eyebrow text-xs text-ivory hover:bg-charcoal transition-colors shadow-xs"
                >
                  {editingProduct ? "Save Changes" : "Publish Piece"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: DELETE PRODUCT CONFIRMATION */}
      {/* ============================================================== */}
      {deleteConfirmId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/60 p-4 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setDeleteConfirmId(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-ivory p-6 shadow-2xl text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-rose-100 text-destructive mb-3">
              <Trash2 size={24} />
            </div>
            <h3 className="font-serif text-xl text-petrol">Delete Jewelry Piece?</h3>
            <p className="mt-2 text-xs text-muted-foreground">
              This action will remove the item from the storefront and customer wishlists.
            </p>

            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="rounded-lg border border-border px-4 py-2 eyebrow text-xs text-charcoal hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteProduct(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="rounded-lg bg-destructive px-5 py-2 eyebrow text-xs text-ivory hover:opacity-90"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
