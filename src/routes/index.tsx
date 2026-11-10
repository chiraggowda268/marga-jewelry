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

const btn = "inline-flex h-10 sm:h-12 items-center justify-center rounded-lg bg-butter px-5 sm:px-8 eyebrow text-xs sm:text-sm text-petrol hover:bg-gold transition-colors";

function Index() {
  const { products } = useStore();
  return (
    <>
      {/* Hero */}
      <section className="grid bg-petrol md:grid-cols-2">
        <div className="order-2 flex flex-col justify-center px-5 py-7 sm:py-10 text-ivory md:order-1 md:px-16 lg:px-24">
          <p className="eyebrow text-xs sm:text-sm text-gold">New Collection</p>
          <h1 className="mt-2 text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-serif leading-snug">Jewelry for Every Moment of You</h1>
          <p className="mt-2.5 sm:mt-4 max-w-md text-xs sm:text-sm md:text-base text-ivory/80 leading-relaxed">Delicate, modern pieces crafted to layer, stack and wear every day.</p>
          <Link to="/collections" className={`${btn} mt-5 sm:mt-7 self-start`}>Explore Collection</Link>
        </div>
        <img src={hero} alt="Layered gold necklaces" width={1280} height={1024} className="order-1 h-52 sm:h-72 w-full object-cover md:order-2 md:h-[540px]" />
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-7 sm:py-12 md:px-8">
        <h2 className="text-center font-serif text-xl sm:text-2xl md:text-3xl text-petrol">Shop by Category</h2>
        <div className="no-scrollbar -mx-4 mt-5 sm:mt-8 flex snap-x gap-4 sm:gap-6 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-6 md:px-0">
          {categories.map((c) => (
            <Link key={c.slug} to="/shop" search={{ category: c.slug }} className="group w-20 sm:w-24 shrink-0 snap-start text-center md:w-auto">
              <div className="aspect-square overflow-hidden rounded-full border border-gold/50 p-0.5 sm:p-1">
                <img src={c.image} alt={c.name} loading="lazy" className="h-full w-full rounded-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <p className="mt-2 font-serif text-xs sm:text-sm md:text-base text-charcoal group-hover:text-petrol">{c.name}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Bestsellers */}
      <section className="mx-auto max-w-7xl px-4 py-7 sm:py-12 md:px-8">
        <div className="flex items-end justify-between">
          <h2 className="font-serif text-xl sm:text-2xl md:text-3xl text-petrol">Bestsellers</h2>
          <Link to="/shop" className="eyebrow text-xs sm:text-sm text-petrol underline underline-offset-4">View All</Link>
        </div>
        <div className="no-scrollbar -mx-4 mt-5 sm:mt-8 flex snap-x gap-3 sm:gap-4 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-5 md:gap-6 md:px-0">
          {products.slice(0, 5).map((p) => (
            <div key={p.id} className="w-[52%] shrink-0 snap-start sm:w-[38%] md:w-auto"><ProductCard p={p} /></div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="border-y border-border bg-ivory">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-6 sm:py-8 md:grid-cols-4 md:gap-8 md:px-8 md:py-10">
          {[
            [Truck, "Free Shipping", "On all prepaid orders"],
            [Gem, "Skin Friendly", "Hypoallergenic finish"],
            [RefreshCw, "Easy Returns", "7-day hassle-free returns"],
            [ShieldCheck, "Secure Payments", "100% protected checkout"],
          ].map(([I, t, d]) => {
            const Icon = I as typeof Truck;
            return (
              <div key={t as string} className="flex flex-col items-center text-center">
                <Icon className="text-gold" size={22} strokeWidth={1.3} />
                <p className="mt-2 font-serif text-sm sm:text-base text-petrol">{t as string}</p>
                <p className="text-[11px] sm:text-xs text-muted-foreground">{d as string}</p>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
