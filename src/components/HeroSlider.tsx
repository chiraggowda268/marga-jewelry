import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import hero1 from "@/assets/hero/hero-1.jpg";
import hero2 from "@/assets/hero/hero-2.jpg";
import hero3 from "@/assets/hero/hero-3.jpg";
import hero4 from "@/assets/hero/hero-4.jpg";
import hero5 from "@/assets/hero/hero-5.jpg";
import hero6 from "@/assets/hero/hero-6.jpg";

const slides = [
  {
    src: hero1,
    alt: "Emerald marquise cut and diamond necklace with matching drop earrings",
  },
  {
    src: hero2,
    alt: "Fine gold and diamond floral necklace with gemstone drop earrings",
  },
  {
    src: hero3,
    alt: "Marquise diamond leaf choker necklace with drop earrings",
  },
  {
    src: hero4,
    alt: "Delicate snowflake starburst diamond necklace and studs",
  },
  {
    src: hero5,
    alt: "Emerald accent open marquise diamond choker and earrings",
  },
  {
    src: hero6,
    alt: "Elegant diamond floral choker necklace and studs",
  },
];

export function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  const goTo = (index: number) => {
    setCurrent(index);
  };

  // Automatic sliding timer (every 3.5s)
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      next();
    }, 3500);

    return () => clearInterval(timer);
  }, [next, isPaused]);

  // Touch swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.targetTouches.length > 0 && e.targetTouches[0]) {
      touchStartX.current = e.targetTouches[0].clientX;
    }
    setIsPaused(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.targetTouches.length > 0 && e.targetTouches[0]) {
      touchEndX.current = e.targetTouches[0].clientX;
    }
  };

  const handleTouchEnd = () => {
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const diff = touchStartX.current - touchEndX.current;
      if (diff > 50) {
        next();
      } else if (diff < -50) {
        prev();
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
    setIsPaused(false);
  };

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured Fine Jewelry Showcase"
      className="group relative order-1 h-80 sm:h-[420px] w-full overflow-hidden bg-[#3f0f1b] md:order-2 md:h-[540px] lg:h-[600px]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Sliding Track */}
      <div
        className="flex h-full w-full transition-transform duration-700 ease-out will-change-transform"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide, idx) => (
          <div
            key={idx}
            className="relative h-full w-full shrink-0 flex items-center justify-center overflow-hidden bg-[#3f0f1b]"
            aria-hidden={current !== idx}
          >
            {/* Ambient blurred satin backdrop to smoothly fill wider screens */}
            <img
              src={slide.src}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover scale-110 blur-xl opacity-65 pointer-events-none select-none"
            />
            {/* Centered, zoomed-out jewelry piece fully visible without cropping */}
            <img
              src={slide.src}
              alt={slide.alt}
              loading={idx === 0 ? "eager" : "lazy"}
              decoding="async"
              className="relative z-10 h-full w-full object-contain object-center p-2 sm:p-4 md:p-6 select-none drop-shadow-sm"
            />
            {/* Subtle bottom vignette for controls visibility */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 via-black/15 to-transparent z-10" />
          </div>
        ))}
      </div>

      {/* Prev Arrow */}
      <button
        type="button"
        onClick={prev}
        aria-label="Previous slide"
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-full bg-petrol/70 text-ivory backdrop-blur-sm transition-all hover:bg-petrol hover:scale-105 active:scale-95 md:opacity-0 md:group-hover:opacity-100"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {/* Next Arrow */}
      <button
        type="button"
        onClick={next}
        aria-label="Next slide"
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-full bg-petrol/70 text-ivory backdrop-blur-sm transition-all hover:bg-petrol hover:scale-105 active:scale-95 md:opacity-0 md:group-hover:opacity-100"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Indicator Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 sm:gap-2 z-20">
        {slides.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => goTo(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`transition-all duration-300 rounded-full ${
              current === idx
                ? "w-6 h-1.5 sm:h-2 bg-butter shadow-sm"
                : "w-1.5 sm:w-2 h-1.5 sm:h-2 bg-ivory/60 hover:bg-ivory/90"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
