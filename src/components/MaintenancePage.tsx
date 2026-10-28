import { Link } from "@tanstack/react-router";
import { Clock, Mail, Shield } from "lucide-react";
import logoLight from "@/assets/marga-logo-light.png";

export function MaintenancePage() {
  return (
    <div className="min-h-screen bg-[#0d2222] text-[#faf6f0] flex flex-col justify-between items-center px-4 py-8 relative overflow-hidden selection:bg-[#c5a880] selection:text-[#0d2222]">
      {/* Subtle luxury ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#c5a880]/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Header */}
      <header className="pt-6 z-10 flex flex-col items-center">
        <img
          src={logoLight}
          alt="Marga Jewelry"
          className="h-10 sm:h-12 w-auto object-contain brightness-110 drop-shadow-md"
        />
        <div className="mt-3 flex items-center gap-2 rounded-full border border-[#c5a880]/30 bg-[#c5a880]/10 px-3.5 py-1 text-[11px] uppercase tracking-[0.2em] text-[#c5a880]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
          </span>
          Maintenance Mode Active
        </div>
      </header>

      {/* Center Hero */}
      <main className="max-w-xl w-full text-center my-auto py-12 z-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl border border-[#c5a880]/30 bg-[#163333] shadow-lg mb-6 text-[#c5a880]">
          <Clock className="w-8 h-8 animate-pulse" />
        </div>

        <h1 className="font-serif text-3xl sm:text-5xl font-medium tracking-wide text-[#faf6f0] leading-tight">
          Website Temporarily Inactive
        </h1>

        <div className="w-16 h-[1.5px] bg-[#c5a880] mx-auto my-6 opacity-70" />

        <p className="text-sm sm:text-base text-[#faf6f0]/70 font-light leading-relaxed max-w-md mx-auto">
          We are currently updating our boutique catalog, refining our collections, and performing scheduled system maintenance.
        </p>

        <p className="text-xs sm:text-sm text-[#c5a880] mt-4 font-serif italic">
          Our store will be back online shortly. Thank you for your patience.
        </p>

        {/* Contact Badge */}
        <div className="mt-8 pt-6 border-t border-[#c5a880]/20 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-[#faf6f0]/60">
          <div className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-[#c5a880]" />
            <span>
              Inquiries:{" "}
              <a
                href="mailto:support@margajewelry.com"
                className="text-[#faf6f0]/90 underline underline-offset-2 hover:text-[#c5a880] transition-colors"
              >
                support@margajewelry.com
              </a>
            </span>
          </div>
        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="w-full max-w-xl text-center pt-6 border-t border-white/5 z-10 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#faf6f0]/40 gap-2">
        <span>© {new Date().getFullYear()} Marga Jewelry. All rights reserved.</span>
        <Link
          to="/admin"
          className="hover:text-[#c5a880] transition-colors flex items-center gap-1 opacity-60 hover:opacity-100"
          title="Store Management"
        >
          <Shield className="w-3 h-3" />
          <span>Admin Portal</span>
        </Link>
      </footer>
    </div>
  );
}
