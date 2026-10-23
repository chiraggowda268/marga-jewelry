import { Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import {
  Search,
  Heart,
  User as UserIcon,
  ShoppingBag,
  Menu,
  X,
  Instagram,
  Facebook,
  Youtube,
  Trash2,
  ArrowRight,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import logoDark from "@/assets/marga-logo-dark.png";
import logoLight from "@/assets/marga-logo-light.png";
import { formatINR, type Product } from "@/lib/db";
import { useStore } from "@/lib/store";

const nav = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/collections", label: "Collections" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function Logo({ light, className = "" }: { light?: boolean; className?: string }) {
  return (
    <img
      src={light ? logoLight : logoDark}
      alt="Marga Jewelry"
      className={className}
    />
  );
}

export function Header() {
  const { cart, wishlist, setCartOpen, currentUser, logout } = useStore();
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const count = Object.values(cart).reduce((a, b) => a + b, 0);

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    setSearch(false);
    navigate({ to: "/shop", search: { q } });
  };

  const icon = "grid h-11 w-11 place-items-center text-petrol hover:text-gold transition-colors";

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-petrol text-ivory px-4 py-1.5 text-center text-xs tracking-wider flex items-center justify-center gap-2">
        <Sparkles size={13} className="text-butter" />
        <span>Complimentary Express Delivery on orders above ₹2,499 | Use code <strong>MARGA10</strong></span>
        {currentUser?.role === "admin" && (
          <Link
            to="/admin"
            className="ml-3 hidden sm:inline-flex items-center gap-1 rounded bg-butter px-2 py-0.5 text-[10px] font-semibold text-petrol hover:bg-gold transition-colors"
          >
            <ShieldAlert size={11} /> Admin Panel
          </Link>
        )}
      </div>

      <header className="sticky top-0 z-40 border-b border-border bg-ivory">
        <div className="mx-auto grid h-20 max-w-7xl grid-cols-[auto_1fr_auto] items-center px-4 md:grid-cols-[1fr_auto_1fr] md:px-8 md:h-24">
          <button aria-label="Open menu" className={`${icon} md:hidden`} onClick={() => setMenu(true)}>
            <Menu size={22} />
          </button>

          <Link to="/" className="justify-self-center md:justify-self-start">
            <Logo className="h-14 w-auto md:h-[72px]" />
          </Link>

          <nav className="hidden items-center gap-9 md:flex">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="eyebrow text-charcoal hover:text-gold transition-colors"
                activeProps={{ className: "text-petrol border-b border-gold pb-1" }}
                activeOptions={{ exact: true }}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center justify-self-end relative">
            <button
              aria-label="Search"
              className={`${icon} hidden md:grid`}
              onClick={() => setSearch((s) => !s)}
            >
              <Search size={20} strokeWidth={1.5} />
            </button>

            <Link
              to="/shop"
              search={{ wishlist: true }}
              aria-label="Wishlist"
              className={`${icon} relative hidden md:grid`}
            >
              <Heart size={20} strokeWidth={1.5} />
              {wishlist.length > 0 && <Badge n={wishlist.length} />}
            </Link>

            {/* User Account / Dropdown */}
            <div className="relative">
              {currentUser ? (
                <button
                  onClick={() => setUserDropdown((prev) => !prev)}
                  className="flex h-11 items-center gap-1.5 px-2 text-petrol hover:text-gold transition-colors"
                  aria-label="User Account"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-petrol text-xs font-semibold text-ivory">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  {currentUser.role === "admin" && (
                    <span className="hidden lg:inline text-[10px] uppercase font-bold tracking-wider text-gold">
                      Admin
                    </span>
                  )}
                </button>
              ) : (
                <Link
                  to="/account"
                  aria-label="Sign in"
                  className={`${icon} hidden md:grid`}
                >
                  <UserIcon size={20} strokeWidth={1.5} />
                </Link>
              )}

              {userDropdown && currentUser && (
                <div
                  className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-border bg-ivory p-2 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150"
                  onClick={() => setUserDropdown(false)}
                >
                  <div className="border-b border-border px-3 py-2">
                    <p className="text-xs font-medium text-charcoal truncate">{currentUser.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{currentUser.email}</p>
                  </div>
                  <Link
                    to="/account"
                    className="block rounded-lg px-3 py-2 text-xs text-charcoal hover:bg-card hover:text-petrol transition-colors"
                  >
                    My Account & Orders
                  </Link>
                  {currentUser.role === "admin" && (
                    <Link
                      to="/admin"
                      className="block rounded-lg px-3 py-2 text-xs font-medium text-petrol bg-butter/40 hover:bg-butter transition-colors"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={logout}
                    className="w-full text-left rounded-lg px-3 py-2 text-xs text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>

            <button
              aria-label="Shopping bag"
              className={`${icon} relative`}
              onClick={() => setCartOpen(true)}
            >
              <ShoppingBag size={20} strokeWidth={1.5} />
              {count > 0 && <Badge n={count} />}
            </button>
          </div>
        </div>

        {search && (
          <form onSubmit={onSearch} className="border-t border-border bg-ivory px-4 py-3">
            <div className="mx-auto flex max-w-xl gap-2">
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search necklaces, hoops, rings…"
                className="h-11 flex-1 rounded-lg border border-input bg-card px-4 text-sm outline-none focus:border-gold"
              />
              <button className="h-11 rounded-lg bg-petrol px-6 eyebrow text-ivory">Search</button>
            </div>
          </form>
        )}

        {/* Mobile Slideout Nav */}
        {menu && (
          <div className="fixed inset-0 z-50 bg-petrol text-ivory md:hidden flex flex-col">
            <div className="flex h-20 items-center justify-between px-4">
              <Logo light className="h-14 w-auto" />
              <button
                aria-label="Close menu"
                className="grid h-11 w-11 place-items-center"
                onClick={() => setMenu(false)}
              >
                <X size={24} />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                setMenu(false);
                onSearch(e);
              }}
              className="px-6"
            >
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search catalog…"
                className="h-12 w-full rounded-lg border border-gold/50 bg-transparent px-4 text-ivory placeholder:text-ivory/60 outline-none"
              />
            </form>
            <nav className="mt-6 flex flex-col px-6 overflow-y-auto flex-1">
              {nav.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => setMenu(false)}
                  className="border-b border-ivory/15 py-4 font-serif text-2xl"
                >
                  {n.label}
                </Link>
              ))}
              <Link
                to="/shop"
                search={{ wishlist: true }}
                onClick={() => setMenu(false)}
                className="border-b border-ivory/15 py-4 font-serif text-2xl"
              >
                Wishlist ({wishlist.length})
              </Link>
              <Link
                to="/account"
                onClick={() => setMenu(false)}
                className="border-b border-ivory/15 py-4 font-serif text-2xl"
              >
                {currentUser ? `Account (${currentUser.name})` : "Sign In / Register"}
              </Link>
              {currentUser?.role === "admin" && (
                <Link
                  to="/admin"
                  onClick={() => setMenu(false)}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-butter px-4 py-3 font-medium text-petrol"
                >
                  <ShieldAlert size={18} /> Admin Dashboard
                </Link>
              )}
            </nav>
          </div>
        )}

        <CartDrawer />
      </header>
    </>
  );
}

function Badge({ n }: { n: number }) {
  return (
    <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-gold px-1 text-[10px] font-semibold text-charcoal">
      {n}
    </span>
  );
}

function CartDrawer() {
  const {
    cart,
    products,
    cartOpen,
    setCartOpen,
    updateCartQty,
    removeFromCart,
    cartSubtotal,
    cartDiscount,
    cartShipping,
    cartTotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
  } = useStore();

  const [promoInput, setPromoInput] = useState("");
  const [promoMessage, setPromoMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const navigate = useNavigate();

  if (!cartOpen) return null;

  const items = Object.entries(cart)
    .map(([id, qty]) => {
      const p = products.find((x) => x.id === id);
      return p ? { p, qty } : null;
    })
    .filter(Boolean) as { p: Product; qty: number }[];

  const handleApplyPromo = (e: FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const res = applyCoupon(promoInput.trim());
    setPromoMessage({ ok: res.success, text: res.message });
    if (res.success) setPromoInput("");
  };

  const handleProceedToCheckout = () => {
    setCartOpen(false);
    navigate({ to: "/checkout" });
  };

  const freeShippingThreshold = 2499;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - cartSubtotal);

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-charcoal/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={() => setCartOpen(false)}
    >
      <aside
        className="flex h-full w-full max-w-md flex-col bg-ivory shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <div>
            <h2 className="text-2xl font-serif text-petrol">Your Bag</h2>
            <p className="text-xs text-muted-foreground">{items.length} unique items</p>
          </div>
          <button
            aria-label="Close bag"
            className="grid h-10 w-10 place-items-center rounded-full hover:bg-card text-charcoal transition-colors"
            onClick={() => setCartOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Free Shipping Alert Bar */}
        <div className="bg-muted px-6 py-2.5 text-xs">
          {remainingForFreeShipping === 0 ? (
            <p className="text-petrol font-medium flex items-center gap-1.5">
              <span>🎉</span> You've unlocked <strong>Free Express Shipping!</strong>
            </p>
          ) : (
            <div className="space-y-1">
              <p className="text-charcoal/80">
                Add <strong>{formatINR(remainingForFreeShipping)}</strong> more to unlock Free Delivery
              </p>
              <div className="h-1.5 w-full rounded-full bg-border overflow-hidden">
                <div
                  className="h-full bg-gold transition-all duration-300"
                  style={{ width: `${Math.min(100, (cartSubtotal / freeShippingThreshold) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto px-6 py-2 divide-y divide-border/60">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <ShoppingBag size={48} strokeWidth={1} className="text-muted-foreground/50 mb-3" />
              <p className="font-serif text-xl text-charcoal">Your bag is empty</p>
              <p className="mt-1 text-xs text-muted-foreground max-w-xs">
                Explore our fine jewelry collection and find pieces crafted for your everyday story.
              </p>
              <button
                onClick={() => setCartOpen(false)}
                className="mt-6 rounded-lg bg-petrol px-6 py-2.5 eyebrow text-xs text-ivory hover:bg-charcoal"
              >
                Explore Jewelry
              </button>
            </div>
          ) : (
            items.map(({ p, qty }) => (
              <div key={p.id} className="flex gap-4 py-4">
                <img
                  src={p.image}
                  alt={p.name}
                  className="h-20 w-20 rounded-xl object-cover border border-border"
                />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <p className="font-serif text-base text-charcoal line-clamp-1">{p.name}</p>
                      <button
                        onClick={() => removeFromCart(p.id)}
                        className="text-muted-foreground hover:text-destructive p-1"
                        aria-label="Remove item"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <p className="text-xs text-gold capitalize">{p.category.replace("-", " ")}</p>
                    <p className="text-xs font-semibold text-petrol mt-0.5">{formatINR(p.price)}</p>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex h-7 items-center rounded-md border border-border bg-card">
                      <button
                        onClick={() => updateCartQty(p.id, qty - 1)}
                        className="grid h-7 w-7 place-items-center text-xs text-charcoal hover:text-petrol"
                      >
                        -
                      </button>
                      <span className="w-6 text-center text-xs font-medium">{qty}</span>
                      <button
                        onClick={() => updateCartQty(p.id, qty + 1)}
                        className="grid h-7 w-7 place-items-center text-xs text-charcoal hover:text-petrol"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-xs font-semibold text-charcoal">
                      {formatINR(p.price * qty)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer & Checkout Breakdown */}
        {items.length > 0 && (
          <div className="border-t border-border bg-card/60 p-6 space-y-4">
            {/* Promo Code Input */}
            <form onSubmit={handleApplyPromo} className="space-y-1.5">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Promo code (e.g. MARGA10)"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  className="h-9 flex-1 rounded-lg border border-border bg-ivory px-3 text-xs uppercase outline-none focus:border-gold"
                />
                <button
                  type="submit"
                  className="h-9 rounded-lg bg-petrol px-4 eyebrow text-[10px] text-ivory hover:bg-charcoal"
                >
                  Apply
                </button>
              </div>
              {promoMessage && (
                <p className={`text-xs ${promoMessage.ok ? "text-emerald-700" : "text-destructive"}`}>
                  {promoMessage.text}
                </p>
              )}
              {appliedCoupon && (
                <div className="flex items-center justify-between text-xs text-emerald-800 bg-emerald-50 rounded-lg p-2 border border-emerald-200">
                  <span>Applied: <strong>{appliedCoupon.code}</strong> ({appliedCoupon.description})</span>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-[11px] underline text-destructive"
                  >
                    Remove
                  </button>
                </div>
              )}
            </form>

            <div className="space-y-1.5 text-xs text-charcoal">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatINR(cartSubtotal)}</span>
              </div>
              {cartDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Discount</span>
                  <span>-{formatINR(cartDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Estimated Shipping</span>
                <span>{cartShipping === 0 ? "Free" : formatINR(cartShipping)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 text-base font-serif text-petrol font-semibold">
                <span>Total</span>
                <span>{formatINR(cartTotal)}</span>
              </div>
            </div>

            <button
              onClick={handleProceedToCheckout}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-petrol eyebrow text-ivory hover:bg-charcoal transition-colors shadow-md"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}

export function ProductCard({ p }: { p: Product }) {
  const { wishlist, toggleWish, addToCart, setQuickViewProduct } = useStore();
  const wished = wishlist.includes(p.id);

  return (
    <div className="group relative flex flex-col justify-between">
      <div>
        <div
          onClick={() => setQuickViewProduct(p)}
          className="relative aspect-[4/5] cursor-pointer overflow-hidden rounded-xl bg-muted"
        >
          <img
            src={p.image}
            alt={p.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {p.badge && (
            <span className="absolute left-2.5 top-2.5 rounded-full bg-butter px-2.5 py-0.5 eyebrow text-[9px] font-semibold text-petrol shadow-xs">
              {p.badge}
            </span>
          )}

          <button
            aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
            onClick={(e) => {
              e.stopPropagation();
              toggleWish(p.id);
            }}
            className="absolute right-2 top-2 grid h-10 w-10 place-items-center rounded-full bg-ivory/80 text-petrol hover:bg-ivory transition-colors"
          >
            <Heart
              size={18}
              strokeWidth={1.5}
              className={wished ? "fill-petrol text-petrol" : ""}
            />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              addToCart(p.id);
            }}
            className="absolute inset-x-0 bottom-0 h-11 bg-petrol eyebrow text-ivory opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
          >
            <ShoppingBag size={16} />
            Add to Bag
          </button>
        </div>

        <div className="mt-3 text-center">
          <p
            onClick={() => setQuickViewProduct(p)}
            className="cursor-pointer font-serif text-lg text-charcoal hover:text-petrol transition-colors line-clamp-1"
          >
            {p.name}
          </p>
          <div className="flex items-center justify-center gap-2 mt-0.5">
            <span className="text-sm font-medium text-petrol">{formatINR(p.price)}</span>
            {p.originalPrice && (
              <span className="text-xs text-muted-foreground line-through">
                {formatINR(p.originalPrice)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Footer() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      return setMsg({ ok: false, t: "Please enter a valid email address." });
    }
    setMsg({ ok: true, t: "Thank you for subscribing!" });
    setEmail("");
  };

  const col = "eyebrow mb-4 text-gold";
  const link = "block py-1.5 text-sm text-ivory/80 hover:text-butter transition-colors";

  return (
    <footer className="bg-petrol text-ivory">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-[1.2fr_1fr_1fr_1.6fr] md:px-8">
        <div>
          <Logo light className="h-20 w-auto" />
          <p className="mt-4 max-w-xs text-sm text-ivory/70 leading-relaxed">
            Everyday fine jewelry, designed to be worn, stacked, and loved for a lifetime.
          </p>
          <div className="mt-6 inline-block">
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 rounded-lg border border-gold/40 px-3 py-1 text-xs text-gold hover:bg-gold hover:text-petrol transition-colors"
            >
              <ShieldAlert size={14} /> Admin Portal
            </Link>
          </div>
        </div>

        <div>
          <p className={col}>Shop</p>
          <Link to="/shop" className={link}>All Jewelry</Link>
          <Link to="/collections" className={link}>Collections</Link>
          <Link to="/shop" search={{ category: "necklaces" }} className={link}>Necklaces</Link>
          <Link to="/shop" search={{ category: "earrings" }} className={link}>Earrings</Link>
          <Link to="/shop" search={{ category: "bracelets" }} className={link}>Bracelets</Link>
          <Link to="/shop" search={{ category: "rings" }} className={link}>Rings</Link>
        </div>

        <div>
          <p className={col}>Customer Care</p>
          <Link to="/account" className={link}>My Account & Orders</Link>
          <Link to="/contact" className={link}>Contact & Inquiries</Link>
          <Link to="/about" className={link}>Our Story</Link>
          <Link to="/contact" className={link}>Shipping & Hassle-Free Returns</Link>
        </div>

        <div>
          <p className={col}>Join our newsletter</p>
          <p className="mb-4 text-sm text-ivory/70">
            Exclusive releases, style edits, and stories, delivered directly to your inbox.
          </p>
          <form onSubmit={submit} noValidate className="flex w-full">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              aria-label="Email"
              className="h-12 min-w-0 flex-1 rounded-l-lg border border-ivory/30 bg-transparent px-4 text-sm text-ivory placeholder:text-ivory/50 outline-none focus:border-gold"
            />
            <button className="h-12 shrink-0 rounded-r-lg bg-butter px-5 eyebrow text-petrol hover:bg-gold transition-colors">
              Subscribe
            </button>
          </form>
          {msg && <p className={`mt-2 text-sm ${msg.ok ? "text-butter" : "text-gold"}`}>{msg.t}</p>}
          <div className="mt-6 flex gap-2">
            {[Instagram, Facebook, Youtube].map((I, i) => (
              <a
                key={i}
                href="#"
                aria-label="Social"
                className="grid h-11 w-11 place-items-center rounded-full border border-ivory/30 hover:border-gold hover:text-gold transition-colors"
              >
                <I size={18} strokeWidth={1.5} />
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-ivory/15 py-5 text-center text-xs text-ivory/60">
        © 2026 Marga Jewelry. All rights reserved.
      </div>
    </footer>
  );
}
