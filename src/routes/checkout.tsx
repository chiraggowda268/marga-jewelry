import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, type FormEvent } from "react";
import {
  ShieldCheck,
  Truck,
  CheckCircle2,
  CreditCard,
  QrCode,
  Building2,
  Banknote,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  Lock,
  User as UserIcon,
  LogIn,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { formatINR, type Order } from "@/lib/db";
import { openRazorpayCheckout } from "@/lib/razorpay";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Marga Jewelry" },
      { name: "description", content: "Secure checkout for your Marga fine jewelry order." },
      { property: "og:title", content: "Checkout — Marga Jewelry" },
      { property: "og:description", content: "Secure checkout for Marga Jewelry." },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const {
    cart,
    products,
    currentUser,
    login,
    register,
    cartSubtotal,
    cartDiscount,
    cartShipping,
    cartTotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    createOrder,
  } = useStore();

  const navigate = useNavigate();

  // Auth sub-form states (if not logged in)
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authPhone, setAuthPhone] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  // Delivery & payment states
  const [name, setName] = useState(currentUser?.name ?? "");
  const [email, setEmail] = useState(currentUser?.email ?? "");
  const [phone, setPhone] = useState(currentUser?.phone ?? "");
  const [street, setStreet] = useState(currentUser?.address?.street ?? "");
  const [city, setCity] = useState(currentUser?.address?.city ?? "");
  const [state, setState] = useState(currentUser?.address?.state ?? "");
  const [pinCode, setPinCode] = useState(currentUser?.address?.pinCode ?? "");

  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">("razorpay");

  // Shipping policy:
  // Prepaid (Razorpay): 100% Free Shipping (₹0)
  // Cash on Delivery (COD): ₹50 extra delivery fee
  const deliveryCharge = paymentMethod === "cod" ? 50 : 0;
  const effectiveTotal = Math.max(0, cartSubtotal - cartDiscount + deliveryCharge);

  const [couponInput, setCouponInput] = useState("");
  const [couponMsg, setCouponMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const [placing, setPlacing] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Sync profile details when user logs in
  useEffect(() => {
    if (currentUser) {
      if (!name) setName(currentUser.name);
      if (!email) setEmail(currentUser.email);
      if (currentUser.phone && !phone) setPhone(currentUser.phone);
      if (currentUser.address) {
        if (!street) setStreet(currentUser.address.street);
        if (!city) setCity(currentUser.address.city);
        if (!state) setState(currentUser.address.state);
        if (!pinCode) setPinCode(currentUser.address.pinCode);
      }
    }
  }, [currentUser]);

  const cartItems = Object.entries(cart)
    .map(([id, qty]) => {
      const p = products.find((x) => x.id === id);
      return p ? { p, qty } : null;
    })
    .filter(Boolean) as { p: (typeof products)[0]; qty: number }[];

  const handleAuthLogin = (e: FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!authEmail.trim()) return setAuthError("Please enter your email.");
    const res = login(authEmail, authPassword);
    if (!res.success) setAuthError(res.error || "Login failed");
  };

  const handleAuthRegister = (e: FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!authName.trim() || !authEmail.trim()) {
      return setAuthError("Please provide your name and email.");
    }
    const res = register(authName, authEmail, authPassword, authPhone);
    if (!res.success) setAuthError(res.error || "Registration failed");
  };

  const handleApplyCoupon = (e: FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput.trim());
    setCouponMsg({ ok: res.success, text: res.message });
    if (res.success) setCouponInput("");
  };

  const handleSubmitOrder = (e: FormEvent) => {
    e.preventDefault();
    // STRICT GUARD: Must be logged in to order!
    if (!currentUser) {
      alert("Please sign in or create an account to place your order.");
      return;
    }
    if (cartItems.length === 0) return;

    setPlacing(true);

    const tempOrderId = `MG-${Math.floor(10000 + Math.random() * 90000)}`;

    // 1. RAZORPAY GATEWAY CHECKOUT
    if (paymentMethod === "razorpay") {
      openRazorpayCheckout({
        amountInINR: effectiveTotal,
        orderReference: tempOrderId,
        customerName: name.trim(),
        customerEmail: email.trim(),
        customerPhone: phone.trim(),
        onSuccess: (response) => {
          const order = createOrder({
            userId: currentUser.id,
            customerName: name.trim(),
            customerEmail: email.trim(),
            customerPhone: phone.trim(),
            shippingAddress: {
              street: street.trim(),
              city: city.trim(),
              state: state.trim(),
              pinCode: pinCode.trim(),
            },
            items: cartItems.map(({ p, qty }) => ({
              productId: p.id,
              name: p.name,
              price: p.price,
              quantity: qty,
              image: p.image,
            })),
            subtotal: cartSubtotal,
            discount: cartDiscount,
            shipping: deliveryCharge,
            total: effectiveTotal,
            paymentMethod: "razorpay",
            paymentStatus: "Paid",
            orderStatus: "Processing",
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
          });

          setConfirmedOrder(order);
          setPlacing(false);
        },
        onDismiss: () => {
          setPlacing(false);
        },
        onError: () => {
          setPlacing(false);
        },
      });
      return;
    }

    // 2. CASH ON DELIVERY (COD)
    setTimeout(() => {
      const order = createOrder({
        userId: currentUser.id,
        customerName: name.trim(),
        customerEmail: email.trim(),
        customerPhone: phone.trim(),
        shippingAddress: {
          street: street.trim(),
          city: city.trim(),
          state: state.trim(),
          pinCode: pinCode.trim(),
        },
        items: cartItems.map(({ p, qty }) => ({
          productId: p.id,
          name: p.name,
          price: p.price,
          quantity: qty,
          image: p.image,
        })),
        subtotal: cartSubtotal,
        discount: cartDiscount,
        shipping: deliveryCharge,
        total: effectiveTotal,
        paymentMethod: "cod",
        paymentStatus: "Pending",
        orderStatus: "Processing",
      });

      setConfirmedOrder(order);
      setPlacing(false);
    }, 800);
  };

  // SUCCESS CONFIRMATION SCREEN
  if (confirmedOrder) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-16 text-center animate-in fade-in duration-300">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-100 text-emerald-700 mb-6">
          <CheckCircle2 size={44} />
        </div>

        <p className="eyebrow text-gold">Thank You for Your Order</p>
        <h1 className="mt-2 font-serif text-3xl text-petrol md:text-4xl">Order Confirmed</h1>
        <p className="mt-2 text-sm text-charcoal/80">
          We have sent a receipt and delivery updates to <strong>{confirmedOrder.customerEmail}</strong>.
        </p>

        <div className="mt-8 rounded-2xl border border-border bg-card p-6 md:p-8 text-left shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
            <div>
              <p className="eyebrow text-gold text-xs">Reference Number</p>
              <p className="font-serif text-2xl text-petrol font-semibold mt-0.5">{confirmedOrder.id}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Amount Paid</p>
              <p className="font-serif text-xl text-petrol font-medium">{formatINR(confirmedOrder.total)}</p>
            </div>
          </div>

          <div className="py-4 space-y-3">
            <p className="text-xs eyebrow text-muted-foreground">Purchased Pieces</p>
            {confirmedOrder.items.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-14 w-14 rounded-lg object-cover border border-border"
                />
                <div className="flex-1">
                  <p className="font-serif text-base text-charcoal">{item.name}</p>
                  <p className="text-xs text-muted-foreground">Qty {item.quantity} · {formatINR(item.price)}</p>
                </div>
                <span className="text-xs font-semibold text-charcoal">{formatINR(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-4 text-xs text-charcoal/80 space-y-1">
            <p>
              <strong>Shipping Address: </strong>
              {confirmedOrder.shippingAddress.street}, {confirmedOrder.shippingAddress.city},{" "}
              {confirmedOrder.shippingAddress.state} - {confirmedOrder.shippingAddress.pinCode}
            </p>
            <p>
              <strong>Estimated Delivery: </strong> 3 to 5 business days with insured courier.
            </p>
            {confirmedOrder.razorpayPaymentId && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-50 p-2.5 text-xs text-emerald-800 border border-emerald-200">
                <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                <span>
                  Razorpay Payment Reference:{" "}
                  <code className="font-mono font-bold">{confirmedOrder.razorpayPaymentId}</code>
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            to="/account"
            className="rounded-lg bg-petrol px-6 py-3 eyebrow text-xs text-ivory hover:bg-charcoal transition-colors shadow-xs"
          >
            Track in My Account
          </Link>
          <Link
            to="/shop"
            className="rounded-lg border border-border bg-card px-6 py-3 eyebrow text-xs text-petrol hover:bg-muted transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </section>
    );
  }

  // EMPTY CART SCREEN
  if (cartItems.length === 0) {
    return (
      <section className="mx-auto max-w-lg px-4 py-20 text-center">
        <ShoppingBag size={52} strokeWidth={1} className="mx-auto text-muted-foreground/60 mb-4" />
        <h1 className="font-serif text-3xl text-petrol">Your Shopping Bag is Empty</h1>
        <p className="mt-2 text-xs text-muted-foreground">
          Select handcrafted jewelry pieces from our collection before proceeding to checkout.
        </p>
        <Link
          to="/shop"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-petrol px-6 py-3 eyebrow text-xs text-ivory hover:bg-charcoal transition-colors"
        >
          <span>Explore All Jewelry</span>
          <ArrowRight size={14} />
        </Link>
      </section>
    );
  }

  const inputStyle =
    "h-11 w-full rounded-lg border border-input bg-ivory px-3 text-sm text-charcoal outline-none focus:border-gold transition-colors";

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:py-8 md:px-8 md:py-12">
      <div className="mb-5 sm:mb-8">
        <p className="eyebrow text-xs text-gold uppercase tracking-wider">Final Step</p>
        <h1 className="font-serif text-2xl sm:text-3xl text-petrol md:text-4xl">Secure Checkout</h1>
      </div>

      <div className="grid gap-6 lg:gap-10 lg:grid-cols-12 items-start">
        {/* Left Column (7 Cols): Account Gate OR Shipping & Payment Form */}
        <div className="lg:col-span-7 space-y-6 sm:space-y-8">
          {/* ============================================================== */}
          {/* GATE: IF USER IS NOT LOGGED IN, REQUIRE LOGIN FIRST */}
          {/* ============================================================== */}
          {!currentUser ? (
            <div className="rounded-2xl border-2 border-gold/60 bg-card p-4 sm:p-6 md:p-8 shadow-md space-y-5 sm:space-y-6 animate-in fade-in duration-200">
              <div className="flex items-start gap-3 sm:gap-4 border-b border-border pb-4 sm:pb-5">
                <div className="grid h-10 w-10 sm:h-12 sm:w-12 shrink-0 place-items-center rounded-xl bg-butter text-petrol">
                  <Lock size={20} />
                </div>
                <div>
                  <h2 className="font-serif text-xl sm:text-2xl text-petrol">Sign In Required to Order</h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    To safeguard your fine jewelry purchase, manage delivery tracking, and provide order security, you must be signed in to complete your checkout.
                  </p>
                </div>
              </div>

              {/* In-page Login / Signup Tabs */}
              <div className="border border-border rounded-xl p-3.5 sm:p-5 bg-ivory/50">
                <div className="flex border-b border-border mb-4">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthTab("login");
                      setAuthError(null);
                    }}
                    className={`flex-1 pb-2.5 text-center eyebrow text-xs transition-colors ${
                      authTab === "login"
                        ? "border-b-2 border-petrol text-petrol font-semibold"
                        : "text-muted-foreground hover:text-charcoal"
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthTab("register");
                      setAuthError(null);
                    }}
                    className={`flex-1 pb-2.5 text-center eyebrow text-xs transition-colors ${
                      authTab === "register"
                        ? "border-b-2 border-petrol text-petrol font-semibold"
                        : "text-muted-foreground hover:text-charcoal"
                    }`}
                  >
                    Create Account
                  </button>
                </div>

                {authError && (
                  <div className="mb-4 rounded-lg bg-destructive/10 p-2.5 text-xs text-destructive">
                    {authError}
                  </div>
                )}

                {authTab === "login" ? (
                  <form onSubmit={handleAuthLogin} className="space-y-3">
                    <div>
                      <label className="mb-1 block text-xs eyebrow text-muted-foreground">Email Address</label>
                      <input
                        type="email"
                        required
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        placeholder="priya@example.com"
                        className={inputStyle}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs eyebrow text-muted-foreground">Password</label>
                      <input
                        type="password"
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        placeholder="••••••••"
                        className={inputStyle}
                      />
                    </div>
                    <button
                      type="submit"
                      className="h-11 w-full rounded-lg bg-petrol eyebrow text-xs text-ivory hover:bg-charcoal transition-colors shadow-xs"
                    >
                      Sign In & Continue Checkout
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleAuthRegister} className="space-y-3">
                    <div>
                      <label className="mb-1 block text-xs eyebrow text-muted-foreground">Full Name *</label>
                      <input
                        required
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        placeholder="Priya Sharma"
                        className={inputStyle}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs eyebrow text-muted-foreground">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        placeholder="priya@example.com"
                        className={inputStyle}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs eyebrow text-muted-foreground">Phone Number (Optional)</label>
                      <input
                        type="tel"
                        value={authPhone}
                        onChange={(e) => setAuthPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className={inputStyle}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs eyebrow text-muted-foreground">Password *</label>
                      <input
                        type="password"
                        required
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        placeholder="••••••••"
                        className={inputStyle}
                      />
                    </div>
                    <button
                      type="submit"
                      className="h-11 w-full rounded-lg bg-petrol eyebrow text-xs text-ivory hover:bg-charcoal transition-colors shadow-xs"
                    >
                      Create Account & Continue
                    </button>
                  </form>
                )}
              </div>
            </div>
          ) : (
            /* ============================================================== */
            /* LOGGED IN: SHIPPING & PAYMENT FORM */
            /* ============================================================== */
            <form id="checkout-form" onSubmit={handleSubmitOrder} className="space-y-8">
              {/* Logged in Badge */}
              <div className="flex items-center justify-between rounded-xl bg-butter/40 border border-gold/40 p-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="grid h-7 w-7 place-items-center rounded-full bg-petrol text-ivory font-bold text-[11px]">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="font-semibold text-petrol">Ordering as {currentUser.name}</span>
                    <span className="text-muted-foreground ml-1.5">({currentUser.email})</span>
                  </div>
                </div>
                <Link to="/account" className="underline text-petrol font-medium">
                  Switch Account
                </Link>
              </div>

              {/* 1. Customer & Shipping Address */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-2xs space-y-4">
                <h2 className="font-serif text-xl text-petrol flex items-center gap-2 border-b border-border pb-3">
                  <Truck size={18} className="text-gold" /> 1. Shipping Address
                </h2>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs eyebrow text-muted-foreground">Full Name *</label>
                    <input
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Priya Sharma"
                      className={inputStyle}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs eyebrow text-muted-foreground">Phone Number *</label>
                    <input
                      required
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className={inputStyle}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs eyebrow text-muted-foreground">Email Address (for order updates) *</label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="priya@example.com"
                    className={inputStyle}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs eyebrow text-muted-foreground">Street Address / House No. *</label>
                  <input
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="Flat 304, Green Heights, MG Road"
                    className={inputStyle}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-xs eyebrow text-muted-foreground">City *</label>
                    <input
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Mumbai"
                      className={inputStyle}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs eyebrow text-muted-foreground">State *</label>
                    <input
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="Maharashtra"
                      className={inputStyle}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs eyebrow text-muted-foreground">PIN Code *</label>
                    <input
                      required
                      value={pinCode}
                      onChange={(e) => setPinCode(e.target.value)}
                      placeholder="400001"
                      className={inputStyle}
                    />
                  </div>
                </div>
              </div>

              {/* 2. Payment Method */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-2xs space-y-4">
                <h2 className="font-serif text-xl text-petrol flex items-center gap-2 border-b border-border pb-3">
                  <ShieldCheck size={18} className="text-gold" /> 2. Payment Method
                </h2>

                <div className="space-y-3">
                  {/* Option 1: Razorpay Secure Gateway (Recommended) */}
                  <label
                    className={`flex cursor-pointer items-start gap-3.5 rounded-xl border-2 p-4 transition-all ${
                      paymentMethod === "razorpay"
                        ? "border-petrol bg-butter/30 shadow-xs"
                        : "border-border bg-ivory text-charcoal hover:border-gold"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "razorpay"}
                      onChange={() => setPaymentMethod("razorpay")}
                      className="mt-1 accent-petrol"
                    />
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-serif text-base font-semibold text-petrol">
                            Razorpay Secure Online Checkout
                          </span>
                          <span className="rounded-full bg-petrol px-2.5 py-0.5 text-[9px] font-bold text-ivory uppercase tracking-wider">
                            Instant & Verified
                          </span>
                        </div>
                      </div>
                      <p className="mt-1 text-xs text-charcoal/80">
                        Pay seamlessly via <strong>UPI</strong> (Google Pay, PhonePe, Paytm, BHIM), <strong>Credit / Debit Cards</strong> (Visa, Mastercard, RuPay), <strong>Net Banking</strong>, or <strong>EMI</strong>.
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
                        <span className="rounded bg-emerald-100 text-emerald-900 font-semibold px-2 py-0.5 border border-emerald-300">
                          ⚡ 100% FREE Delivery
                        </span>
                        <span className="rounded bg-card px-2 py-0.5 border border-border">⚡ Instant Approval</span>
                        <span className="rounded bg-card px-2 py-0.5 border border-border">🔒 RBI & Bank Encrypted</span>
                        <span className="rounded bg-card px-2 py-0.5 border border-border">0% Convenience Fee</span>
                      </div>
                    </div>
                  </label>

                  {/* Option 2: Cash on Delivery */}
                  <label
                    className={`flex cursor-pointer items-start gap-3.5 rounded-xl border p-4 transition-all ${
                      paymentMethod === "cod"
                        ? "border-petrol bg-butter/20 text-petrol shadow-xs"
                        : "border-border bg-ivory text-charcoal hover:border-gold"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                      className="mt-1 accent-petrol"
                    />
                    <Banknote size={20} className="text-petrol shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-charcoal">Cash on Delivery (COD)</p>
                        <span className="rounded-full bg-amber-100 text-amber-900 px-2 py-0.5 text-[10px] font-bold border border-amber-300">
                          +₹50 COD Fee
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Pay in cash or UPI at your doorstep. (Prepaid orders get 100% FREE delivery)
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Right Column (5 Cols): Order Summary & CTA */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sticky top-28 space-y-6">
            <h2 className="font-serif text-2xl text-petrol border-b border-border pb-4">
              Order Summary ({cartItems.length})
            </h2>

            {/* Items scroll */}
            <div className="max-h-64 overflow-y-auto space-y-3 pr-2 divide-y divide-border/60">
              {cartItems.map(({ p, qty }) => (
                <div key={p.id} className="flex gap-3 pt-3 first:pt-0">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="h-16 w-16 rounded-lg object-cover border border-border"
                  />
                  <div className="flex-1">
                    <p className="font-serif text-sm text-charcoal line-clamp-1">{p.name}</p>
                    <p className="text-xs text-muted-foreground">Qty: {qty}</p>
                    <p className="text-xs font-semibold text-petrol mt-1">{formatINR(p.price * qty)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Promo Code Box */}
            <div className="border-t border-border pt-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Coupon code"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="h-9 flex-1 rounded-lg border border-border bg-ivory px-3 text-xs uppercase outline-none focus:border-gold"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="h-9 rounded-lg bg-petrol px-4 eyebrow text-[10px] text-ivory hover:bg-charcoal transition-colors"
                >
                  Apply
                </button>
              </div>

              {couponMsg && (
                <p className={`mt-1.5 text-xs ${couponMsg.ok ? "text-emerald-700" : "text-destructive"}`}>
                  {couponMsg.text}
                </p>
              )}

              {appliedCoupon && (
                <div className="mt-2 flex items-center justify-between text-xs text-emerald-800 bg-emerald-50 rounded-lg p-2 border border-emerald-200">
                  <span>Applied: <strong>{appliedCoupon.code}</strong></span>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-[11px] underline text-destructive"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Totals Breakdown */}
            <div className="border-t border-border pt-4 space-y-2 text-xs text-charcoal">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatINR(cartSubtotal)}</span>
              </div>
              {cartDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Promo Discount</span>
                  <span>-{formatINR(cartDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>
                  {paymentMethod === "cod" ? "Cash on Delivery (COD) Charge" : "Insured Express Shipping"}
                </span>
                <span className={paymentMethod === "cod" ? "font-semibold text-charcoal" : "font-semibold text-emerald-700"}>
                  {deliveryCharge === 0 ? "FREE" : formatINR(deliveryCharge)}
                </span>
              </div>
              <div className="flex justify-between border-t border-border pt-3 text-lg font-serif text-petrol font-semibold">
                <span>Total Amount</span>
                <span>{formatINR(effectiveTotal)}</span>
              </div>
            </div>

            {/* Submit Button OR Sign-In Barrier */}
            {currentUser ? (
              <button
                type="submit"
                form="checkout-form"
                disabled={placing}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-petrol eyebrow text-ivory hover:bg-charcoal transition-colors shadow-md disabled:opacity-50"
              >
                {placing ? (
                  <span>Confirming Order...</span>
                ) : (
                  <>
                    <span>
                      {paymentMethod === "razorpay"
                        ? "Proceed to Pay with Razorpay"
                        : "Confirm Cash on Delivery"}{" "}
                      • {formatINR(effectiveTotal)}
                    </span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            ) : (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    const el = document.querySelector(".border-2.border-gold\\/60");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-gold/80 eyebrow text-charcoal hover:bg-gold transition-colors shadow-sm font-semibold"
                >
                  <Lock size={16} />
                  <span>Sign In Required to Order</span>
                </button>
                <p className="text-center text-[11px] text-muted-foreground">
                  Please sign in or create an account on the left to complete your order.
                </p>
              </div>
            )}

            {/* Guarantees */}
            <div className="pt-2 grid grid-cols-2 gap-2 text-[11px] text-muted-foreground border-t border-border">
              <div className="flex items-center gap-1.5">
                <Sparkles size={13} className="text-gold" />
                Anti-tarnish guarantee
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-gold" />
                256-bit encrypted checkout
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
