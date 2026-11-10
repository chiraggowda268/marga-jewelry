import { createFileRoute, Link } from "@tanstack/react-router";
import { Truck, ShieldCheck, RefreshCw, Gem } from "lucide-react";
import hero from "@/assets/hero.jpg";
import { categories } from "@/lib/catalog";
import { ProductCard } from "@/components/site";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Marga Jewelry — Everyday Fine Jewelry" },
      { name: "description", content: "Delicate gold necklaces, hoops, bracelets and rings designed for your everyday story." },
      { property: "og:title", content: "Marga Jewelry — Everyday Fine Jewelry" },
      { property: "og:description", content: "Delicate gold jewelry designed for your everyday." },
    ],
  }),
  component: Index,
});

const btn = "inline-flex h-12 items-center justify-center rounded-lg bg-butter px-8 eyebrow text-petrol hover:bg-gold transition-colors";

function Index() {
  const { products } = useStore();
  return (
    <>
      {/* Hero */}
      <section className="grid bg-petrol md:grid-cols-2">
        <div className="order-2 flex flex-col justify-center px-6 py-12 text-ivory md:order-1 md:px-16 lg:px-24">
          <p className="eyebrow text-gold">New Collection</p>
          <h1 className="mt-4 text-4xl leading-tight sm:text-5xl lg:text-6xl">Jewelry for Every Moment of You</h1>
          <p className="mt-5 max-w-md text-ivory/80">Delicate, modern pieces crafted to layer, stack and wear every day.</p>
          <Link to="/collections" className={`${btn} mt-8 self-start`}>Explore Collection</Link>
        </div>
        <img src={hero} alt="Layered gold necklaces" width={1280} height={1024} className="order-1 h-72 w-full object-cover sm:h-96 md:order-2 md:h-[600px]" />
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <h2 className="text-center text-3xl text-petrol md:text-4xl">Shop by Category</h2>
        <div className="no-scrollbar -mx-4 mt-10 flex snap-x gap-6 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-6 md:px-0">
          {categories.map((c) => (
            <Link key={c.slug} to="/shop" search={{ category: c.slug }} className="group w-28 shrink-0 snap-start text-center md:w-auto">
              <div className="aspect-square overflow-hidden rounded-full border border-gold/50 p-1">
                <img src={c.image} alt={c.name} loading="lazy" className="h-full w-full rounded-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <p className="mt-3 font-serif text-lg text-charcoal group-hover:text-petrol">{c.name}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Bestsellers */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <div className="flex items-end justify-between">
          <h2 className="text-3xl text-petrol md:text-4xl">Bestsellers</h2>
          <Link to="/shop" className="eyebrow text-petrol underline underline-offset-4">View All</Link>
        </div>
        <div className="no-scrollbar -mx-4 mt-10 flex snap-x gap-4 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-5 md:gap-6 md:px-0">
          {products.slice(0, 5).map((p) => (
            <div key={p.id} className="w-[62%] shrink-0 snap-start sm:w-[40%] md:w-auto"><ProductCard p={p} /></div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="border-y border-border bg-ivory">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-10 md:grid-cols-4 md:px-8">
          {[
            [Truck, "Free Shipping", "On all prepaid orders"],
            [Gem, "Skin Friendly", "Hypoallergenic finish"],
            [RefreshCw, "Easy Returns", "7-day hassle-free returns"],
            [ShieldCheck, "Secure Payments", "100% protected checkout"],
          ].map(([I, t, d]) => {
            const Icon = I as typeof Truck;
            return (
              <div key={t as string} className="flex flex-col items-center text-center">
                <Icon className="text-gold" size={28} strokeWidth={1.3} />
                <p className="mt-3 font-serif text-lg text-petrol">{t as string}</p>
                <p className="text-xs text-muted-foreground">{d as string}</p>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
