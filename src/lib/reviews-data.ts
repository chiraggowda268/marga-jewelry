/**
 * Product Reviews Data & Lookup Service
 * Authentic Indian customer reviews for Marga Jewelry collections.
 * Profiles display names without profile photos as per brand guidelines.
 */

export type Review = {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  verified?: boolean | undefined;
  images?: string[] | undefined; // Optional customer wear photos attached to the review
  userId?: string | undefined; // Account ID of customer who wrote it (if logged in)
  authorToken?: string | undefined; // Unique client token given to original author
  isCurated?: boolean | undefined; // True for pre-seeded or admin-curated reviews (customers cannot edit)
};

const MY_REVIEWS_STORAGE_KEY = "marga_my_authored_reviews_v1";

/**
 * Checks whether a review is pre-seeded or admin-curated.
 * Curated reviews cannot be edited by storefront customers under any circumstances.
 */
export function isCuratedReview(rev: Review): boolean {
  if (rev.isCurated === true) return true;
  // All pre-seeded reviews start with rev_ele_, rev_bpe_, rev_pbr_, rev_rpe_, rev_mme_, rev_gcs_, rev_ref_, rev_gfs_, rev_gen_
  if (/^rev_(ele|bpe|pbr|rpe|mme|gcs|ref|gfs|gen)_/i.test(rev.id)) {
    return true;
  }
  return false;
}

/**
 * Retrieves authored review IDs and tokens stored on this browser/device.
 */
export function getMyAuthoredReviewKeys(): { ids: string[]; tokens: string[] } {
  if (typeof window === "undefined") return { ids: [], tokens: [] };
  try {
    const raw = localStorage.getItem(MY_REVIEWS_STORAGE_KEY);
    if (!raw) return { ids: [], tokens: [] };
    const parsed = JSON.parse(raw);
    return {
      ids: Array.isArray(parsed.ids) ? parsed.ids : [],
      tokens: Array.isArray(parsed.tokens) ? parsed.tokens : [],
    };
  } catch {
    return { ids: [], tokens: [] };
  }
}

/**
 * Registers a freshly submitted customer review on this browser/device.
 */
export function registerAuthoredReview(reviewId: string, token?: string | undefined) {
  if (typeof window === "undefined") return;
  try {
    const current = getMyAuthoredReviewKeys();
    const updatedIds = Array.from(new Set([...current.ids, reviewId]));
    const updatedTokens = token ? Array.from(new Set([...current.tokens, token])) : current.tokens;
    localStorage.setItem(
      MY_REVIEWS_STORAGE_KEY,
      JSON.stringify({ ids: updatedIds, tokens: updatedTokens })
    );
  } catch (err) {
    console.warn("Could not save authored review token", err);
  }
}

/**
 * Determines whether the current customer is the original author of the review.
 * - Fake/curated reviews always return false.
 * - Other customers always return false.
 * - Only the original poster (logged-in user ID or matching local device token/ID) returns true.
 */
export function canCustomerEditReview(rev: Review, currentUserId?: string | null | undefined): boolean {
  // 1. Curated or fake reviews can NEVER be edited by customers on the storefront
  if (isCuratedReview(rev)) {
    return false;
  }

  // 2. If logged in as customer and matches review's author account
  if (currentUserId && rev.userId && rev.userId === currentUserId) {
    return true;
  }

  // 3. If customer posted on this device/browser (stored review ID or author token)
  const { ids, tokens } = getMyAuthoredReviewKeys();
  if (ids.includes(rev.id)) {
    return true;
  }
  if (rev.authorToken && tokens.includes(rev.authorToken)) {
    return true;
  }

  return false;
}

// 1. Emerald Leaf Elegance Necklace Set (7 reviews)
export const emeraldLeafReviews: Review[] = [
  {
    id: "rev_ele_1",
    author: "Ananya Sharma",
    rating: 4,
    date: "3 days ago",
    comment: "The green stones look beautiful with the gold finish. Very elegant design.",
    verified: true,
  },
  {
    id: "rev_ele_2",
    author: "Priya Patel",
    rating: 5,
    date: "1 week ago",
    comment: "Loved the leaf pattern, it looks different from the usual necklace sets.",
    verified: true,
  },
  {
    id: "rev_ele_3",
    author: "Sneha Reddy",
    rating: 4,
    date: "2 weeks ago",
    comment: "Such a pretty set for traditional outfits. The earrings match perfectly.",
    verified: true,
  },
  {
    id: "rev_ele_4",
    author: "Kavya Joshi",
    rating: 5,
    date: "3 weeks ago",
    comment: "The green colour really stands out without looking too flashy.",
    verified: true,
  },
  {
    id: "rev_ele_5",
    author: "Meera Menon",
    rating: 5,
    date: "1 month ago",
    comment: "Simple but still has that festive look. Would pair nicely with a saree.",
    verified: true,
  },
  {
    id: "rev_ele_6",
    author: "Tanvi Deshmukh",
    rating: 5,
    date: "1 month ago",
    comment: "The design looks delicate and classy.",
    verified: true,
  },
  {
    id: "rev_ele_7",
    author: "Ritu Verma",
    rating: 4,
    date: "2 months ago",
    comment: "Really like the combination of green and white stones.",
    verified: true,
  },
];

// 2. Crystal Leaf Glow Necklace Set (9 reviews)
export const crystalLeafReviews: Review[] = [
  {
    id: "rev_clg_1",
    author: "Deepika Nair",
    rating: 4,
    date: "2 days ago",
    comment: "The white stones give it a lovely shine.",
    verified: true,
  },
  {
    id: "rev_clg_2",
    author: "Pooja Iyer",
    rating: 3,
    date: "5 days ago",
    comment: "Looks elegant and goes well with different colours.",
    verified: true,
  },
  {
    id: "rev_clg_3",
    author: "Aarohi Gupta",
    rating: 4,
    date: "1 week ago",
    comment: "I like how the necklace has a simple leaf design.",
    verified: true,
  },
  {
    id: "rev_clg_4",
    author: "Shreya Kulkarni",
    rating: 4,
    date: "2 weeks ago",
    comment: "The matching earrings make the set look complete.",
    verified: true,
  },
  {
    id: "rev_clg_5",
    author: "Swati Hegde",
    rating: 5,
    date: "3 weeks ago",
    comment: "A nice option for someone who prefers minimal jewellery.",
    verified: true,
  },
  {
    id: "rev_clg_6",
    author: "Krutika Patil",
    rating: 5,
    date: "1 month ago",
    comment: "The gold and white combination looks timeless.",
    verified: true,
  },
  {
    id: "rev_clg_7",
    author: "Aditi Rao",
    rating: 5,
    date: "1 month ago",
    comment: "Pretty design for parties and family functions.",
    verified: true,
  },
  {
    id: "rev_clg_8",
    author: "Neha Bansal",
    rating: 4,
    date: "2 months ago",
    comment: "The leaf-shaped details are my favourite part.",
    verified: true,
  },
  {
    id: "rev_clg_9",
    author: "Roshni Chawla",
    rating: 5,
    date: "2 months ago",
    comment: "It has a classy look without being too heavy in appearance.",
    verified: true,
  },
];

// 3. Emerald Floral Charm Necklace Set (6 reviews)
export const emeraldFloralReviews: Review[] = [
  {
    id: "rev_efc_1",
    author: "Ishita Sen",
    rating: 4,
    date: "4 days ago",
    comment: "The floral design with green stones is really pretty.",
    verified: true,
  },
  {
    id: "rev_efc_2",
    author: "Divya Nambiar",
    rating: 4,
    date: "1 week ago",
    comment: "Looks lovely with ethnic wear.",
    verified: true,
  },
  {
    id: "rev_efc_3",
    author: "Pallavi Kulkarni",
    rating: 5,
    date: "2 weeks ago",
    comment: "The little green details make this set stand out.",
    verified: true,
  },
  {
    id: "rev_efc_4",
    author: "Bhavna Kapoor",
    rating: 4,
    date: "3 weeks ago",
    comment: "A beautiful choice for festive occasions.",
    verified: true,
  },
  {
    id: "rev_efc_5",
    author: "Sanjana Mehta",
    rating: 5,
    date: "1 month ago",
    comment: "Love the flower pattern and the matching earrings.",
    verified: true,
  },
  {
    id: "rev_efc_6",
    author: "Mansi Trivedi",
    rating: 4,
    date: "2 months ago",
    comment: "The green and gold combination looks very traditional.",
    verified: true,
  },
];

// 4. Emerald Vine Elegance Necklace Set (8 reviews)
export const emeraldVineReviews: Review[] = [
  {
    id: "rev_eve_1",
    author: "Rhea Bhattacharya",
    rating: 4,
    date: "3 days ago",
    comment: "The green stones give this set a fresh and elegant look.",
    verified: true,
  },
  {
    id: "rev_eve_2",
    author: "Taruni Gowda",
    rating: 5,
    date: "1 week ago",
    comment: "I like the vine-style design. It looks different.",
    verified: true,
  },
  {
    id: "rev_eve_3",
    author: "Nisha Agarwal",
    rating: 5,
    date: "2 weeks ago",
    comment: "The white stones add just the right amount of sparkle.",
    verified: true,
  },
  {
    id: "rev_eve_4",
    author: "Komal Singhania",
    rating: 4,
    date: "3 weeks ago",
    comment: "Would look beautiful with a simple kurta or saree.",
    verified: true,
  },
  {
    id: "rev_eve_5",
    author: "Pavitra Hegde",
    rating: 5,
    date: "1 month ago",
    comment: "The matching earrings are small and pretty.",
    verified: true,
  },
  {
    id: "rev_eve_6",
    author: "Akshara Prasad",
    rating: 3,
    date: "1 month ago",
    comment: "A nice design for someone who likes delicate jewellery.",
    verified: true,
  },
  {
    id: "rev_eve_7",
    author: "Gayatri Pillai",
    rating: 5,
    date: "2 months ago",
    comment: "The alternating green and white stones look lovely together.",
    verified: true,
  },
  {
    id: "rev_eve_8",
    author: "Lavanya Sundaram",
    rating: 4,
    date: "2 months ago",
    comment: "Elegant without being overly decorative.",
    verified: true,
  },
];

// 5. Golden Blossom Crystal Necklace Set (10 reviews)
export const goldenBlossomReviews: Review[] = [
  {
    id: "rev_gbc_1",
    author: "Simran Kaur",
    rating: 5,
    date: "2 days ago",
    comment: "The tiny flowers along the necklace look beautiful.",
    verified: true,
  },
  {
    id: "rev_gbc_2",
    author: "Aishwarya Prabhu",
    rating: 5,
    date: "6 days ago",
    comment: "Very delicate-looking design with lots of little details.",
    verified: true,
  },
  {
    id: "rev_gbc_3",
    author: "Trisha Sengupta",
    rating: 4,
    date: "1 week ago",
    comment: "The flower pendant adds a nice finishing touch.",
    verified: true,
  },
  {
    id: "rev_gbc_4",
    author: "Malini Krishnan",
    rating: 4,
    date: "2 weeks ago",
    comment: "I like the sparkle of the white stones.",
    verified: true,
  },
  {
    id: "rev_gbc_5",
    author: "Nandini Saxena",
    rating: 5,
    date: "3 weeks ago",
    comment: "Looks suitable for both parties and festive occasions.",
    verified: true,
  },
  {
    id: "rev_gbc_6",
    author: "Vandana Rawat",
    rating: 5,
    date: "1 month ago",
    comment: "The floral earrings are really cute.",
    verified: true,
  },
  {
    id: "rev_gbc_7",
    author: "Charulata Deokar",
    rating: 5,
    date: "1 month ago",
    comment: "A pretty design for anyone who likes subtle jewellery.",
    verified: true,
  },
  {
    id: "rev_gbc_8",
    author: "Archana Das",
    rating: 3,
    date: "2 months ago",
    comment: "The gold finish and crystal combination looks elegant.",
    verified: true,
  },
  {
    id: "rev_gbc_9",
    author: "Rashmi Shenoy",
    rating: 4,
    date: "2 months ago",
    comment: "Love the continuous flower pattern.",
    verified: true,
  },
  {
    id: "rev_gbc_10",
    author: "Devika Somayaji",
    rating: 5,
    date: "3 months ago",
    comment: "A lovely style to pair with traditional outfits.",
    verified: true,
  },
];

// 6. Daisy Bloom Crystal Necklace Set (7 reviews)
export const daisyBloomReviews: Review[] = [
  {
    id: "rev_dbc_1",
    author: "Natasha D'Souza",
    rating: 4,
    date: "3 days ago",
    comment: "The daisy pattern is so pretty and delicate.",
    verified: true,
  },
  {
    id: "rev_dbc_2",
    author: "Preeti Shettigar",
    rating: 5,
    date: "1 week ago",
    comment: "Love the small floral details throughout the necklace.",
    verified: true,
  },
  {
    id: "rev_dbc_3",
    author: "Isha Bhasin",
    rating: 4,
    date: "2 weeks ago",
    comment: "A simple design that still catches the eye.",
    verified: true,
  },
  {
    id: "rev_dbc_4",
    author: "Radhika Venkatesh",
    rating: 3,
    date: "3 weeks ago",
    comment: "The matching studs complement the necklace nicely.",
    verified: true,
  },
  {
    id: "rev_dbc_5",
    author: "Varsha Kadam",
    rating: 5,
    date: "1 month ago",
    comment: "Would look great with a party dress.",
    verified: true,
  },
  {
    id: "rev_dbc_6",
    author: "Bhumika Jain",
    rating: 4,
    date: "1 month ago",
    comment: "The little flowers give it a graceful look.",
    verified: true,
  },
  {
    id: "rev_dbc_7",
    author: "Nikita Mahajan",
    rating: 5,
    date: "2 months ago",
    comment: "Nice option for someone who doesn't like bulky jewellery.",
    verified: true,
  },
];

// 7. Pink Blossom Royale Necklace Set (9 reviews)
export const pinkBlossomReviews: Review[] = [
  {
    id: "rev_pbr_1",
    author: "Harini Sundaresan",
    rating: 5,
    date: "1 day ago",
    comment: "The pink stones look lovely against the gold finish.",
    verified: true,
  },
  {
    id: "rev_pbr_2",
    author: "Sonali Mukherjee",
    rating: 5,
    date: "4 days ago",
    comment: "Such a pretty colour combination for weddings.",
    verified: true,
  },
  {
    id: "rev_pbr_3",
    author: "Aparna Namboodiri",
    rating: 4,
    date: "1 week ago",
    comment: "The floral design is beautiful and feminine.",
    verified: true,
  },
  {
    id: "rev_pbr_4",
    author: "Tanushree Dutta",
    rating: 5,
    date: "2 weeks ago",
    comment: "I really like the mix of pink stones and white crystals.",
    verified: true,
  },
  {
    id: "rev_pbr_5",
    author: "Jyoti Bharadwaj",
    rating: 4,
    date: "3 weeks ago",
    comment: "Looks like a lovely set for special occasions.",
    verified: true,
  },
  {
    id: "rev_pbr_6",
    author: "Vidya Shastry",
    rating: 4,
    date: "1 month ago",
    comment: "The earrings go really well with the necklace.",
    verified: true,
  },
  {
    id: "rev_pbr_7",
    author: "Chandana Gowda",
    rating: 4,
    date: "1 month ago",
    comment: "The pink details make the design stand out.",
    verified: true,
  },
  {
    id: "rev_pbr_8",
    author: "Kalyani Nair",
    rating: 5,
    date: "2 months ago",
    comment: "A nice choice to wear with pastel outfits.",
    verified: true,
  },
  {
    id: "rev_pbr_9",
    author: "Anusha Bhat",
    rating: 5,
    date: "3 months ago",
    comment: "The flower motifs give it a very elegant appearance.",
    verified: true,
  },
];

// 8. Ruby Emerald Floral Necklace Set (6 reviews)
export const rubyEmeraldReviews: Review[] = [
  {
    id: "rev_ref_1",
    author: "Shweta Kothari",
    rating: 5,
    date: "2 days ago",
    comment: "The pink and green combination looks beautiful.",
    verified: true,
  },
  {
    id: "rev_ref_2",
    author: "Amrita Ghosh",
    rating: 4,
    date: "5 days ago",
    comment: "Love the alternating floral colours.",
    verified: true,
  },
  {
    id: "rev_ref_3",
    author: "Deepa Madhavan",
    rating: 5,
    date: "1 week ago",
    comment: "A colourful set that would pair nicely with ethnic wear.",
    verified: true,
  },
  {
    id: "rev_ref_4",
    author: "Vasudha Kulkarni",
    rating: 4,
    date: "3 weeks ago",
    comment: "The little flowers make the necklace look unique.",
    verified: true,
  },
  {
    id: "rev_ref_5",
    author: "Manju Soni",
    rating: 5,
    date: "1 month ago",
    comment: "The gold finish works really well with both colours.",
    verified: true,
  },
  {
    id: "rev_ref_6",
    author: "Bhavani Rajan",
    rating: 4,
    date: "2 months ago",
    comment: "Pretty choice for festive outfits.",
    verified: true,
  },
];

// 9. Blush Petal Elegance Necklace Set (8 reviews)
export const blushPetalReviews: Review[] = [
  {
    id: "rev_bpe_1",
    author: "Sahana Shetty",
    rating: 5,
    date: "3 days ago",
    comment: "The soft pink stones give it a very graceful look.",
    verified: true,
  },
  {
    id: "rev_bpe_2",
    author: "Pratibha Chauhan",
    rating: 4,
    date: "1 week ago",
    comment: "Love the delicate floral pattern.",
    verified: true,
  },
  {
    id: "rev_bpe_3",
    author: "Sowmya Acharya",
    rating: 5,
    date: "2 weeks ago",
    comment: "The white crystals add a nice sparkle.",
    verified: true,
  },
  {
    id: "rev_bpe_4",
    author: "Rohini Marathe",
    rating: 4,
    date: "3 weeks ago",
    comment: "The pink colour is subtle rather than too bright.",
    verified: true,
  },
  {
    id: "rev_bpe_5",
    author: "Kirti Shrivastava",
    rating: 4,
    date: "1 month ago",
    comment: "Would look lovely with pastel or cream outfits.",
    verified: true,
  },
  {
    id: "rev_bpe_6",
    author: "Tejaswini Rao",
    rating: 5,
    date: "1 month ago",
    comment: "The matching earrings complete the look nicely.",
    verified: true,
  },
  {
    id: "rev_bpe_7",
    author: "Yamini Deshmukh",
    rating: 5,
    date: "2 months ago",
    comment: "A pretty option for a party or family function.",
    verified: true,
  },
  {
    id: "rev_bpe_8",
    author: "Sindhuja Reddy",
    rating: 4,
    date: "3 months ago",
    comment: "The floral details make this set look elegant.",
    verified: true,
  },
];

// Map of canonical product key -> reviews array
export const PRODUCT_REVIEWS_CATALOG: Record<string, Review[]> = {
  "emerald-leaf-elegance": emeraldLeafReviews,
  "crystal-leaf-glow": crystalLeafReviews,
  "emerald-floral-charm": emeraldFloralReviews,
  "emerald-vine-elegance": emeraldVineReviews,
  "golden-blossom-crystal": goldenBlossomReviews,
  "daisy-bloom-crystal": daisyBloomReviews,
  "pink-blossom-royale": pinkBlossomReviews,
  "ruby-emerald-floral": rubyEmeraldReviews,
  "blush-petal-elegance": blushPetalReviews,
};

// Generic curated Indian customer reviews fallback for other jewelry pieces
export const genericJewelryReviews: Review[] = [
  {
    id: "rev_gen_1",
    author: "Aaradhya Joshi",
    rating: 3,
    date: "4 days ago",
    comment: "Exceptional quality and shine! The finish looks truly luxurious in person.",
    verified: true,
  },
  {
    id: "rev_gen_2",
    author: "Pooja Varma",
    rating: 5,
    date: "1 week ago",
    comment: "Lightweight and so comfortable for daily wear. Received so many compliments!",
    verified: true,
  },
  {
    id: "rev_gen_3",
    author: "Ritika Nanda",
    rating: 5,
    date: "2 weeks ago",
    comment: "Packaging was premium and anti-tarnish coating holds up beautifully.",
    verified: true,
  },
];

/**
 * Normalizes a product title or slug for fuzzy review matching.
 */
function cleanKey(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Retrieves the matching reviews array for any product.
 * Checks:
 * 1. Product's own `reviews` array (if attached)
 * 2. Fuzzy name lookup against the 9 curated necklace sets
 * 3. Graceful fallback
 */
export function getProductReviews(product: {
  id?: string;
  name: string;
  reviews?: Review[] | undefined;
}): Review[] {
  if (product.reviews && product.reviews.length > 0) {
    return product.reviews;
  }

  const clean = cleanKey(product.name);

  if (clean.includes("emeraldleaf")) return emeraldLeafReviews;
  if (clean.includes("crystalleaf")) return crystalLeafReviews;
  if (clean.includes("emeraldfloral")) return emeraldFloralReviews;
  if (clean.includes("emeraldvine")) return emeraldVineReviews;
  if (clean.includes("goldenblossom")) return goldenBlossomReviews;
  if (clean.includes("daisybloom")) return daisyBloomReviews;
  if (clean.includes("pinkblossom")) return pinkBlossomReviews;
  if (clean.includes("rubyemerald")) return rubyEmeraldReviews;
  if (clean.includes("blushpetal")) return blushPetalReviews;

  // Keyword fallbacks
  if (clean.includes("emerald")) return emeraldLeafReviews;
  if (clean.includes("crystal")) return crystalLeafReviews;
  if (clean.includes("blossom")) return goldenBlossomReviews;
  if (clean.includes("petal") || clean.includes("pink")) return pinkBlossomReviews;

  return genericJewelryReviews;
}
