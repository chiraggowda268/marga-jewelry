import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import {
  User as UserIcon,
  ShoppingBag,
  Package,
  Heart,
  MapPin,
  LogOut,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  Clock,
  Truck,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { formatINR } from "@/lib/db";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My Account — Marga Jewelry" },
      { name: "description", content: "Manage your Marga Jewelry profile, orders, and wishlist." },
      { property: "og:title", content: "My Account — Marga Jewelry" },
      { property: "og:description", content: "Manage your Marga profile and orders." },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const {
    currentUser,
    login,
    register,
    logout,
    orders,
    wishlist,
    products,
    addToCart,
    toggleWish,
    updateProfile,
  } = useStore();

  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  // Active tab inside logged-in account
  const [activeTab, setActiveTab] = useState<"orders" | "profile" | "wishlist">("orders");

  // Profile editable fields
  const [profileName, setProfileName] = useState(currentUser?.name ?? "");
  const [profilePhone, setProfilePhone] = useState(currentUser?.phone ?? "");
  const [profileStreet, setProfileStreet] = useState(currentUser?.address?.street ?? "");
  const [profileCity, setProfileCity] = useState(currentUser?.address?.city ?? "");
  const [profileState, setProfileState] = useState(currentUser?.address?.state ?? "");
  const [profilePin, setProfilePin] = useState(currentUser?.address?.pinCode ?? "");
  const [profileSaved, setProfileSaved] = useState(false);

  const navigate = useNavigate();

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!email.trim()) return setAuthError("Please provide your email address.");
    const res = login(email, password);
    if (!res.success) setAuthError(res.error || "Login failed");
  };

  const handleRegister = (e: FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!name.trim() || !email.trim()) return setAuthError("Please fill in required fields.");
    const res = register(name, email, password, phone);
    if (!res.success) setAuthError(res.error || "Registration failed");
  };

  const handleSaveProfile = (e: FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: profileName,
      phone: profilePhone,
      address: {
        street: profileStreet,
        city: profileCity,
        state: profileState,
        pinCode: profilePin,
      },
    });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  // If user is not logged in, render the Auth Form
  if (!currentUser) {
    return (
      <section className="mx-auto max-w-lg px-4 py-16">
        <div className="text-center mb-8">
          <p className="eyebrow text-gold">Welcome to Marga</p>
          <h1 className="mt-2 text-3xl font-serif text-petrol md:text-4xl">Client Account</h1>
          <p className="mt-2 text-xs text-muted-foreground">
            Sign in to track orders, manage your wishlist, and enjoy express checkout.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          {/* Tabs */}
          <div className="flex border-b border-border mb-6">
            <button
              onClick={() => {
                setAuthTab("login");
                setAuthError(null);
              }}
              className={`flex-1 pb-3 text-center eyebrow text-xs transition-colors ${
                authTab === "login"
                  ? "border-b-2 border-petrol text-petrol font-semibold"
                  : "text-muted-foreground hover:text-charcoal"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setAuthTab("register");
                setAuthError(null);
              }}
              className={`flex-1 pb-3 text-center eyebrow text-xs transition-colors ${
                authTab === "register"
                  ? "border-b-2 border-petrol text-petrol font-semibold"
                  : "text-muted-foreground hover:text-charcoal"
              }`}
            >
              Create Account
            </button>
          </div>

          {authError && (
            <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-xs text-destructive">
              {authError}
            </div>
          )}

          {authTab === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs eyebrow text-muted-foreground">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="priya@example.com"
                  className="h-11 w-full rounded-lg border border-input bg-ivory px-3 text-sm text-charcoal outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs eyebrow text-muted-foreground">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 w-full rounded-lg border border-input bg-ivory px-3 text-sm text-charcoal outline-none focus:border-gold"
                />
              </div>

              <button
                type="submit"
                className="h-11 w-full rounded-lg bg-petrol eyebrow text-xs text-ivory hover:bg-charcoal transition-colors shadow-xs"
              >
                Sign In
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs eyebrow text-muted-foreground">Full Name *</label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Priya Sharma"
                  className="h-11 w-full rounded-lg border border-input bg-ivory px-3 text-sm text-charcoal outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs eyebrow text-muted-foreground">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="priya@example.com"
                  className="h-11 w-full rounded-lg border border-input bg-ivory px-3 text-sm text-charcoal outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs eyebrow text-muted-foreground">Phone Number (Optional)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="h-11 w-full rounded-lg border border-input bg-ivory px-3 text-sm text-charcoal outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs eyebrow text-muted-foreground">Password *</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 w-full rounded-lg border border-input bg-ivory px-3 text-sm text-charcoal outline-none focus:border-gold"
                />
              </div>

              <button
                type="submit"
                className="h-11 w-full rounded-lg bg-petrol eyebrow text-xs text-ivory hover:bg-charcoal transition-colors shadow-xs"
              >
                Create Account
              </button>
            </form>
          )}
        </div>
      </section>
    );
  }

  // Filter orders for the current user (or show all if admin)
  const userOrders = currentUser.role === "admin"
    ? orders
    : orders.filter((o) => o.userId === currentUser.id || o.customerEmail === currentUser.email);

  const wishedProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 md:px-8">
      {/* Account Overview Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl bg-petrol p-6 md:p-8 text-ivory shadow-md">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-butter text-petrol font-serif text-2xl font-bold">
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl md:text-3xl">{currentUser.name}</h1>
              {currentUser.role === "admin" && (
                <span className="rounded-full bg-butter px-2.5 py-0.5 text-[10px] font-bold uppercase text-petrol">
                  Admin
                </span>
              )}
            </div>
            <p className="text-xs text-ivory/80">{currentUser.email}</p>
            {currentUser.phone && <p className="text-xs text-ivory/60">{currentUser.phone}</p>}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {currentUser.role === "admin" && (
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 rounded-lg bg-butter px-4 py-2 eyebrow text-xs text-petrol hover:bg-gold transition-colors font-semibold"
            >
              <ShieldAlert size={16} /> Admin Portal
            </Link>
          )}
          <button
            onClick={logout}
            className="inline-flex items-center gap-1.5 rounded-lg border border-ivory/30 px-4 py-2 eyebrow text-xs text-ivory hover:bg-ivory/10 transition-colors"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-8 flex gap-2 border-b border-border overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab("orders")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 eyebrow text-xs transition-colors whitespace-nowrap ${
            activeTab === "orders"
              ? "border-petrol text-petrol font-semibold"
              : "border-transparent text-muted-foreground hover:text-charcoal"
          }`}
        >
          <Package size={16} /> My Orders ({userOrders.length})
        </button>

        <button
          onClick={() => setActiveTab("wishlist")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 eyebrow text-xs transition-colors whitespace-nowrap ${
            activeTab === "wishlist"
              ? "border-petrol text-petrol font-semibold"
              : "border-transparent text-muted-foreground hover:text-charcoal"
          }`}
        >
          <Heart size={16} /> Wishlist ({wishedProducts.length})
        </button>

        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 eyebrow text-xs transition-colors whitespace-nowrap ${
            activeTab === "profile"
              ? "border-petrol text-petrol font-semibold"
              : "border-transparent text-muted-foreground hover:text-charcoal"
          }`}
        >
          <MapPin size={16} /> Addresses & Profile
        </button>
      </div>

      {/* TAB 1: Orders */}
      {activeTab === "orders" && (
        <div className="mt-8 space-y-6">
          {userOrders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center">
              <Package size={40} className="mx-auto text-muted-foreground/60 mb-3" />
              <p className="font-serif text-xl text-petrol">No orders yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Your jewelry pieces will appear here once you make your first purchase.
              </p>
              <Link
                to="/shop"
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-petrol px-6 py-2.5 eyebrow text-xs text-ivory hover:bg-charcoal"
              >
                <span>Browse Collection</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            userOrders.map((o) => (
              <div
                key={o.id}
                className="rounded-2xl border border-border bg-card p-6 shadow-2xs transition-shadow hover:shadow-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
                  <div>
                    <span className="eyebrow text-gold font-semibold">Order ID: {o.id}</span>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Placed on {new Date(o.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                        o.orderStatus === "Delivered"
                          ? "bg-emerald-100 text-emerald-800"
                          : o.orderStatus === "Shipped"
                          ? "bg-blue-100 text-blue-800"
                          : o.orderStatus === "Cancelled"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {o.orderStatus === "Delivered" ? (
                        <CheckCircle2 size={13} />
                      ) : o.orderStatus === "Shipped" ? (
                        <Truck size={13} />
                      ) : (
                        <Clock size={13} />
                      )}
                      {o.orderStatus}
                    </span>
                    <span className="font-serif text-lg text-petrol font-semibold">
                      {formatINR(o.total)}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="py-4 space-y-3">
                  {o.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-16 w-16 rounded-lg object-cover border border-border"
                      />
                      <div className="flex-1">
                        <p className="font-serif text-base text-charcoal">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Qty: {item.quantity} · {formatINR(item.price)} each
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-charcoal">
                        {formatINR(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Shipping & Payment Meta */}
                <div className="flex flex-wrap justify-between gap-4 border-t border-border pt-4 text-xs text-muted-foreground">
                  <div>
                    <span className="font-medium text-charcoal">Ship to: </span>
                    {o.shippingAddress.street}, {o.shippingAddress.city}, {o.shippingAddress.state} - {o.shippingAddress.pinCode}
                  </div>
                  <div>
                    <span className="font-medium text-charcoal">Payment: </span>
                    {o.paymentMethod.toUpperCase()} ({o.paymentStatus})
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: Wishlist */}
      {activeTab === "wishlist" && (
        <div className="mt-8">
          {wishedProducts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center">
              <Heart size={40} className="mx-auto text-muted-foreground/60 mb-3" />
              <p className="font-serif text-xl text-petrol">Your wishlist is empty</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Save your favorite everyday fine jewelry pieces by clicking the heart icon.
              </p>
              <Link
                to="/shop"
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-petrol px-6 py-2.5 eyebrow text-xs text-ivory hover:bg-charcoal"
              >
                <span>Discover Pieces</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
              {wishedProducts.map((p) => (
                <div
                  key={p.id}
                  className="rounded-xl border border-border bg-card p-3 flex flex-col justify-between shadow-2xs"
                >
                  <div>
                    <img
                      src={p.image}
                      alt={p.name}
                      className="aspect-square w-full rounded-lg object-cover"
                    />
                    <p className="mt-2 font-serif text-base text-charcoal line-clamp-1">{p.name}</p>
                    <p className="text-xs font-medium text-petrol">{formatINR(p.price)}</p>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => addToCart(p.id)}
                      className="flex-1 rounded-lg bg-petrol py-2 eyebrow text-[10px] text-ivory hover:bg-charcoal transition-colors flex items-center justify-center gap-1"
                    >
                      <ShoppingBag size={12} /> Add to Bag
                    </button>
                    <button
                      onClick={() => toggleWish(p.id)}
                      className="rounded-lg border border-border px-2.5 py-2 text-xs text-muted-foreground hover:text-destructive transition-colors"
                      aria-label="Remove from wishlist"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Addresses & Profile */}
      {activeTab === "profile" && (
        <div className="mt-8 max-w-2xl">
          <form
            onSubmit={handleSaveProfile}
            className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-xs space-y-4"
          >
            <h2 className="font-serif text-2xl text-petrol">Delivery & Contact Profile</h2>
            <p className="text-xs text-muted-foreground">
              These details are automatically populated at checkout for speedy ordering.
            </p>

            <div className="grid gap-4 sm:grid-cols-2 pt-2">
              <div>
                <label className="mb-1 block text-xs eyebrow text-muted-foreground">Full Name</label>
                <input
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="h-11 w-full rounded-lg border border-input bg-ivory px-3 text-sm text-charcoal outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs eyebrow text-muted-foreground">Phone Number</label>
                <input
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="h-11 w-full rounded-lg border border-input bg-ivory px-3 text-sm text-charcoal outline-none focus:border-gold"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs eyebrow text-muted-foreground">Street Address / Apartment</label>
              <input
                value={profileStreet}
                onChange={(e) => setProfileStreet(e.target.value)}
                placeholder="Flat 402, Lotus Tower, MG Road"
                className="h-11 w-full rounded-lg border border-input bg-ivory px-3 text-sm text-charcoal outline-none focus:border-gold"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs eyebrow text-muted-foreground">City</label>
                <input
                  value={profileCity}
                  onChange={(e) => setProfileCity(e.target.value)}
                  placeholder="Mumbai"
                  className="h-11 w-full rounded-lg border border-input bg-ivory px-3 text-sm text-charcoal outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs eyebrow text-muted-foreground">State</label>
                <input
                  value={profileState}
                  onChange={(e) => setProfileState(e.target.value)}
                  placeholder="Maharashtra"
                  className="h-11 w-full rounded-lg border border-input bg-ivory px-3 text-sm text-charcoal outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs eyebrow text-muted-foreground">PIN Code</label>
                <input
                  value={profilePin}
                  onChange={(e) => setProfilePin(e.target.value)}
                  placeholder="400050"
                  className="h-11 w-full rounded-lg border border-input bg-ivory px-3 text-sm text-charcoal outline-none focus:border-gold"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="submit"
                className="rounded-lg bg-petrol px-6 py-2.5 eyebrow text-xs text-ivory hover:bg-charcoal transition-colors shadow-xs"
              >
                Save Details
              </button>

              {profileSaved && (
                <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                  <CheckCircle2 size={15} /> Saved successfully!
                </span>
              )}
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
