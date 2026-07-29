"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { BrandMark } from "@/components/brand-mark";

const features = [
  {
    title: "Undian Adil & Acak",
    desc: "Setiap kupon punya peluang yang sama. Pemilihan pemenang sepenuhnya acak dan tercatat di server.",
    icon: (
      <path d="M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6ZM7 7v.01M17 7v.01M7 17v.01M17 17v.01" />
    ),
  },
  {
    title: "Manajemen Kupon",
    desc: "Generate ratusan hingga ribuan nomor kupon otomatis, dan exclude kupon yang tidak berlaku.",
    icon: <path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1a2 2 0 0 0 0 6v1a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-1a2 2 0 0 0 0-6V8Zm5-2v12" />,
  },
  {
    title: "Multi Hadiah Berurutan",
    desc: "Atur banyak hadiah dengan urutan pengundian sendiri, dari hadiah hiburan sampai grand prize.",
    icon: <path d="M12 3 3 8l9 5 9-5-9-5ZM3 12l9 5 9-5M3 16l9 5 9-5" />,
  },
  {
    title: "Riwayat & Undo",
    desc: "Salah pencet? Setiap hasil undian bisa dibatalkan dan kuponnya kembali masuk ke pool.",
    icon: <path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5M12 8v4l3 2" />,
  },
  {
    title: "Peran Admin & Staff",
    desc: "Kontrol akses berlapis — admin mengelola event, staff bisa membantu jalankan acara.",
    icon: <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7 10v-2a4 4 0 0 0-3-3.87M15 3.13a4 4 0 0 1 0 7.75" />,
  },
  {
    title: "Mudah Digunakan",
    desc: "Mudah digunakan dan dapat diakses dari laptop, tablet, maupun ponsel.",
    icon: <path d="m8 9-4 3 4 3m8-6 4 3-4 3M13 5l-2 14" />,
  },
];

const steps = [
  {
    n: "01",
    title: "Buat Event",
    desc: "Tentukan nama acara dan jumlah kupon — sistem otomatis membuatkan nomor kupon 1 sampai N.",
  },
  {
    n: "02",
    title: "Tambah Hadiah",
    desc: "Daftarkan semua hadiah beserta urutan pengundiannya, dari yang terkecil sampai grand prize.",
  },
  {
    n: "03",
    title: "Undi di Depan Peserta",
    desc: "Tekan undi, sistem memilih 1 kupon AVAILABLE secara acak dan langsung menandai pemenangnya.",
  },
  {
    n: "04",
    title: "Bagikan Hasil",
    desc: "Lihat riwayat lengkap siapa memenangkan apa, dengan opsi pembatalan bila terjadi kesalahan.",
  },
];

export default function Home() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 300);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      {/* Gradient background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-brand/5 via-transparent to-emerald-500/5" />
      <div className="fixed inset-0 -z-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand/10 via-transparent to-transparent opacity-30" />

      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden px-4 pb-20 pt-16 sm:pt-24">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-[-10rem] -z-10 flex justify-center blur-3xl"
          >
            <div className="h-[36rem] w-[36rem] rounded-full bg-gradient-to-br from-brand/30 via-brand-2/20 to-accent/25 opacity-70" />
          </div>

          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-white/30 px-4 py-1.5 text-xs font-semibold text-brand backdrop-blur-xl">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Undian kupon yang adil &amp; transparan
            </span>

            <h1 className="mt-6 font-display text-4xl font-bold leading-[1.1] tracking-tight text-ink sm:text-5xl md:text-6xl">
              Jalankan Undian Hadiah <span className="text-brand">Tanpa Drama</span>
            </h1>

            <p className="mt-6 max-w-xl text-balance text-lg leading-relaxed text-ink-muted">
              LuckyDraw membantu tim kamu mengelola event, kupon, dan hadiah — lalu mengundi
              pemenang secara acak, tercatat, dan bisa dibatalkan kapan saja kalau ada kesalahan.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="cursor-pointer rounded-full bg-gradient-to-br from-brand to-brand-2 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand/30 transition-all duration-200 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
              >
                Mulai Gratis
              </Link>
              <Link
                href="/login"
                className="cursor-pointer rounded-full border border-border/50 bg-white/30 px-7 py-3.5 text-sm font-semibold text-ink backdrop-blur-xl transition-all duration-200 hover:border-brand/40 hover:text-brand hover:bg-white/40"
              >
                Masuk ke Akun
              </Link>
            </div>

            <dl className="mt-16 grid w-full grid-cols-3 gap-6 border-t border-border/50 pt-8">
              {[
                ["100%", "Acak & Adil"],
                ["<1s", "Waktu Undi"],
                ["∞", "Batalkan Kapan Saja"],
              ].map(([value, label]) => (
                <div key={label} className="text-center">
                  <dt className="sr-only">{label}</dt>
                  <dd className="font-display text-2xl font-bold text-ink sm:text-3xl">{value}</dd>
                  <p className="mt-1 text-xs text-ink-muted sm:text-sm">{label}</p>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Features */}
        <section id="fitur" className="px-4 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                Semua yang Dibutuhkan untuk Undian
              </h2>
              <p className="mt-4 text-ink-muted">
                Dari persiapan kupon sampai pengumuman pemenang, satu tempat untuk semuanya.
              </p>
            </div>

            <div className="mt-12 sm:mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="group rounded-2xl border border-border/50 bg-white/40 p-6 backdrop-blur-xl transition-all duration-300 hover:border-brand/30 hover:bg-white/50"
                >
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand/10 text-brand transition-colors duration-300 group-hover:bg-brand group-hover:text-white">
                    <svg viewBox="0 0 24 24" fill="none" className="h-5.5 w-5.5" aria-hidden="true">
                      <g stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                        {f.icon}
                      </g>
                    </svg>
                  </div>
                  <h3 className="mt-4 font-display text-base font-semibold text-ink">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="cara-kerja" className="px-4 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl rounded-3xl border border-border/50 bg-white/30 p-6 sm:p-8 md:p-14 backdrop-blur-xl">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                Cara Kerjanya
              </h2>
              <p className="mt-4 text-ink-muted">Empat langkah mudah sampai pemenang diumumkan.</p>
            </div>

            <ol className="mt-12 sm:mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((s) => (
                <li key={s.n} className="relative">
                  <span className="font-display text-4xl font-bold text-brand/25">{s.n}</span>
                  <h3 className="mt-3 font-display text-base font-semibold text-ink">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">{s.desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 pb-16 sm:pb-24">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 rounded-3xl bg-gradient-to-br from-brand to-brand-2 px-6 py-12 text-center shadow-xl shadow-brand/20 sm:px-8 sm:py-16 md:px-14">
            <h2 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">
              Siap menjalankan undian berikutnya?
            </h2>
            <p className="max-w-md text-sm text-white/80 sm:text-base">
              Buat akun dalam hitungan detik dan mulai kelola event undianmu hari ini.
            </p>
            <Link
              href="/register"
              className="cursor-pointer rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-brand-2 shadow-lg transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
            >
              Daftar Sekarang
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/50 bg-white/30 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
          <BrandMark />
          <div className="flex items-center gap-6 text-sm text-ink-muted">
            <Link href="/api-docs" className="transition-colors duration-200 hover:text-ink">
              API Docs
            </Link>
            <Link href="/login" className="transition-colors duration-200 hover:text-ink">
              Masuk
            </Link>
            <span>© {new Date().getFullYear()} LuckyDraw</span>
          </div>
        </div>
      </footer>

      {/* Scroll to top */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Kembali ke atas"
          className="fixed bottom-6 right-6 z-50 grid h-12 w-12 cursor-pointer place-items-center rounded-full bg-gradient-to-br from-brand to-brand-2 text-white shadow-lg shadow-brand/30 transition-all duration-200 hover:opacity-90 hover:scale-105 active:scale-95 animate-fade-in"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
            <path d="M12 19V5M5 12l7-7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
    </div>
  );
}
