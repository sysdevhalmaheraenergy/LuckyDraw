"use client";

import { useState } from "react";
import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";

const navLinks = [
  { href: "#fitur", label: "Fitur" },
  { href: "#cara-kerja", label: "Cara Kerja" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-4 z-50 mx-4 sm:mx-6">
      <div className="mx-auto flex max-w-6xl items-center justify-between rounded-2xl border border-border/50 bg-white/30 px-4 py-3 shadow-glass backdrop-blur-xl sm:px-6">
        <Link href="/" aria-label="Lucky Draw beranda">
          <BrandMark />
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Navigasi utama">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-ink-muted transition-colors duration-200 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 rounded"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
               href="/login"
               className="cursor-pointer rounded-full px-4 py-2 text-sm font-semibold text-ink transition-all duration-200 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
          >
            Masuk
          </Link>
          <Link
             href="/register"
             className="cursor-pointer rounded-full bg-gradient-to-br from-brand to-brand-2 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-brand/30 transition-all duration-200 hover:opacity-90 hover:shadow-glass-glow active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
          >
            Daftar
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
           aria-label={open ? "Tutup menu" : "Buka menu"}
           className="cursor-pointer rounded-lg p-2 text-ink md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="mx-auto mt-2 flex max-w-6xl flex-col gap-1 rounded-2xl border border-border/50 bg-white/30 p-4 shadow-glass backdrop-blur-xl md:hidden">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
               onClick={() => setOpen(false)}
               className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-muted transition-colors duration-200 hover:bg-white/30 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
            >
              {link.label}
            </a>
          ))}
          <div className="mt-2 flex flex-col gap-2 border-t border-border/50 pt-3">
            <Link
               href="/login"
               className="cursor-pointer rounded-lg px-3 py-2.5 text-center text-sm font-semibold text-ink transition-colors duration-200 hover:bg-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
            >
              Masuk
            </Link>
            <Link
               href="/register"
               className="cursor-pointer rounded-lg bg-gradient-to-br from-brand to-brand-2 px-3 py-2.5 text-center text-sm font-semibold text-white shadow-lg shadow-brand/30 transition-all duration-200 hover:opacity-90 hover:shadow-glass-glow active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
            >
              Daftar
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
