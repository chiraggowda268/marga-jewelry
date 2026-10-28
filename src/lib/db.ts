import necklace from "@/assets/necklace.jpg";
import earrings from "@/assets/earrings.jpg";
import bracelet from "@/assets/bracelet.jpg";
import ring from "@/assets/ring.jpg";
import layering from "@/assets/layering.jpg";
import everyday from "@/assets/everyday.jpg";
import editorial from "@/assets/editorial.jpg";
import hero from "@/assets/hero.jpg";
import promo from "@/assets/promo.jpg";

import {
  type Review,
  emeraldLeafReviews,
  crystalLeafReviews,
  emeraldFloralReviews,
  emeraldVineReviews,
  goldenBlossomReviews,
  daisyBloomReviews,
  pinkBlossomReviews,
  rubyEmeraldReviews,
  blushPetalReviews,
} from "./reviews-data";

export type { Review };

export type Category = {
  slug: string;
  name: string;
  image: string;
  description?: string | undefined;
};

export const defaultCategories: Category[] = [
  { slug: "necklaces", name: "Necklaces", image: necklace, description: "Delicate chains, pendants and chokers" },
  { slug: "earrings", name: "Earrings", image: earrings, description: "Everyday studs, huggies and bold hoops" },
  { slug: "bracelets", name: "Bracelets", image: bracelet, description: "Minimalist chains, cuffs and tennis styles" },
  { slug: "rings", name: "Rings", image: ring, description: "Stackable bands, signets and solitaire gems" },
  { slug: "layering-sets", name: "Layering Sets", image: layering, description: "Curated multi-tier jewelry styling" },
  { slug: "everyday-edit", name: "Everyday Edit", image: everyday, description: "Effortless pieces designed for daily wear" },
];

export type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number | undefined;
  image: string;
  images?: string[] | undefined;
  category: string;
  description: string;
  material: string;
  stock: number;
  badge?: "Bestseller" | "New" | "Trending" | "Limited" | undefined;
  rating: number;
  reviewsCount: number;
  details: string[];
  reviews?: Review[] | undefined;
  createdAt: string;
};

export const defaultProducts: Product[] = [
  {
    id: "p_set_1",
    name: "Emerald Leaf Elegance Necklace Set",
    slug: "emerald-leaf-elegance-necklace-set",
    price: 2799,
    originalPrice: 3499,
    image: necklace,
    category: "necklaces",
    description: "A radiant gold necklace with meticulously cut emerald-green crystal stones and sculpted leaf accents, complete with matching earrings.",
    material: "18K Gold Plated Brass, Emerald Green Zirconia & Austrian Crystals",
    stock: 25,
    badge: "Bestseller",
    rating: 4.9,
    reviewsCount: 7,
    reviews: emeraldLeafReviews,
    details: [
      "Matching pair of leaf stud earrings included",
      "18K Gold anti-tarnish protective coating",
      "Hypoallergenic & skin-friendly finish",
      "Adjustable chain length: 16–18 inches",
    ],
    createdAt: "2026-03-01T10:00:00Z",
  },
  {
    id: "p_set_2",
    name: "Crystal Leaf Glow Necklace Set",
    slug: "crystal-leaf-glow-necklace-set",
    price: 2599,
    originalPrice: 3299,
    image: necklace,
    category: "necklaces",
    description: "Luminous brilliant-cut white crystals arranged in a graceful leaf motif, accompanied by matching delicate earrings.",
    material: "18K Gold Vermeil & AAAAA Faceted White Zirconia Crystals",
    stock: 22,
    badge: "Trending",
    rating: 4.9,
    reviewsCount: 9,
    reviews: crystalLeafReviews,
    details: [
      "Complete set with matching crystal drop earrings",
      "Micro-prong set faceted cubic zirconia",
      "Featherlight comfort design for all-day wear",
      "Water-resistant protective finish",
    ],
    createdAt: "2026-03-02T10:00:00Z",
  },
  {
    id: "p_set_3",
    name: "Emerald Floral Charm Necklace Set",
    slug: "emerald-floral-charm-necklace-set",
    price: 2699,
    originalPrice: 3399,
    image: layering,
    category: "necklaces",
    description: "An enchanting blend of floral charm motifs adorned with rich green stones and golden petals, paired with coordinated studs.",
    material: "18K Gold Plated 925 Sterling Silver & Emerald Crystals",
    stock: 18,
    badge: "New",
    rating: 5.0,
    reviewsCount: 6,
    reviews: emeraldFloralReviews,
    details: [
      "Hand-set floral motifs with rich green centers",
      "Includes matching flower stud earrings",
      "Solid sterling silver base with 18K gold seal",
      "100% Nickel-free and hypoallergenic",
    ],
    createdAt: "2026-03-03T10:00:00Z",
  },
  {
    id: "p_set_4",
    name: "Emerald Vine Elegance Necklace Set",
    slug: "emerald-vine-elegance-necklace-set",
    price: 2899,
    originalPrice: 3699,
    image: necklace,
    category: "necklaces",
    description: "An undulating vine of alternating emerald green and sparkling clear crystals designed to drape effortlessly along the collarbone.",
    material: "18K Gold Vermeil, Green Tourmaline Zirconia & Pavé Crystals",
    stock: 20,
    badge: "Bestseller",
    rating: 4.9,
    reviewsCount: 8,
    reviews: emeraldVineReviews,
    details: [
      "Coordinated petite drop earrings included",
      "Alternating two-tone crystal vine framework",
      "Designed for sarees, kurtas, and festive styling",
      "Anti-oxidizing sealed polish",
    ],
    createdAt: "2026-03-04T10:00:00Z",
  },
  {
    id: "p_set_5",
    name: "Golden Blossom Crystal Necklace Set",
    slug: "golden-blossom-crystal-necklace-set",
    price: 2999,
    originalPrice: 3899,
    image: promo,
    category: "necklaces",
    description: "A continuous strand of sculpted golden blossoms centered with sparkling crystals and a statement floral pendant with earrings.",
    material: "18K Gold Plated Brass & Pavé Cut Crystals",
    stock: 15,
    badge: "Trending",
    rating: 5.0,
    reviewsCount: 10,
    reviews: goldenBlossomReviews,
    details: [
      "Intricate micro-blossom chain with flower pendant",
      "Includes matching floral blossom studs",
      "Comfort clasp with 2-inch extender chain",
      "Tarnish-free multi-layer gold plating",
    ],
    createdAt: "2026-03-05T10:00:00Z",
  },
  {
    id: "p_set_6",
    name: "Daisy Bloom Crystal Necklace Set",
    slug: "daisy-bloom-crystal-necklace-set",
    price: 2499,
    originalPrice: 2999,
    image: everyday,
    category: "necklaces",
    description: "Playful yet refined daisy blossoms glistening with clear crystals, paired with adorable matching daisy earrings.",
    material: "18K Gold Plated Brass & Pavé Cut White Crystals",
    stock: 28,
    badge: "New",
    rating: 4.8,
    reviewsCount: 7,
    reviews: daisyBloomReviews,
    details: [
      "Delicate daisy floral links across necklace",
      "Matching daisy stud earrings included in gift pouch",
      "Ultra-lightweight design (under 12g)",
      "Skin-safe hypoallergenic plating",
    ],
    createdAt: "2026-03-06T10:00:00Z",
  },
  {
    id: "p_set_7",
    name: "Pink Blossom Royale Necklace Set",
    slug: "pink-blossom-royale-necklace-set",
    price: 2999,
    originalPrice: 3899,
    image: editorial,
    category: "necklaces",
    description: "Regal blush-pink gemstones entwined with brilliant crystals in a feminine floral silhouette, accompanied by matching earrings.",
    material: "18K Gold Vermeil, Rose Quartz Simulated Stones & Crystals",
    stock: 19,
    badge: "Bestseller",
    rating: 4.9,
    reviewsCount: 9,
    reviews: pinkBlossomReviews,
    details: [
      "Soft pastel pink stones accented with clear crystals",
      "Matching royal blossom drop earrings included",
      "Ideal for weddings, receptions, and pastel lehengas",
      "Signature Marga velvet jewelry box",
    ],
    createdAt: "2026-03-07T10:00:00Z",
  },
  {
    id: "p_set_8",
    name: "Ruby Emerald Floral Necklace Set",
    slug: "ruby-emerald-floral-necklace-set",
    price: 2899,
    originalPrice: 3799,
    image: hero,
    category: "necklaces",
    description: "A festive contrast of vibrant ruby-pink and deep emerald-green floral stones set in polished 18K gold vermeil with matching studs.",
    material: "18K Gold Vermeil, Simulated Ruby & Emerald Zirconia",
    stock: 16,
    badge: "Trending",
    rating: 4.9,
    reviewsCount: 6,
    reviews: rubyEmeraldReviews,
    details: [
      "Dual-tone festive ruby and emerald floral clusters",
      "Coordinated floral earrings included",
      "Reinforced link structure with safety lobster clasp",
      "Water & perfume resistant protective seal",
    ],
    createdAt: "2026-03-08T10:00:00Z",
  },
  {
    id: "p_set_9",
    name: "Blush Petal Elegance Necklace Set",
    slug: "blush-petal-elegance-necklace-set",
    price: 2599,
    originalPrice: 3399,
    image: necklace,
    category: "necklaces",
    description: "Subtle blush-pink petals accented with sparkling white crystals for a graceful, modern romantic aesthetic with earrings.",
    material: "18K Gold Plated Brass & Soft Blush Zirconia",
    stock: 24,
    badge: "New",
    rating: 4.9,
    reviewsCount: 8,
    reviews: blushPetalReviews,
    details: [
      "Romantic blush pink petal motifs with crystals",
      "Includes matching petal stud earrings",
      "Perfect pairing for contemporary and pastel outfits",
      "Hypoallergenic and tarnish-resistant",
    ],
    createdAt: "2026-03-09T10:00:00Z",
  },
  {
    id: "p1",
    name: "Pearl Leaf Pendant",
    slug: "pearl-leaf-pendant",
    price: 2499,
    originalPrice: 3299,
    image: necklace,
    category: "necklaces",
    description: "A freshwater baroque pearl cradled in sculpted 18K gold vermeil leaf setting. Elegant, timeless, and organic.",
    material: "18K Gold Vermeil over 925 Sterling Silver & Cultured Baroque Pearl",
    stock: 24,
    badge: "Bestseller",
    rating: 4.9,
    reviewsCount: 42,
    details: [
      "18K Gold Vermeil over 925 Sterling Silver",
      "Authentic Cultured Freshwater Pearl",
      "Chain length: 16-18 inches (adjustable)",
      "Hypoallergenic & 100% Nickel-free",
      "Anti-tarnish protective coating",
    ],
    createdAt: "2026-01-15T10:00:00Z",
  },
  {
    id: "p2",
    name: "Bold Gold Hoops",
    slug: "bold-gold-hoops",
    price: 1899,
    originalPrice: 2499,
    image: earrings,
    category: "earrings",
    description: "Chunky hollow hoops that make a statement while remaining weightless on your earlobes from morning till night.",
    material: "18K Gold Plated Brass",
    stock: 18,
    badge: "Trending",
    rating: 4.8,
    reviewsCount: 38,
    details: [
      "18K Yellow Gold thick plating",
      "Hollow featherweight construction (under 4g per hoop)",
      "Diameter: 22mm",
      "Comfort click-latch closure",
      "Water & sweat resistant finish",
    ],
    createdAt: "2026-01-20T11:30:00Z",
  },
  {
    id: "p3",
    name: "Solitaire Chain Bracelet",
    slug: "solitaire-chain-bracelet",
    price: 1699,
    originalPrice: 2199,
    image: bracelet,
    category: "bracelets",
    description: "A delicate cable chain centered with a bezel-set faceted zirconia solitaire that catches the light with every gesture.",
    material: "18K Gold Vermeil & AAAAA Cubic Zirconia",
    stock: 15,
    rating: 4.7,
    reviewsCount: 29,
    details: [
      "Adjustable slider clasp fits wrists 5.5 to 7.5 inches",
      "Brilliant-cut round solitaire stone (4mm)",
      "Micro-cable chain link strength tested",
      "Tarnish-resistant coating",
    ],
    createdAt: "2026-02-01T14:15:00Z",
  },
  {
    id: "p4",
    name: "Petite Solitaire Ring",
    slug: "petite-solitaire-ring",
    price: 1499,
    originalPrice: 1999,
    image: ring,
    category: "rings",
    description: "A whisper-thin band crowned with a low-profile solitaire stone. Ideal for minimalists or stacking with your favorite bands.",
    material: "18K Gold Plated 925 Sterling Silver",
    stock: 30,
    badge: "New",
    rating: 4.9,
    reviewsCount: 51,
    details: [
      "Band thickness: 1.2mm ultra-fine band",
      "Solid 925 sterling silver base",
      "Prong-set simulated diamond",
      "Comfort-fit rounded inner profile",
    ],
    createdAt: "2026-02-10T09:45:00Z",
  },
  {
    id: "p5",
    name: "Triple Layer Set",
    slug: "triple-layer-set",
    price: 3299,
    originalPrice: 4299,
    image: layering,
    category: "layering-sets",
    description: "Three harmoniously tiered necklaces designed to create the effortless golden stack without tangling.",
    material: "18K Gold Plated Brass with Anti-Tarnish Seal",
    stock: 12,
    badge: "Bestseller",
    rating: 5.0,
    reviewsCount: 64,
    details: [
      "Includes 3 separate necklaces: Herringbone, Figaro, and Solitaire Drop",
      "Lengths: 14\", 16\", 18\" with 2\" extenders each",
      "Can be worn individually or layered together",
      "High-luster mirror polish",
    ],
    createdAt: "2026-02-18T16:20:00Z",
  },
  {
    id: "p6",
    name: "Huggie & Stud Duo",
    slug: "huggie-stud-duo",
    price: 1299,
    originalPrice: 1699,
    image: everyday,
    category: "everyday-edit",
    description: "The quintessential ear stack starter kit. Features a micro pave huggie alongside classic sparkling crystal studs.",
    material: "18K Gold Plated Brass & Pavé Crystals",
    stock: 22,
    rating: 4.8,
    reviewsCount: 31,
    details: [
      "1 pair 10mm clicker huggies + 1 pair 3mm stud earrings",
      "Hypoallergenic surgical steel posts",
      "Secure hinge click closure on huggies",
      "Signature Marga luxury pouch included",
    ],
    createdAt: "2026-02-25T12:00:00Z",
  },
];

export type User = {
  id: string;
  name: string;
  username?: string | undefined;
  email: string;
  role: "admin" | "customer";
  phone?: string | undefined;
  address?: {
    street: string;
    city: string;
    state: string;
    pinCode: string;
  } | undefined;
  createdAt: string;
};

export const defaultUsers: User[] = [
  {
    id: "usr_admin_chirag",
    name: "Chirag",
    username: "chirag",
    email: "chirag@margajewelry.com",
    role: "admin",
    phone: "+91 98765 43210",
    address: {
      street: "14 Jubilee Hills, Road No. 36",
      city: "Hyderabad",
      state: "Telangana",
      pinCode: "500033",
    },
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "usr_admin_greeshma",
    name: "Greeshma",
    username: "greeshma",
    email: "greeshma@margajewelry.com",
    role: "admin",
    phone: "+91 98765 43211",
    address: {
      street: "22 Koramangala 4th Block",
      city: "Bengaluru",
      state: "Karnataka",
      pinCode: "560034",
    },
    createdAt: "2026-01-01T00:00:00Z",
  },
];

export type OrderItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

export type Order = {
  id: string;
  userId?: string | undefined;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    pinCode: string;
  };
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  paymentMethod: "razorpay" | "upi" | "card" | "netbanking" | "cod";
  paymentStatus: "Paid" | "Pending";
  orderStatus: "Processing" | "Confirmed" | "Shipped" | "Delivered" | "Cancelled";
  razorpayPaymentId?: string | undefined;
  razorpayOrderId?: string | undefined;
  createdAt: string;
};

// Production: Initial sales & orders start clean at 0
export const defaultOrders: Order[] = [];

export type Inquiry = {
  id: string;
  name: string;
  email: string;
  subject?: string | undefined;
  message: string;
  status: "new" | "replied";
  createdAt: string;
};

// Production: Initial inquiries start clean
export const defaultInquiries: Inquiry[] = [];

export type Coupon = {
  code: string;
  type: "percent" | "flat";
  value: number;
  minSpend?: number | undefined;
  description: string;
};

export const availableCoupons: Coupon[] = [
  { code: "MARGA10", type: "percent", value: 10, minSpend: 1500, description: "10% off on orders above ₹1,500" },
  { code: "WELCOME500", type: "flat", value: 500, minSpend: 2500, description: "Flat ₹500 off on first purchase above ₹2,500" },
  { code: "GOLD15", type: "percent", value: 15, minSpend: 3500, description: "15% off on luxury orders above ₹3,500" },
];

export const formatINR = (n: number) => "₹" + n.toLocaleString("en-IN");
