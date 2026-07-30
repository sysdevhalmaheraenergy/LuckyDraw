"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sfx, vibrate } from "@/lib/lucky-sfx";

interface DigitProps {
  target: number;
  spinning: boolean;
  delay: number;
  duration: number;
  minInterval: number;
  maxInterval: number;
}

export function Digit({
  target,
  spinning,
  delay,
  duration,
  minInterval,
  maxInterval,
}: DigitProps) {
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
    <div className="relative flex items-center justify-center w-10 h-14 md:w-12 md:h-16">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={value}
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="text-3xl md:text-4xl font-mono font-bold text-gray-800"
        >
          {value}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}