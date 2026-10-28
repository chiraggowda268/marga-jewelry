import { useState } from "react";
import { X, Heart, ShoppingBag, ShieldCheck, Truck, Sparkles, Check } from "lucide-react";
import { useStore } from "@/lib/store";
import { formatINR } from "@/lib/db";

export function ProductModal() {
  const { quickViewProduct, setQuickViewProduct, addToCart, wishlist, toggleWish } = useStore();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [selectedImg, setSelectedImg] = useState<string | null>(null);

  if (!quickViewProduct) return null;

  const p = quickViewProduct;
  const allImages = Array.from(new Set([p.image, ...(p.images || [])])).filter(Boolean);
  const activeImage = selectedImg && allImages.includes(selectedImg) ? selectedImg : p.image;
  const wished = wishlist.includes(p.id);
  const discountPercent =
    p.originalPrice && p.originalPrice > p.price
      ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
      : null;

  const handleAddToCart = () => {
    addToCart(p.id, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/60 p-4 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={() => setQuickViewProduct(null)}
    >
      <div
        className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-ivory shadow-2xl no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          aria-label="Close modal"
          onClick={() => setQuickViewProduct(null)}
          className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-ivory/80 text-charcoal hover:bg-ivory hover:text-petrol transition-colors"
        >
          <X size={20} />
        </button>

        <div className="grid md:grid-cols-2">
          {/* Image & Badges & Gallery */}
          <div className="flex flex-col bg-muted/30">
            <div className="relative aspect-square bg-muted">
              <img
                src={activeImage}
                alt={p.name}
                className="h-full w-full object-cover transition-opacity duration-200"
              />
              {p.badge && (
                <span className="absolute left-4 top-4 rounded-full bg-gold px-3 py-1 eyebrow text-[10px] text-charcoal shadow-sm">
                  {p.badge}
                </span>
              )}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-lg bg-ivory/90 p-3 text-xs text-charcoal backdrop-blur-xs">
                <span className="flex items-center gap-1.5 font-medium">
                  <Sparkles size={14} className="text-gold" />
                  Anti-Tarnish Plating
                </span>
                <span className="text-muted-foreground">Certified 18K</span>
              </div>
            </div>

            {/* Multiple Image Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex items-center gap-2 p-3 bg-ivory/60 border-t border-border overflow-x-auto no-scrollbar">
                {allImages.map((imgUrl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedImg(imgUrl)}
                    className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                      activeImage === imgUrl ? "border-petrol ring-2 ring-gold/60 scale-105" : "border-border hover:border-gold opacity-75 hover:opacity-100"
                    }`}
                  >
                    <img src={imgUrl} alt={`${p.name} angle ${i + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details & Actions */}
          <div className="flex flex-col justify-between p-6 md:p-8">
            <div>
              <div className="flex items-center justify-between">
                <span className="eyebrow text-gold">{p.category.replace("-", " ")}</span>
                <span className="text-xs text-muted-foreground">
                  ⭐ {p.rating} ({p.reviewsCount} reviews)
                </span>
              </div>

              <h2 className="mt-2 font-serif text-2xl text-petrol md:text-3xl">{p.name}</h2>

              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-2xl font-medium text-petrol">{formatINR(p.price)}</span>
                {p.originalPrice && (
                  <span className="text-sm text-muted-foreground line-through">
                    {formatINR(p.originalPrice)}
                  </span>
                )}
                {discountPercent && (
                  <span className="rounded-md bg-butter px-2 py-0.5 text-xs font-semibold text-petrol">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>

              <p className="mt-4 text-sm leading-relaxed text-charcoal/80">
                {p.description}
              </p>

              {p.material && (
                <div className="mt-4 rounded-lg border border-border bg-card/60 p-3 text-xs">
                  <span className="font-semibold text-petrol">Craftsmanship:</span>{" "}
                  <span className="text-charcoal/80">{p.material}</span>
                </div>
              )}

              {p.details && p.details.length > 0 && (
                <ul className="mt-4 space-y-1.5 text-xs text-charcoal/80">
                  {p.details.map((d, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                      {d}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Quantity and CTA */}
            <div className="mt-8 border-t border-border pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-11 items-center rounded-lg border border-border bg-card px-2">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="grid h-8 w-8 place-items-center text-charcoal hover:text-petrol"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-sm font-medium">{qty}</span>
                  <button
                    onClick={() => setQty((q) => q + 1)}
                    className="grid h-8 w-8 place-items-center text-charcoal hover:text-petrol"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={p.stock <= 0}
                  className="flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-petrol eyebrow text-ivory hover:bg-charcoal transition-colors disabled:opacity-50"
                >
                  {added ? (
                    <>
                      <Check size={18} className="text-butter" />
                      Added to Bag!
                    </>
                  ) : p.stock <= 0 ? (
                    "Out of Stock"
                  ) : (
                    <>
                      <ShoppingBag size={18} />
                      Add to Bag
                    </>
                  )}
                </button>

                <button
                  onClick={() => toggleWish(p.id)}
                  aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-border bg-card text-petrol hover:border-gold transition-colors"
                >
                  <Heart size={20} strokeWidth={1.5} className={wished ? "fill-petrol text-petrol" : ""} />
                </button>
              </div>

              {/* Guarantees */}
              <div className="mt-6 grid grid-cols-2 gap-2 border-t border-border pt-4 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Truck size={14} className="text-gold" />
                  Free delivery over ₹2,499
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-gold" />
                  Certified authenticity
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
