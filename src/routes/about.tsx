import { createFileRoute } from "@tanstack/react-router";
import editorial from "@/assets/editorial.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Marga Jewelry" },
      { name: "description", content: "The story behind Marga Jewelry and our everyday designs." },
      { property: "og:title", content: "About — Marga Jewelry" },
      { property: "og:description", content: "The story behind Marga Jewelry." },
    ],
  }),
  component: () => (
    <section className="grid bg-butter md:grid-cols-2">
      <img src={editorial} alt="Marga jewelry worn" className="h-56 sm:h-72 w-full object-cover md:h-[600px]" />
      <div className="flex flex-col justify-center px-5 py-6 sm:py-10 md:px-16">
        <p className="eyebrow text-xs text-gold uppercase tracking-wider">Our Story</p>
        <h1 className="mt-2 text-2xl sm:text-3xl md:text-5xl font-serif text-petrol">Made for the path you walk</h1>
        <p className="mt-3 max-w-md text-xs sm:text-sm md:text-base text-charcoal/80 leading-relaxed">“Marga” means path. Our pieces are designed to accompany you on yours — simple, refined, and made to be worn every single day.</p>
      </div>
    </section>
  ),
});
