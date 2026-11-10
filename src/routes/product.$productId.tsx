import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/product/$productId")({
  head: () => ({
    meta: [
      { title: "Marga Jewelry — Fine Everyday Collection" },
      { name: "description", content: "Handcrafted anti-tarnish 18K fine jewelry by Marga." },
    ],
  }),
  component: ProductRedirectRoute,
});

function ProductRedirectRoute() {
  const { productId } = Route.useParams();
  const { products, setQuickViewProduct } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (products.length > 0) {
      const match = products.find((p) => p.id === productId || p.slug === productId);
      if (match) {
        setQuickViewProduct(match);
      }
      navigate({ to: "/", search: { product: productId } as any, replace: true });
    }
  }, [productId, products, navigate, setQuickViewProduct]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-ivory p-6">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-petrol border-t-transparent mx-auto mb-3" />
        <p className="font-serif text-lg text-petrol">Loading handcrafted piece...</p>
      </div>
    </div>
  );
}
