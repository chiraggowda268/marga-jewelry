import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useLocation,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, useState, useRef, type ReactNode } from "react";

import { Header, Footer } from "../components/site";
import { ProductModal } from "../components/ProductModal";
import { MaintenancePage } from "../components/MaintenancePage";
import { UnreachablePage } from "../components/UnreachablePage";
import { StoreProvider } from "../lib/store";
import { SITE_MODE } from "../lib/site-mode";
import appCss from "../styles.css?url";
import logoDark from "@/assets/marga-logo-dark.png";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Marga Jewelry" },
      { name: "description", content: "Everyday fine jewelry by Marga." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Urbanist:wght@400;500;600;700&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const location = useLocation();
  const [isPageLoading, setIsPageLoading] = useState(false);
  const prevPathnameRef = useRef(location.pathname);

  // Smooth page transition and short branded logo loading screen
  useEffect(() => {
    // Only trigger on actual pathname changes (not query parameters)
    if (prevPathnameRef.current === location.pathname) {
      return undefined;
    }

    prevPathnameRef.current = location.pathname;
    setIsPageLoading(true);

    // Instantly scroll smoothly to top on page switch
    window.scrollTo({ top: 0, behavior: "instant" });

    // Short branded micro-splash (280ms) for high-end luxury feel
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 280);

    return () => {
      clearTimeout(timer);
    };
  }, [location.pathname]);

  // If not accessing /admin, handle unreachable or maintenance modes
  if (!location.pathname.startsWith("/admin")) {
    if (SITE_MODE === "UNREACHABLE") {
      return (
        <QueryClientProvider client={queryClient}>
          <StoreProvider>
            <UnreachablePage />
          </StoreProvider>
        </QueryClientProvider>
      );
    }

    if (SITE_MODE === "MAINTENANCE") {
      return (
        <QueryClientProvider client={queryClient}>
          <StoreProvider>
            <MaintenancePage />
          </StoreProvider>
        </QueryClientProvider>
      );
    }
  }

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <StoreProvider>
        {/* Short Branded Logo Loading Screen during page navigation */}
        {isPageLoading && (
          <div
            role="status"
            aria-live="polite"
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-ivory/85 backdrop-blur-xs transition-opacity duration-200 pointer-events-none"
          >
            {/* Top Golden Progress Indicator */}
            <div className="fixed top-0 left-0 right-0 h-[3px] bg-muted overflow-hidden z-[10000]">
              <div className="h-full w-full bg-gradient-to-r from-gold via-butter to-gold gold-loading-bar" />
            </div>

            {/* Centered Brand Micro-Splash Card */}
            <div className="flex flex-col items-center justify-center rounded-3xl bg-ivory/95 border border-border/70 p-6 sm:p-8 shadow-xl">
              <img
                src={logoDark}
                alt="Marga Jewelry"
                className="h-10 sm:h-12 w-auto object-contain logo-transition-pulse select-none"
              />
              <div className="mt-4 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-gold animate-bounce [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 rounded-full bg-gold animate-bounce [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 rounded-full bg-gold animate-bounce" />
              </div>
            </div>
          </div>
        )}

        <Header />
        <main key={location.pathname} className="page-transition">
          <Outlet />
        </main>
        <Footer />
        <ProductModal />
      </StoreProvider>
    </QueryClientProvider>
  );
}
