import { createFileRoute, Link } from "@tanstack/react-router";
import { categories } from "@/lib/catalog";
import { ProductCard } from "@/components/site";
import { useStore } from "@/lib/store";

type S = { category?: string | undefined; q?: string | undefined; wishlist?: boolean | undefined };

export const Route = createFileRoute("/shop")({
  validateSearch: (s: { category?: unknown; q?: unknown; wishlist?: unknown }): S => ({
    category: typeof s.category === "string" ? s.category : undefined,
    q: typeof s.q === "string" && s.q ? s.q : undefined,
    wishlist: s.wishlist === true || s.wishlist === "true" ? true : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Shop — Marga Jewelry" },
      { name: "description", content: "Shop everyday gold necklaces, earrings, bracelets and rings." },
      { property: "og:title", content: "Shop — Marga Jewelry" },
      { property: "og:description", content: "Shop everyday gold jewelry." },
    ],
  }),
  component: Shop,
});

function Shop() {
  const { category, q, wishlist } = Route.useSearch();
  const { wishlist: wl, products } = useStore();
  const list = products.filter(
    (p) =>
      (!category || p.category === category) &&
      (!q || p.name.toLowerCase().includes(q.toLowerCase())) &&
      (!wishlist || wl.includes(p.id)),
  );
  const pill = "shrink-0 h-8 sm:h-9 px-3.5 sm:px-4 inline-flex items-center rounded-full border eyebrow text-[11px] sm:text-xs transition-colors";
  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:py-8 md:px-8 md:py-12">
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif text-petrol">
          {wishlist ? "Your Wishlist" : q ? `Results for “${q}”` : "Shop All"}
        </h1>
        <p className="text-xs text-muted-foreground">{list.length} {list.length === 1 ? "piece" : "pieces"}</p>
      </div>
      <div className="no-scrollbar mt-3 sm:mt-5 flex gap-1.5 sm:gap-2 overflow-x-auto pb-1">
        <Link to="/shop" className={`${pill} ${!category ? "border-petrol bg-petrol text-ivory font-medium" : "border-border text-charcoal hover:border-petrol"}`}>All</Link>
        {categories.map((c) => (
          <Link key={c.slug} to="/shop" search={{ category: c.slug }} className={`${pill} ${category === c.slug ? "border-petrol bg-petrol text-ivory font-medium" : "border-border text-charcoal hover:border-petrol"}`}>{c.name}</Link>
        ))}
      </div>
      {list.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">No pieces found.</p>
      ) : (
        <div className="mt-5 sm:mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {list.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      )}
    </section>
  );
}
