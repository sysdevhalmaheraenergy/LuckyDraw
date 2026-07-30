"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { sfx, vibrate } from "@/lib/lucky-sfx";
import { usePerfTier } from "@/hooks/use-perf-tier";

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

function Digit({
  target,
  spinning,
  delay,
  duration,
  minInterval,
  maxInterval,
}: {
  target: number;
  spinning: boolean;
  delay: number;
  duration: number;
  minInterval: number;
  maxInterval: number;
}) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!spinning) {
      setValue(target);
      return;
    }
    const totalDuration = duration + delay;
    const startTime = performance.now();
    let timer: ReturnType<typeof setTimeout>;
    let stopped = false;

    const tick = () => {
      const elapsed = performance.now() - startTime;
      const t = Math.min(1, elapsed / totalDuration);
      if (t >= 1) {
        stopped = true;
        setValue(target);
        sfx.stop();
        vibrate(40);
        return;
      }
      setValue(Math.floor(Math.random() * 10));
      sfx.tick();
      const pace = 1 - Math.sin(t * Math.PI);
      const nextInterval = minInterval + pace * (maxInterval - minInterval);
      timer = setTimeout(tick, nextInterval);
    };
    timer = setTimeout(tick, 40);

    return () => {
      if (!stopped) clearTimeout(timer);
      else clearTimeout(timer);
    };
  }, [spinning, target, delay, duration, minInterval, maxInterval]);

  return (
    <div
      className="relative w-16 h-24 md:w-20 md:h-28 rounded-xl overflow-hidden"
      style={{
        background: "linear-gradient(90deg,rgba(155, 42, 42, 1) 0%, rgba(232, 45, 28, 1) 50%, rgba(214, 32, 144, 1) 100%)",
        boxShadow:
          "inset 0 4px 12px rgba(0,0,0,0.6), 0 0 30px rgba(248,113,113,0.4), 0 8px 20px rgba(0,0,0,0.5)",
        border: "2px solid rgba(255,215,0,0.4)",
        transform: "perspective(400px) rotateX(8deg)",
      }}
    >
      <div className="absolute inset-0 pointer-events-none z-10 bg-gradient-to-b from-white/20 via-transparent to-black/40" />
      <AnimatePresence mode="popLayout">
        <motion.div
          key={value}
          initial={{ y: -60, opacity: 0, rotateX: -90 }}
          animate={{ y: 0, opacity: 1, rotateX: 0 }}
          exit={{ y: 60, opacity: 0, rotateX: 90 }}
          transition={{ duration: 0.15 }}
          className="absolute inset-0 flex items-center justify-center text-5xl md:text-6xl font-black"
          style={{
            background: "linear-gradient(180deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "0 0 20px rgba(255,215,0,0.6)",
            fontFamily: "monospace",
          }}
        >
          {value}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Coin({ delay, x }: { delay: number; x: number }) {
  const size = 28 + Math.round((x * 13) % 20);
  const spinDur = 0.6 + ((x * 7) % 60) / 100;
  return (
    <motion.div
      className="absolute top-0"
      style={{
        left: `${x}%`,
        width: size,
        height: size,
        willChange: "transform, opacity",
      }}
      initial={{ y: -80, opacity: 0 }}
      animate={{
        y: ["0vh", "110vh"],
        opacity: [0, 1, 1, 0.8],
        x: [0, x > 50 ? -50 : 50, 0, x > 50 ? -35 : 35, 0],
      }}
      transition={{
        duration: 3 + Math.random() * 2.5,
        delay,
        repeat: Infinity,
        ease: [0.45, 0.05, 0.55, 0.95],
      }}
    >
      <motion.div
        className="w-full h-full"
        style={{ transformStyle: "preserve-3d", willChange: "transform" }}
        animate={{ rotateY: [0, 360], rotateZ: [0, 15, -15, 0] }}
        transition={{
          rotateY: { duration: spinDur, repeat: Infinity, ease: "linear" },
          rotateZ: { duration: 1.2, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        <div
          className="w-full h-full rounded-full flex items-center justify-center font-black"
          style={{
            background:
              "radial-gradient(circle at 30% 25%, #FFF7B0 0%, #FFD700 35%, #E6A800 70%, #8A5A00 100%)",
            border: "2px solid #B8860B",
            boxShadow:
              "inset 0 -3px 6px rgba(120,70,0,0.6), inset 0 3px 6px rgba(255,255,220,0.9), 0 0 14px rgba(255,215,0,0.7), 0 4px 10px rgba(0,0,0,0.4)",
            color: "#7a4a00",
            fontSize: size * 0.5,
            textShadow: "0 1px 0 rgba(255,255,255,0.4)",
          }}
        >
          $
        </div>
      </motion.div>
    </motion.div>
  );
}

interface DrawCannonProps {
  winningPrize: Prize;
  winningNumber: number[];
  onComplete: () => void;
}

export function DrawCannon({ winningPrize, winningNumber, onComplete }: DrawCannonProps) {
  const [spinning, setSpinning] = useState(true);
  const [showResult, setShowResult] = useState(false);
  const perfTier = usePerfTier();
  const isLow = perfTier === "low";
  const coinCount = isLow ? 8 : 20;

  const prizeEmoji = getPrizeEmoji(winningPrize.name, winningPrize.imageUrl);
  const prizeColor = COLORS[winningPrize.drawOrder % COLORS.length];
  const spinDuration = 3500 + winningPrize.drawOrder * 500;
  const minInterval = 35;
  const maxInterval = 180;

  useEffect(() => {
    const lastDigitStop = spinDuration + 5 * 200;

    const anticipation = setTimeout(() => {
      confetti({
        particleCount: isLow ? 15 : 30,
        spread: 60,
        startVelocity: 25,
        origin: { y: 0.55 },
        colors: ["#FFD700", "#FFA500"],
      });
    }, Math.max(0, lastDigitStop - 120));

    const timer = setTimeout(() => {
      setSpinning(false);
      setShowResult(true);
      sfx.win();
      vibrate([80, 60, 80, 60, 200]);

      clearTimeout(anticipation);
      const end = Date.now() + (isLow ? 1500 : 2500);
      const colors = ["#FFD700", "#FF6B6B", "#4ECDC4", "#a855f7", "#f97316"];
      const sideCount = isLow ? 2 : 4;
      let lastFrame = 0;
      // eslint-disable-next-line react-hooks/purity
      (function frame() {
        const now = Date.now();
        if (isLow && now - lastFrame < 33) {
          if (now < end) requestAnimationFrame(frame);
          return;
        }
        lastFrame = now;
        confetti({
          particleCount: sideCount,
          angle: 60,
          spread: 70,
          origin: { x: 0, y: 0.7 },
          colors,
        });
        confetti({
          particleCount: sideCount,
          angle: 120,
          spread: 70,
          origin: { x: 1, y: 0.7 },
          colors,
        });
        if (now < end) requestAnimationFrame(frame);
      })();
      confetti({
        particleCount: isLow ? 90 : 200,
        spread: 160,
        origin: { y: 0.5 },
        colors,
      });
    }, lastDigitStop);

    return () => {
      clearTimeout(timer);
      clearTimeout(anticipation);
    };
  }, [spinDuration, isLow]);

  const close = () => {
    onComplete();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{
        background:
          "radial-gradient(circle at center, rgba(80,10,10,0.95) 0%, rgba(25,5,5,0.98) 100%)",
        backdropFilter: isLow ? undefined : "blur(10px)",
      }}
    >
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: coinCount }).map((_, i) => (
          <Coin key={i} delay={i * 0.2} x={(i * 37) % 100} />
        ))}
      </div>

      <motion.div
        className={`absolute ${isLow ? "w-[140vmax] h-[140vmax]" : "w-[200vmax] h-[200vmax]"} pointer-events-none`}
        animate={{ rotate: 360 }}
        transition={{ duration: isLow ? 30 : 20, repeat: Infinity, ease: "linear" }}
        style={{
          willChange: "transform",
          background:
            "conic-gradient(from 0deg, transparent 0deg, rgba(255,215,0,0.08) 20deg, transparent 40deg, transparent 90deg, rgba(248,113,113,0.08) 110deg, transparent 130deg, transparent 180deg, rgba(255,215,0,0.08) 200deg, transparent 220deg, transparent 270deg, rgba(248,113,113,0.08) 290deg, transparent 310deg)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-8 px-6">
        <motion.h2
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-4xl md:text-6xl font-black text-center"
          style={{
            background: "linear-gradient(180deg, #FFD700 0%, #FF6B00 100%)",
            // background: "linear-gradient(90deg,rgba(155, 42, 42, 1) 0%, rgba(232, 45, 28, 1) 50%, rgba(214, 32, 144, 1) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0 4px 20px rgba(255,215,0,0.5))",
          }}
        >
          {spinning ? "🎲 DRAWING..." : "🎉 WINNER! 🎉"}
        </motion.h2>

        <motion.div
          initial={{ scale: 0, rotateY: -180 }}
          animate={{
            scale: 1,
            rotateY: spinning ? [0, 360] : 0,
          }}
          transition={{
            scale: { duration: 0.5 },
            rotateY: spinning
              ? { duration: 1.2, repeat: Infinity, ease: "linear" }
              : { duration: 0.8 },
          }}
          style={{ transformStyle: "preserve-3d", perspective: 1000 }}
          className="relative"
        >
          {/* make image bigger */}
          <div
            className={`w-80 h-64 md:w-[28rem] md:h-72 rounded-2xl flex flex-col items-center justify-center bg-gradient-to-br ${prizeColor}`}
            style={{
              boxShadow:
                "0 20px 60px rgba(0,0,0,0.5), 0 0 80px rgba(255,215,0,0.3), inset 0 2px 20px rgba(255,255,255,0.2)",
              border: "3px solid rgba(255,215,0,0.6)",
            }}
          >
            {winningPrize.imageUrl ? (
              <img
                src={winningPrize.imageUrl}
                alt={winningPrize.name}
                className="mb-2 h-56 w-64 rounded-xl object-contain ring-2 ring-white/20"
              />
            ) : (
              <div className="text-6xl md:text-7xl mb-2 drop-shadow-lg">
                {prizeEmoji}
              </div>
            )}
            <div className="text-white font-black text-xl md:text-2xl tracking-wide drop-shadow-lg">
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

        {showResult && !spinning && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center gap-4"
          >
            <p className="text-white/80 text-lg">
              Selamat! Nomor pemenang telah ditentukan
            </p>
            <div className="flex gap-3">
              <button
                onClick={close}
                className="px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-brand to-brand-2 shadow-lg shadow-brand/30 hover:scale-105 transition-transform"
              >
                Tutup
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
