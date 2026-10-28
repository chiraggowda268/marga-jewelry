import { useState } from "react";
import {
  X,
  Heart,
  ShoppingBag,
  ShieldCheck,
  Truck,
  Sparkles,
  Check,
  Star,
  CheckCircle2,
  MessageSquare,
  ThumbsUp,
  Plus,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { formatINR } from "@/lib/db";
import { getProductReviews, type Review } from "@/lib/reviews-data";

export function ProductModal() {
  const { quickViewProduct, setQuickViewProduct, addToCart, wishlist, toggleWish } = useStore();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [selectedImg, setSelectedImg] = useState<string | null>(null);

  // Write Review State
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [newAuthor, setNewAuthor] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [customReviews, setCustomReviews] = useState<Record<string, Review[]>>({});
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  if (!quickViewProduct) return null;

  const p = quickViewProduct;
  const allImages = Array.from(new Set([p.image, ...(p.images || [])])).filter(Boolean);
  const activeImage = selectedImg && allImages.includes(selectedImg) ? selectedImg : p.image;
  const wished = wishlist.includes(p.id);
  const discountPercent =
    p.originalPrice && p.originalPrice > p.price
      ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
      : null;

  // Retrieve curated Indian customer reviews for this specific piece
  const baseReviews = getProductReviews(p);
  const userAddedReviews = customReviews[p.id] || [];
  const allProductReviews = [...userAddedReviews, ...baseReviews];
  const reviewsCount = allProductReviews.length;
  const averageRating = p.rating || 4.9;

  const handleAddToCart = () => {
    addToCart(p.id, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthor.trim() || !newComment.trim()) return;

    const newRev: Review = {
      id: `rev_usr_${Date.now()}`,
      author: newAuthor.trim(),
      rating: newRating,
      date: "Just now",
      comment: newComment.trim(),
      verified: true,
    };

    setCustomReviews((prev) => ({
      ...prev,
      [p.id]: [newRev, ...(prev[p.id] || [])],
    }));

    setNewAuthor("");
    setNewComment("");
    setNewRating(5);
    setIsWritingReview(false);
    setReviewSubmitted(true);
    setTimeout(() => setReviewSubmitted(false), 3500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/60 p-4 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={() => setQuickViewProduct(null)}
    >
      <div
        className="relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-ivory shadow-2xl no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          aria-label="Close modal"
          onClick={() => setQuickViewProduct(null)}
          className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-ivory/80 text-charcoal hover:bg-ivory hover:text-petrol transition-colors shadow-2xs"
        >
          <X size={20} />
        </button>

        {/* Top Product Showcase (Image & Details) */}
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
                      activeImage === imgUrl
                        ? "border-petrol ring-2 ring-gold/60 scale-105"
                        : "border-border hover:border-gold opacity-75 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`${p.name} angle ${i + 1}`}
                      className="h-full w-full object-cover"
                    />
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
                <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                  <Star size={13} className="text-amber-500 fill-amber-500" />
                  <span>{averageRating}</span>
                  <span>({reviewsCount} reviews)</span>
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

        {/* ============================================================== */}
        {/* CUSTOMER REVIEWS SECTION FOR EACH PRODUCT */}
        {/* ============================================================== */}
        <div className="border-t border-border bg-card/40 px-6 py-10 md:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-border/80">
            <div>
              <div className="flex items-center gap-2 eyebrow text-gold text-xs">
                <MessageSquare size={14} />
                <span>Customer Reviews</span>
              </div>
              <h3 className="font-serif text-2xl text-petrol mt-1">Loved by Our Community</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Authentic feedback from verified customers across India.
              </p>
            </div>

            {/* Rating Summary & Write Review Button */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-3 bg-ivory border border-border rounded-xl px-4 py-2.5 shadow-2xs">
                <div className="text-center pr-3 border-r border-border">
                  <span className="font-serif text-2xl font-bold text-petrol leading-none">
                    {averageRating}
                  </span>
                  <span className="text-[10px] text-muted-foreground block mt-0.5">out of 5</span>
                </div>
                <div>
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={14} className="fill-amber-500" />
                    ))}
                  </div>
                  <span className="text-[11px] text-muted-foreground block mt-0.5 font-medium">
                    {reviewsCount} verified reviews
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsWritingReview((prev) => !prev)}
                className="flex items-center gap-1.5 rounded-xl border border-petrol/30 bg-petrol px-4 py-2.5 eyebrow text-xs text-ivory hover:bg-charcoal transition-colors shadow-2xs"
              >
                <Plus size={14} />
                <span>{isWritingReview ? "Cancel" : "Write a Review"}</span>
              </button>
            </div>
          </div>

          {/* Feedback notification when review is submitted */}
          {reviewSubmitted && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200/80 p-3 text-xs text-emerald-800 animate-in fade-in">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>Thank you! Your verified review has been submitted and published below.</span>
            </div>
          )}

          {/* Interactive Write a Review Form */}
          {isWritingReview && (
            <form
              onSubmit={handleAddReview}
              className="mt-6 rounded-2xl border border-border bg-ivory p-6 shadow-sm animate-in slide-in-from-top-2 duration-150"
            >
              <h4 className="font-serif text-lg text-petrol">Share Your Experience</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Tell us how you style this piece and what you loved most.
              </p>

              <div className="mt-4 space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-charcoal">
                    Your Name (Indian name, e.g. Priya Sharma) *
                  </label>
                  <input
                    required
                    type="text"
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    placeholder="e.g. Ananya Rao"
                    className="h-10 w-full rounded-lg border border-input bg-card px-3 text-xs text-charcoal outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-charcoal">Rating *</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        className="p-1 hover:scale-110 transition-transform"
                        title={`${star} star`}
                      >
                        <Star
                          size={20}
                          className={`${
                            star <= newRating
                              ? "text-amber-500 fill-amber-500"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs text-muted-foreground ml-2 font-medium">
                      {newRating} / 5 Stars
                    </span>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-charcoal">Your Review *</label>
                  <textarea
                    required
                    rows={3}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Describe the quality, design, and how it pairs with your outfits..."
                    className="w-full rounded-lg border border-input bg-card p-3 text-xs text-charcoal outline-none focus:border-gold"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsWritingReview(false)}
                    className="rounded-lg border border-border px-4 py-2 eyebrow text-xs text-charcoal hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-petrol px-5 py-2 eyebrow text-xs text-ivory hover:bg-charcoal transition-colors shadow-2xs"
                  >
                    Post Review
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Reviews Grid (No Profile Photos, Clean Indian Name Typography) */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {allProductReviews.map((rev) => (
              <div
                key={rev.id}
                className="flex flex-col justify-between rounded-xl border border-border/80 bg-ivory p-4 shadow-2xs hover:border-gold/50 transition-all hover:shadow-xs"
              >
                <div>
                  {/* Review Header: Name & Verified Badge (NO profile photos) */}
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-serif text-sm font-semibold text-petrol tracking-tight">
                      {rev.author}
                    </p>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-800 border border-emerald-200/70 shrink-0">
                      <CheckCircle2 size={11} className="text-emerald-600" />
                      Verified Buyer
                    </span>
                  </div>

                  {/* Rating Stars & Relative Date */}
                  <div className="mt-1.5 flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={12}
                          className={
                            s <= Math.round(rev.rating)
                              ? "text-amber-500 fill-amber-500"
                              : "text-muted-foreground/30"
                          }
                        />
                      ))}
                    </div>
                    <span className="text-[11px] text-muted-foreground font-normal">{rev.date}</span>
                  </div>

                  {/* Review Text */}
                  <p className="mt-3 text-xs leading-relaxed text-charcoal/85 italic">
                    “{rev.comment.replace(/^["“”]|["“”]$/g, "")}”
                  </p>
                </div>

                {/* Card Footer: Verified Product Purchase Tag */}
                <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-[10px] text-muted-foreground">
                  <span className="truncate max-w-[200px]">Item: {p.name}</span>
                  <span className="flex items-center gap-1 text-muted-foreground/80">
                    <ThumbsUp size={11} className="text-gold/80" /> Helpful
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Trust Banner */}
          <div className="mt-8 rounded-xl border border-border/60 bg-ivory/60 p-4 text-center">
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
              <ShieldCheck size={15} className="text-gold" />
              <span>
                All reviews are collected from authentic buyers with confirmed orders. No compensated or sponsored ratings.
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
