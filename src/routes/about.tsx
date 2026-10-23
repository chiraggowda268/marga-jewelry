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
      <img src={editorial} alt="Marga jewelry worn" className="h-80 w-full object-cover md:h-[600px]" />
      <div className="flex flex-col justify-center px-6 py-12 md:px-16">
        <p className="eyebrow text-gold">Our Story</p>
        <h1 className="mt-4 text-4xl text-petrol md:text-5xl">Made for the path you walk</h1>
        <p className="mt-5 max-w-md text-charcoal/80">“Marga” means path. Our pieces are designed to accompany you on yours — simple, refined, and made to be worn every single day.</p>
      </div>
    </section>
  ),
});
