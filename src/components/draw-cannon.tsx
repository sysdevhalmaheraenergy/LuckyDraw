"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { sfx, vibrate } from "@/lib/lucky-sfx";
import { Digit } from "@/components/draw-digit";

interface Prize {
  id: string;
  name: string;
  description: string | null;
  drawOrder: number;
  status: string;
  imageUrl: string | null;
  drawResults: Array<{
    id: string;
    status: string;
    drawnAt: string;
    coupon: { number: number };
  }>;
}

const COLORS = [
  "from-pink-500 to-rose-500",
  "from-brand to-brand-2",
  "from-yellow-400 to-amber-500",
  "from-emerald-500 to-teal-500",
  "from-red-800 to-rose-800",
];

function getPrizeEmoji(prizeName: string, imageUrl: string | null): string {
  if (imageUrl) return "🖼️";
  if (prizeName.includes("iPhone") || prizeName.includes("Phone")) return "📱";
  if (prizeName.includes("MacBook")) return "💻";
  if (prizeName.includes("Cash") || prizeName.includes("Uang")) return "💰";
  if (prizeName.includes("Motor")) return "🏍️";
  if (prizeName.includes("TV")) return "📺";
  return "🎁";
}

interface DrawCannonProps {
  winningPrize: Prize;
  winningNumber: number[];
  onComplete: () => void;
}

export function DrawCannon({ winningPrize, winningNumber, onComplete }: DrawCannonProps) {
  const [spinning, setSpinning] = useState(true);
  const [showResult, setShowResult] = useState(false);

  const prizeEmoji = getPrizeEmoji(winningPrize.name, winningPrize.imageUrl);
  const prizeColor = COLORS[winningPrize.drawOrder % COLORS.length];
  const spinDuration = 3500 + winningPrize.drawOrder * 500;
  const minInterval = 35;
  const maxInterval = 180;

  useEffect(() => {
    const lastDigitStop = spinDuration + 5 * 200;

    const timer = setTimeout(() => {
      setSpinning(false);
      setShowResult(true);
      sfx.win();
      vibrate([80, 60, 80, 60, 200]);

      confetti({
        particleCount: 60,
        spread: 80,
        startVelocity: 20,
        origin: { y: 0.6 },
        colors: ["#FFD700", "#FF6B6B", "#4ECDC4"],
      });
    }, lastDigitStop);

    return () => {
      clearTimeout(timer);
    };
  }, [spinDuration]);

  const close = () => {
    onComplete();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(255, 255, 255, 0.95)" }}
    >
      <div className="relative z-10 flex flex-col items-center gap-10 px-6 py-12">
        <motion.h2
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-3xl md:text-4xl font-bold text-gray-800 text-center"
        >
          {spinning ? "Drawing..." : "Winner!"}
        </motion.h2>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="relative"
        >
          <div
            className={`w-72 h-56 md:w-80 md:h-64 rounded-2xl flex flex-col items-center justify-center bg-gradient-to-br ${prizeColor} text-white`}
            style={{
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
            }}
          >
            {winningPrize.imageUrl ? (
              <img
                src={winningPrize.imageUrl}
                alt={winningPrize.name}
                className="mb-3 h-48 w-56 rounded-xl object-contain"
              />
            ) : (
              <div className="text-5xl md:text-6xl mb-3">{prizeEmoji}</div>
            )}
            <div className="font-bold text-lg md:text-xl tracking-tight">
              {winningPrize.name}
            </div>
          </div>
        </motion.div>

        <div className="flex gap-2 md:gap-3">
          {winningNumber.map((_, i) => (
            <Digit
              key={i}
              target={winningNumber[i]}
              spinning={spinning}
              delay={i * 200}
              duration={spinDuration}
              minInterval={minInterval}
              maxInterval={maxInterval}
            />
          ))}
        </div>

        <AnimatePresence>
          {showResult && !spinning && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col items-center gap-5"
            >
              <p className="text-gray-600 text-base">
                Selamat! Nomor pemenang telah ditentukan
              </p>
              <button
                onClick={close}
                className="px-8 py-3 rounded-xl font-semibold text-white bg-brand hover:bg-brand-2 transition-colors shadow-md"
              >
                Tutup
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}