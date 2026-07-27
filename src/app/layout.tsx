import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/toast";

const outfit = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lucky Draw — Undian Hadiah Digital",
  description: "Kelola event, hadiah, dan pengundian kupon secara adil dan transparan.",
  icons: {
    icon: "/lucky-draw-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${outfit.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-surface text-ink font-body">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
