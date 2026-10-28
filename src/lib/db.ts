import necklace from "@/assets/necklace.jpg";
import earrings from "@/assets/earrings.jpg";
import bracelet from "@/assets/bracelet.jpg";
import ring from "@/assets/ring.jpg";
import layering from "@/assets/layering.jpg";
import everyday from "@/assets/everyday.jpg";

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
  createdAt: string;
};

export const defaultProducts: Product[] = [
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
