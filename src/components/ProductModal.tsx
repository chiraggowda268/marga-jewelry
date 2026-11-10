import { useState, useEffect, useRef } from "react";
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
  Pencil,
  UploadCloud,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Image as ImageIcon,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { formatINR } from "@/lib/db";
import {
  getProductReviews,
  canCustomerEditReview,
  registerAuthoredReview,
  type Review,
} from "@/lib/reviews-data";
import { processMultipleImageFiles } from "@/lib/image-upload";

export function ProductModal() {
  const {
    products,
    quickViewProduct,
    setQuickViewProduct,
    addToCart,
    wishlist,
    toggleWish,
    addReview,
    updateReview,
    currentUser,
  } = useStore();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  // Smooth Slider & Swipe State
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchDeltaX, setTouchDeltaX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const thumbnailsRef = useRef<HTMLDivElement | null>(null);

  // Product Photo Fullscreen Lightbox / Zoom State
  const [enlargedPhotoIndex, setEnlargedPhotoIndex] = useState<number | null>(null);
  const [enlargedTouchStartX, setEnlargedTouchStartX] = useState<number | null>(null);
  const [enlargedTouchDeltaX, setEnlargedTouchDeltaX] = useState(0);

  // Reviews Tray Ref
  const reviewsTrayRef = useRef<HTMLDivElement | null>(null);

  // Write & Edit Review State
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [newAuthor, setNewAuthor] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [reviewPhotos, setReviewPhotos] = useState<string[]>([]);
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewSuccessMessage, setReviewSuccessMessage] = useState("Thank you! Your verified review has been published.");
  const [, setLocalAuthoredCount] = useState(0);

  // Photo Lightbox State for reviewing user wear photos
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const hasHydratedUrlOnMountRef = useRef(false);

  // 1. Deep-link hydration: if URL contains ?product= on direct initial load, open that product (runs only once)
  useEffect(() => {
    if (typeof window === "undefined" || hasHydratedUrlOnMountRef.current) return;
    hasHydratedUrlOnMountRef.current = true;
    const url = new URL(window.location.href);
    const productParam = url.searchParams.get("product");
    if (productParam && products.length > 0) {
      const match = products.find(
        (item) => item.id === productParam || item.slug === productParam
      );
      if (match) {
        setQuickViewProduct(match);
      }
    }
  }, [products, setQuickViewProduct]);

  // 2. Distinct product URL and browser history sync
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);

    if (quickViewProduct) {
      const productParam = quickViewProduct.slug || quickViewProduct.id;
      if (url.searchParams.get("product") !== productParam) {
        url.searchParams.set("product", productParam);
        // Push a distinct history entry so the browser Back button exits the product!
        window.history.pushState(
          { modalProduct: quickViewProduct.id },
          "",
          url.pathname + "?" + url.searchParams.toString()
        );
      }
    }
  }, [quickViewProduct]);

  // 3. Browser Back / Forward buttons listener to cleanly exit the product modal
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handlePopState = () => {
      const url = new URL(window.location.href);
      const productParam = url.searchParams.get("product");

      if (!productParam) {
        // User clicked browser Back to exit product view!
        setQuickViewProduct(null);
      } else {
        const match = products.find(
          (item) => item.id === productParam || item.slug === productParam
        );
        if (match) {
          setQuickViewProduct(match);
        } else {
          setQuickViewProduct(null);
        }
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [products, setQuickViewProduct]);

  // 4. Reset active image index when product changes
  useEffect(() => {
    setActiveImgIndex(0);
  }, [quickViewProduct?.id]);

  // 5. Auto-scroll active thumbnail into view
  useEffect(() => {
    if (thumbnailsRef.current) {
      const activeThumb = thumbnailsRef.current.children[activeImgIndex] as HTMLElement | undefined;
      if (activeThumb && typeof activeThumb.scrollIntoView === "function") {
        activeThumb.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }
  }, [activeImgIndex]);

  // Instant and clean close handler for 'X' button or backdrop click
  const handleCloseModal = () => {
    hasHydratedUrlOnMountRef.current = true;
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (url.searchParams.has("product")) {
        url.searchParams.delete("product");
        const cleanPath = url.pathname + (url.search ? url.search : "");
        window.history.replaceState({}, "", cleanPath);
      }
    }
    setQuickViewProduct(null);
  };

  const allImages = quickViewProduct
    ? Array.from(new Set([quickViewProduct.image, ...(quickViewProduct.images || [])])).filter(Boolean)
    : [];

  const handlePrevImage = () => {
    if (allImages.length <= 1) return;
    setActiveImgIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
  };

  const handleNextImage = () => {
    if (allImages.length <= 1) return;
    setActiveImgIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (allImages.length <= 1) return;
    const touch = e.touches[0];
    if (!touch) return;
    setTouchStartX(touch.clientX);
    setTouchDeltaX(0);
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX === null || allImages.length <= 1) return;
    const touch = e.touches[0];
    if (!touch) return;
    const currentX = touch.clientX;
    setTouchDeltaX(currentX - touchStartX);
  };

  const handleTouchEnd = () => {
    if (!isSwiping || touchStartX === null) return;
    const threshold = 40; // 40px drag threshold to trigger slide
    if (touchDeltaX < -threshold) {
      handleNextImage();
    } else if (touchDeltaX > threshold) {
      handlePrevImage();
    }
    setTouchStartX(null);
    setTouchDeltaX(0);
    setIsSwiping(false);
  };

  // Keyboard navigation for image slider (Left/Right), enlarged photo lightbox, and modal close (Escape)
  useEffect(() => {
    if (!quickViewProduct) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      // If full-screen enlarged photo is open, control its navigation
      if (enlargedPhotoIndex !== null) {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          setEnlargedPhotoIndex((prev) =>
            prev !== null && prev > 0 ? prev - 1 : allImages.length - 1
          );
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          setEnlargedPhotoIndex((prev) =>
            prev !== null && prev < allImages.length - 1 ? prev + 1 : 0
          );
        } else if (e.key === "Escape") {
          e.preventDefault();
          setEnlargedPhotoIndex(null);
        }
        return;
      }

      if (e.key === "ArrowLeft") {
        handlePrevImage();
      } else if (e.key === "ArrowRight") {
        handleNextImage();
      } else if (e.key === "Escape") {
        handleCloseModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [quickViewProduct, allImages.length, enlargedPhotoIndex]);

  // Scroll controls for reviews tray
  const handleScrollReviewsTray = (dir: "left" | "right") => {
    if (!reviewsTrayRef.current) return;
    const scrollAmount = Math.min(reviewsTrayRef.current.clientWidth * 0.85, 360);
    reviewsTrayRef.current.scrollBy({
      left: dir === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (!quickViewProduct) return null;

  const p = quickViewProduct;
  const wished = wishlist.includes(p.id);
  const discountPercent =
    p.originalPrice && p.originalPrice > p.price
      ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
      : null;

  // Retrieve curated customer reviews for this specific piece
  const allProductReviews = getProductReviews(p);
  const reviewsCount = allProductReviews.length;
  const averageRating = p.rating || 4.9;

  const handleAddToCart = () => {
    addToCart(p.id, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const handleStartEditReview = (rev: Review) => {
    // Only original poster on their device/account can edit their review
    if (!canCustomerEditReview(rev, currentUser?.id)) return;
    setEditingReviewId(rev.id);
    setNewAuthor(rev.author);
    setNewRating(Math.round(rev.rating) || 5);
    setNewComment(rev.comment);
    setReviewPhotos(rev.images ? [...rev.images] : []);
    setIsWritingReview(true);
  };

  const handleCancelReviewForm = () => {
    setIsWritingReview(false);
    setEditingReviewId(null);
    setNewAuthor("");
    setNewComment("");
    setNewRating(5);
    setReviewPhotos([]);
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthor.trim() || !newComment.trim()) return;

    if (editingReviewId) {
      const existing = allProductReviews.find((r) => r.id === editingReviewId);
      if (!existing || !canCustomerEditReview(existing, currentUser?.id)) {
        handleCancelReviewForm();
        return;
      }
      updateReview(p.id, editingReviewId, {
        author: newAuthor.trim(),
        rating: newRating,
        comment: newComment.trim(),
        images: reviewPhotos.length > 0 ? reviewPhotos : undefined,
      });
      setReviewSuccessMessage("Thank you! Your review has been updated successfully.");
    } else {
      const createdRev = addReview(p.id, {
        author: newAuthor.trim(),
        rating: newRating,
        date: "Just now",
        comment: newComment.trim(),
        verified: true,
        images: reviewPhotos.length > 0 ? reviewPhotos : undefined,
        userId: currentUser?.id,
        isCurated: false,
      });
      // Register authored review token so this customer (and only this customer) can edit their review later
      registerAuthoredReview(createdRev.id, createdRev.authorToken);
      setLocalAuthoredCount((c) => c + 1);
      setReviewSuccessMessage("Thank you! Your verified review has been published.");
    }

    setNewAuthor("");
    setNewComment("");
    setNewRating(5);
    setReviewPhotos([]);
    setEditingReviewId(null);
    setIsWritingReview(false);
    setReviewSubmitted(true);
    setTimeout(() => setReviewSubmitted(false), 3500);
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/60 p-0 sm:p-4 backdrop-blur-xs animate-in fade-in duration-200"
        onClick={handleCloseModal}
      >
        <div
          className="relative h-[100dvh] sm:h-auto sm:max-h-[92vh] w-full max-w-4xl rounded-none sm:rounded-2xl bg-ivory shadow-2xl overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button with high z-index and click-through prevention */}
          <button
            type="button"
            aria-label="Close product view"
            onClick={(e) => {
              e.stopPropagation();
              handleCloseModal();
            }}
            className="absolute right-3 top-3 sm:right-4 sm:top-4 z-40 grid h-10 w-10 place-items-center rounded-full bg-ivory/95 text-charcoal hover:bg-petrol hover:text-ivory transition-all shadow-md cursor-pointer border border-border/70"
          >
            <X size={20} />
          </button>

          {/* Scrollable Modal Content: Top Showcase + Reviews */}
          <div className="flex-1 overflow-y-auto no-scrollbar">
            {/* Top Product Showcase (Image & Details) */}
            <div className="grid md:grid-cols-2">
            {/* Image & Badges & Smooth Slider */}
            <div className="flex flex-col bg-muted/30">
              <div
                className="group relative aspect-square overflow-hidden bg-muted select-none touch-pan-y cursor-zoom-in"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onClick={() => {
                  if (Math.abs(touchDeltaX) < 8) {
                    setEnlargedPhotoIndex(activeImgIndex);
                  }
                }}
                title="Click to view photo enlarged"
              >
                {/* Smooth Carousel Track */}
                <div
                  className="flex h-full w-full transition-transform duration-300 ease-out"
                  style={{
                    transform: `translateX(calc(-${activeImgIndex * 100}% + ${isSwiping ? touchDeltaX : 0}px))`,
                    transitionDuration: isSwiping ? "0ms" : "320ms",
                  }}
                >
                  {allImages.map((imgUrl, idx) => (
                    <div key={idx} className="relative h-full w-full shrink-0">
                      <img
                        src={imgUrl}
                        alt={`${p.name} photo ${idx + 1}`}
                        className="h-full w-full object-cover pointer-events-none select-none"
                        draggable={false}
                      />
                    </div>
                  ))}
                </div>

                {/* Left/Right Floating Navigation Chevron Buttons */}
                {allImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      aria-label="Previous image"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrevImage();
                      }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-10 grid h-10 w-10 place-items-center rounded-full bg-ivory/85 text-charcoal shadow-md backdrop-blur-md hover:bg-petrol hover:text-ivory hover:scale-105 active:scale-95 transition-all focus:outline-none"
                    >
                      <ChevronLeft size={20} strokeWidth={2.2} />
                    </button>
                    <button
                      type="button"
                      aria-label="Next image"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNextImage();
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-10 grid h-10 w-10 place-items-center rounded-full bg-ivory/85 text-charcoal shadow-md backdrop-blur-md hover:bg-petrol hover:text-ivory hover:scale-105 active:scale-95 transition-all focus:outline-none"
                    >
                      <ChevronRight size={20} strokeWidth={2.2} />
                    </button>
                  </>
                )}

                {/* Badge (e.g. Best Seller / New) */}
                {p.badge && (
                  <span className="absolute left-4 top-4 rounded-full bg-gold px-3 py-1 eyebrow text-[10px] text-charcoal shadow-sm z-10">
                    {p.badge}
                  </span>
                )}

                {/* Slide Counter Pill (if multiple images) */}
                {allImages.length > 1 && (
                  <div className="absolute top-4 right-14 z-10 flex items-center gap-1.5 rounded-full bg-charcoal/70 px-2.5 py-1 text-[11px] font-medium text-ivory backdrop-blur-xs shadow-xs">
                    <span>{activeImgIndex + 1}</span>
                    <span className="opacity-60">/</span>
                    <span className="opacity-80">{allImages.length}</span>
                  </div>
                )}

                {/* Floating Zoom / Enlarge Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEnlargedPhotoIndex(activeImgIndex);
                  }}
                  aria-label="Enlarge product photo"
                  className="absolute bottom-16 right-4 z-10 flex items-center gap-1.5 rounded-full bg-charcoal/75 hover:bg-petrol text-ivory px-3 py-1.5 text-xs font-medium backdrop-blur-md shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <Maximize2 size={13} />
                  <span>Zoom</span>
                </button>

                {/* Bottom Anti-tarnish trust pill */}
                <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between rounded-lg bg-ivory/90 p-3 text-xs text-charcoal backdrop-blur-xs shadow-xs">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Sparkles size={14} className="text-gold" />
                    Anti-Tarnish Plating
                  </span>
                  <span className="text-muted-foreground font-normal">Certified 18K</span>
                </div>
              </div>

              {/* Multiple Image Thumbnails with Active Highlighting & Click */}
              {allImages.length > 1 && (
                <div
                  ref={thumbnailsRef}
                  className="flex items-center gap-2 p-3 bg-ivory/60 border-t border-border overflow-x-auto no-scrollbar scroll-smooth"
                >
                  {allImages.map((imgUrl, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveImgIndex(i)}
                      className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                        activeImgIndex === i
                          ? "border-petrol ring-2 ring-gold/70 scale-105 shadow-xs"
                          : "border-border hover:border-gold opacity-70 hover:opacity-100"
                      }`}
                      aria-label={`View photo ${i + 1}`}
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

              {/* Rating Summary, Tray Controls & Write Review Button */}
              <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
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

                {/* Reviews Tray Left/Right Navigation Chevrons */}
                <div className="flex items-center gap-1 bg-ivory border border-border/80 rounded-xl p-1 shadow-2xs">
                  <button
                    type="button"
                    aria-label="Previous reviews in tray"
                    onClick={() => handleScrollReviewsTray("left")}
                    className="grid h-8 w-8 place-items-center rounded-lg text-charcoal hover:bg-petrol hover:text-ivory transition-all active:scale-95 cursor-pointer"
                    title="Slide left"
                  >
                    <ChevronLeft size={17} />
                  </button>
                  <span className="text-[10px] font-medium text-muted-foreground px-1.5 border-x border-border/60 select-none">
                    Tray
                  </span>
                  <button
                    type="button"
                    aria-label="Next reviews in tray"
                    onClick={() => handleScrollReviewsTray("right")}
                    className="grid h-8 w-8 place-items-center rounded-lg text-charcoal hover:bg-petrol hover:text-ivory transition-all active:scale-95 cursor-pointer"
                    title="Slide right"
                  >
                    <ChevronRight size={17} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (isWritingReview) {
                      handleCancelReviewForm();
                    } else {
                      setIsWritingReview(true);
                    }
                  }}
                  className="flex items-center gap-1.5 rounded-xl border border-petrol/30 bg-petrol px-4 py-2.5 eyebrow text-xs text-ivory hover:bg-charcoal transition-colors shadow-2xs cursor-pointer"
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
                <span>{reviewSuccessMessage}</span>
              </div>
            )}

            {/* Interactive Write a Review Form */}
            {isWritingReview && (
              <form
                onSubmit={handleAddReview}
                className="mt-6 rounded-2xl border border-border bg-ivory p-6 shadow-sm animate-in slide-in-from-top-2 duration-150"
              >
                <h4 className="font-serif text-lg text-petrol">
                  {editingReviewId ? "Edit Your Review" : "Share Your Experience"}
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {editingReviewId
                    ? "Update your review, rating, or styling photos."
                    : "Tell us how you style this piece and what you loved most."}
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

                  {/* Photo Upload for Review */}
                  <div>
                    <label className="mb-1 block text-xs font-medium text-charcoal">
                      Upload Photos (Optional wear & styling photos)
                    </label>
                    <label className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-input bg-card px-3 text-xs text-muted-foreground hover:border-gold hover:text-charcoal transition-colors">
                      <UploadCloud size={16} />
                      <span>{isUploadingPhotos ? "Optimizing Photos..." : "Upload Photos From Local Computer"}</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*,.heic,.HEIC,.jpg,.jpeg,.png,.webp,.jfif,.avif"
                        className="hidden"
                        onChange={async (e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            setIsUploadingPhotos(true);
                            try {
                              const urls = await processMultipleImageFiles(e.target.files);
                              setReviewPhotos((prev) => [...prev, ...urls]);
                            } catch (err) {
                              console.error("Failed to upload photos:", err);
                            } finally {
                              setIsUploadingPhotos(false);
                            }
                          }
                        }}
                      />
                    </label>

                    {reviewPhotos.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        {reviewPhotos.map((imgUrl, i) => (
                          <div key={i} className="relative h-14 w-14 rounded-lg overflow-hidden border border-border group">
                            <img src={imgUrl} alt="Review upload preview" className="h-full w-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setReviewPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                              className="absolute top-1 right-1 grid h-5 w-5 place-items-center rounded-full bg-charcoal/80 text-ivory text-[10px] hover:bg-destructive transition-colors"
                              title="Remove photo"
                            >
                              <X size={10} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleCancelReviewForm}
                      className="rounded-lg border border-border px-4 py-2 eyebrow text-xs text-charcoal hover:bg-muted"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isUploadingPhotos}
                      className="rounded-lg bg-petrol px-5 py-2 eyebrow text-xs text-ivory hover:bg-charcoal transition-colors shadow-2xs disabled:opacity-50"
                    >
                      {editingReviewId ? "Update Review" : "Post Review"}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Reviews Horizontal Tray (Snap Slider instead of long vertical scrolling list) */}
            <div
              ref={reviewsTrayRef}
              className="mt-6 flex gap-4 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-2 px-1 focus:outline-none"
              tabIndex={0}
            >
              {allProductReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="w-[85vw] sm:w-[320px] md:w-[360px] shrink-0 snap-start flex flex-col justify-between rounded-2xl border border-border/80 bg-ivory p-5 shadow-2xs hover:border-gold/50 transition-all hover:shadow-xs"
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
                    <p className="mt-3 text-xs leading-relaxed text-charcoal/85 italic line-clamp-4">
                      “{rev.comment.replace(/^["“”]|["“”]$/g, "")}”
                    </p>

                    {/* Customer Review Photos (if any) */}
                    {rev.images && rev.images.length > 0 && (
                      <div className="mt-3 pt-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
                        {rev.images.map((photoUrl, pIdx) => (
                          <button
                            key={pIdx}
                            type="button"
                            onClick={() => setLightboxImg(photoUrl)}
                            className="relative h-14 w-14 sm:h-16 sm:w-16 shrink-0 overflow-hidden rounded-lg border border-border shadow-2xs hover:scale-105 hover:border-gold transition-all cursor-pointer"
                            title="Click to zoom customer wear photo"
                          >
                            <img
                              src={photoUrl}
                              alt={`${rev.author} jewelry review photo ${pIdx + 1}`}
                              className="h-full w-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Footer: Verified Product Purchase Tag & Original Poster Edit Action */}
                  <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-[10px] text-muted-foreground">
                    <span className="truncate max-w-[150px] sm:max-w-[180px]">Item: {p.name}</span>
                    <div className="flex items-center gap-3">
                      {canCustomerEditReview(rev, currentUser?.id) && (
                        <button
                          type="button"
                          onClick={() => handleStartEditReview(rev)}
                          className="flex items-center gap-1 font-medium text-petrol hover:text-gold transition-colors cursor-pointer"
                          title="Edit your review"
                        >
                          <Pencil size={11} /> Edit
                        </button>
                      )}
                      <span className="flex items-center gap-1 text-muted-foreground/80">
                        <ThumbsUp size={11} className="text-gold/80" /> Helpful
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tray Swipe & Explore Hint */}
            <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground px-1">
              <span className="flex items-center gap-1.5 font-medium text-petrol">
                <Sparkles size={12} className="text-gold" />
                <span>Showing all {reviewsCount} reviews • Swipe or use arrows to view</span>
              </span>
              <span className="hidden sm:inline-block">Authentic Community Ratings</span>
            </div>

            {/* Bottom Trust Banner */}
            <div className="mt-6 rounded-xl border border-border/60 bg-ivory/60 p-4 text-center">
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
                <ShieldCheck size={15} className="text-gold" />
                <span>
                  All reviews are collected from authentic buyers with confirmed orders. No compensated or sponsored ratings.
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* FIXED BOTTOM ACTION BAR: ALWAYS VISIBLE - NEVER SCROLL TO BUY */}
        {/* ============================================================== */}
          <div className="sticky bottom-0 z-30 shrink-0 border-t border-border bg-ivory/95 backdrop-blur-md px-4 py-3 sm:px-8 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
            <div className="mx-auto flex items-center justify-between gap-3">
              {/* Product Price & Discount preview */}
              <div className="flex flex-col shrink-0">
                <span className="font-serif text-lg sm:text-xl font-medium text-petrol leading-tight">
                  {formatINR(p.price * qty)}
                </span>
                {p.originalPrice && (
                  <span className="text-[11px] text-muted-foreground line-through leading-tight">
                    {formatINR(p.originalPrice * qty)}
                  </span>
                )}
              </div>

              {/* Quantity selector, Add to Bag, and Wishlist */}
              <div className="flex flex-1 sm:flex-initial items-center justify-end gap-2 sm:gap-3">
                {/* Quantity */}
                <div className="flex h-10 sm:h-11 items-center rounded-lg border border-border bg-card px-1.5 sm:px-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="grid h-7 w-7 sm:h-8 sm:w-8 place-items-center text-charcoal hover:text-petrol font-medium text-base select-none"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="w-6 sm:w-8 text-center text-xs sm:text-sm font-medium">{qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty((q) => q + 1)}
                    className="grid h-7 w-7 sm:h-8 sm:w-8 place-items-center text-charcoal hover:text-petrol font-medium text-base select-none"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                {/* Add to Bag CTA Button */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={p.stock <= 0}
                  className="flex h-10 sm:h-11 flex-1 sm:w-56 items-center justify-center gap-2 rounded-lg bg-petrol eyebrow text-xs sm:text-sm text-ivory hover:bg-charcoal transition-all shadow-md active:scale-98 disabled:opacity-50 shrink-0"
                >
                  {added ? (
                    <>
                      <Check size={16} className="text-butter" />
                      Added to Bag!
                    </>
                  ) : p.stock <= 0 ? (
                    "Out of Stock"
                  ) : (
                    <>
                      <ShoppingBag size={16} />
                      Add to Bag
                    </>
                  )}
                </button>

                {/* Wishlist Button */}
                <button
                  type="button"
                  onClick={() => toggleWish(p.id)}
                  aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
                  className="grid h-10 w-10 sm:h-11 sm:w-11 place-items-center rounded-lg border border-border bg-card text-petrol hover:border-gold hover:text-gold transition-colors shrink-0"
                >
                  <Heart
                    size={18}
                    strokeWidth={1.5}
                    className={wished ? "fill-petrol text-petrol" : ""}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen High-Resolution Product Photo Lightbox */}
      {enlargedPhotoIndex !== null && allImages[enlargedPhotoIndex] && (
        <div
          className="fixed inset-0 z-70 flex flex-col justify-between bg-charcoal/95 backdrop-blur-md p-3 sm:p-6 animate-in fade-in duration-200 select-none"
          onClick={() => setEnlargedPhotoIndex(null)}
        >
          {/* Top Header Bar */}
          <div
            className="flex items-center justify-between z-10 w-full max-w-6xl mx-auto py-1"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="font-serif text-ivory text-base sm:text-lg font-medium truncate max-w-[200px] sm:max-w-md">
                {p.name}
              </span>
              <span className="rounded-full bg-ivory/15 px-2.5 py-0.5 text-xs text-butter font-medium border border-ivory/10">
                {enlargedPhotoIndex + 1} / {allImages.length}
              </span>
            </div>

            <button
              type="button"
              aria-label="Close enlarged photo"
              onClick={() => setEnlargedPhotoIndex(null)}
              className="grid h-10 w-10 place-items-center rounded-full bg-ivory/10 text-ivory hover:bg-gold hover:text-charcoal transition-all shadow-md cursor-pointer border border-ivory/20"
            >
              <X size={20} />
            </button>
          </div>

          {/* Center Stage: Photo with Prev/Next controls & Touch Gestures */}
          <div
            className="relative flex-1 flex items-center justify-center my-2 overflow-hidden w-full max-w-6xl mx-auto"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => {
              const touch = e.touches[0];
              if (touch) {
                setEnlargedTouchStartX(touch.clientX);
                setEnlargedTouchDeltaX(0);
              }
            }}
            onTouchMove={(e) => {
              const touch = e.touches[0];
              if (touch && enlargedTouchStartX !== null) {
                setEnlargedTouchDeltaX(touch.clientX - enlargedTouchStartX);
              }
            }}
            onTouchEnd={() => {
              if (enlargedTouchStartX !== null) {
                if (enlargedTouchDeltaX < -40) {
                  // Next photo
                  setEnlargedPhotoIndex((prev) =>
                    prev !== null && prev < allImages.length - 1 ? prev + 1 : 0
                  );
                } else if (enlargedTouchDeltaX > 40) {
                  // Previous photo
                  setEnlargedPhotoIndex((prev) =>
                    prev !== null && prev > 0 ? prev - 1 : allImages.length - 1
                  );
                }
              }
              setEnlargedTouchStartX(null);
              setEnlargedTouchDeltaX(0);
            }}
          >
            {/* Previous Photo Button */}
            {allImages.length > 1 && (
              <button
                type="button"
                aria-label="Previous photo"
                onClick={() =>
                  setEnlargedPhotoIndex((prev) =>
                    prev !== null && prev > 0 ? prev - 1 : allImages.length - 1
                  )
                }
                className="absolute left-2 sm:left-4 z-20 grid h-12 w-12 place-items-center rounded-full bg-ivory/20 text-ivory hover:bg-gold hover:text-charcoal backdrop-blur-md shadow-lg transition-all hover:scale-110 active:scale-95 cursor-pointer"
              >
                <ChevronLeft size={26} strokeWidth={2.2} />
              </button>
            )}

            {/* High-Resolution Enlarged Image */}
            <img
              src={allImages[enlargedPhotoIndex]}
              alt={`${p.name} high-res view ${enlargedPhotoIndex + 1}`}
              className="max-h-[72vh] sm:max-h-[78vh] max-w-[92vw] sm:max-w-4xl object-contain rounded-2xl shadow-2xl transition-all duration-300 pointer-events-none"
              draggable={false}
            />

            {/* Next Photo Button */}
            {allImages.length > 1 && (
              <button
                type="button"
                aria-label="Next photo"
                onClick={() =>
                  setEnlargedPhotoIndex((prev) =>
                    prev !== null && prev < allImages.length - 1 ? prev + 1 : 0
                  )
                }
                className="absolute right-2 sm:right-4 z-20 grid h-12 w-12 place-items-center rounded-full bg-ivory/20 text-ivory hover:bg-gold hover:text-charcoal backdrop-blur-md shadow-lg transition-all hover:scale-110 active:scale-95 cursor-pointer"
              >
                <ChevronRight size={26} strokeWidth={2.2} />
              </button>
            )}
          </div>

          {/* Bottom Bar: Thumbnails and Helper Tip */}
          <div
            className="flex flex-col items-center gap-2 z-10 w-full max-w-3xl mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {allImages.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-2 max-w-full">
                {allImages.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setEnlargedPhotoIndex(idx)}
                    className={`relative h-12 w-12 sm:h-14 sm:w-14 shrink-0 overflow-hidden rounded-lg border-2 transition-all cursor-pointer ${
                      enlargedPhotoIndex === idx
                        ? "border-gold scale-105 shadow-md ring-2 ring-gold/50"
                        : "border-ivory/30 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`Thumbnail ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
            <p className="text-[11px] text-ivory/60 text-center font-normal">
              Swipe or use arrow keys to browse • Click outside or press ESC to close
            </p>
          </div>
        </div>
      )}

      {/* Lightbox Modal for Review Customer Photos */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-charcoal/80 p-4 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setLightboxImg(null)}
        >
          <div
            className="relative max-h-[85vh] max-w-2xl overflow-hidden rounded-2xl bg-ivory p-2 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightboxImg(null)}
              className="absolute top-4 right-4 z-10 grid h-9 w-9 place-items-center rounded-full bg-charcoal/70 text-ivory hover:bg-charcoal transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
            <img
              src={lightboxImg}
              alt="Customer wear photo zoomed"
              className="max-h-[80vh] w-full rounded-xl object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}
