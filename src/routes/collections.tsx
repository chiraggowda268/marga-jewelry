import { createFileRoute, Link } from "@tanstack/react-router";
import { categories } from "@/lib/catalog";

export const Route = createFileRoute("/collections")({
  head: () => ({
    meta: [
      { title: "Collections — Marga Jewelry" },
      { name: "description", content: "Explore Marga collections: necklaces, earrings, bracelets, rings and layering sets." },
      { property: "og:title", content: "Collections — Marga Jewelry" },
      { property: "og:description", content: "Explore Marga jewelry collections." },
    ],
  }),
  component: () => (
    <section className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      <h1 className="text-center text-4xl text-petrol">Collections</h1>
      <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
        {categories.map((c) => (
          <Link key={c.slug} to="/shop" search={{ category: c.slug }} className="group relative block aspect-square overflow-hidden rounded-xl">
            <img src={c.image} alt={c.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <span className="absolute inset-x-0 bottom-0 bg-petrol/85 py-3 text-center font-serif text-xl text-ivory">{c.name}</span>
          </Link>
        ))}
      </div>
    </section>
  ),
});
