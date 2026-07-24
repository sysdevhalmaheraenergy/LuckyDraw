"use client";

import { useEffect, useState, useRef } from "react";

interface DrawAnimationProps {
  winningNumber: number;
  onComplete: () => void;
  duration?: number;
}

export function DrawAnimation({ winningNumber, onComplete, duration = 2000 }: DrawAnimationProps) {
  const [displayNumber, setDisplayNumber] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const frameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    const pad = Math.pow(10, String(winningNumber).length);
    startTimeRef.current = performance.now();

    function animate(time: number) {
      const elapsed = time - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);

      if (progress < 1) {
        // Slot-machine effect: fast random numbers slowing down
        const range = Math.max(1, Math.floor((1 - eased) * pad * 2));
        setDisplayNumber(Math.floor(Math.random() * range));
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayNumber(winningNumber);
        setIsComplete(true);
        setTimeout(onComplete, 600);
      }
    }

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [winningNumber, duration, onComplete]);

  return (
    <div className="flex flex-col items-center gap-3" role="status" aria-live="polite">
      <div
        className={`grid h-24 w-48 place-items-center rounded-2xl border-2 font-display text-4xl font-bold tracking-widest transition-all duration-500 ${
          isComplete
            ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-500"
            : "border-brand/30 bg-brand/5 text-brand"
        }`}
      >
        {String(displayNumber).padStart(String(winningNumber).length, "0")}
      </div>
      {isComplete && (
        <p className="animate-fade-in text-sm font-semibold text-emerald-500">
          Pemenang!
        </p>
      )}
    </div>
  );
}