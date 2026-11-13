import { createFileRoute } from "@tanstack/react-router";
import editorial from "@/assets/editorial.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Our Story — Marga Jewelry" },
      {
        name: "description",
        content:
          "At Marga, we believe every occasion deserves something special. Our jewellery is thoughtfully selected to bring together beauty, elegance and timeless charm.",
      },
      { property: "og:title", content: "Our Story — Marga Jewelry" },
      {
        property: "og:description",
        content:
          "At Marga, we believe every occasion deserves something special. Our jewellery is thoughtfully selected to bring together beauty, elegance and timeless charm.",
      },
    ],
  }),
  component: () => (
    <section className="grid bg-ivory md:grid-cols-2">
      <img
        src={editorial}
        alt="Marga jewelry worn"
        className="h-64 sm:h-80 w-full object-cover md:h-[620px]"
      />
      <div className="flex flex-col justify-center px-6 py-8 sm:py-14 md:px-14 lg:px-20 bg-ivory">
        <p className="eyebrow text-xs text-gold uppercase tracking-wider">Our Story</p>
        <h1 className="mt-3 font-serif text-3xl sm:text-4xl md:text-5xl text-petrol leading-tight">
          Marga – A Touch of Elegance
        </h1>
        <p className="mt-5 max-w-xl text-sm sm:text-base text-charcoal/85 leading-relaxed">
          At Marga, we believe every occasion deserves something special. Our jewellery is thoughtfully selected to bring together beauty, elegance and timeless charm. Each piece is chosen to make your celebrations brighter and your special moments even more memorable.
        </p>
      </div>
    </section>
  ),
});
