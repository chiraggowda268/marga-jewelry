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
  const pill = "shrink-0 h-11 px-5 inline-flex items-center rounded-full border eyebrow";
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      <h1 className="text-4xl text-petrol">{wishlist ? "Your Wishlist" : q ? `Results for “${q}”` : "Shop All"}</h1>
      <div className="no-scrollbar mt-6 flex gap-2 overflow-x-auto">
        <Link to="/shop" className={`${pill} ${!category ? "border-petrol bg-petrol text-ivory" : "border-border"}`}>All</Link>
        {categories.map((c) => (
          <Link key={c.slug} to="/shop" search={{ category: c.slug }} className={`${pill} ${category === c.slug ? "border-petrol bg-petrol text-ivory" : "border-border"}`}>{c.name}</Link>
        ))}
      </div>
      {list.length === 0 ? (
        <p className="py-20 text-center text-muted-foreground">No pieces found.</p>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {list.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      )}
    </section>
  );
}
