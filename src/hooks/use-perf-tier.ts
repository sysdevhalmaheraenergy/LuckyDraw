import { useEffect, useState } from "react";

export type PerfTier = "low" | "high";

/**
 * Detects a low-end device / reduced-motion preference so heavy
 * animations (many coins, high-density confetti, blur filters)
 * can gracefully scale down without changing the visual language.
 */
export function usePerfTier(): PerfTier {
  const [tier, setTier] = useState<PerfTier>("high");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const nav = navigator as Navigator & {
      deviceMemory?: number;
      connection?: { saveData?: boolean; effectiveType?: string };
    };

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const lowCores = (nav.hardwareConcurrency ?? 8) <= 4;
    const lowMemory = (nav.deviceMemory ?? 8) <= 4;
    const saveData = !!nav.connection?.saveData;
    const slowNet = /(^|-)2g$/.test(nav.connection?.effectiveType ?? "");
    const smallScreen = Math.min(window.innerWidth, window.innerHeight) < 480;

    const isLow =
      reducedMotion ||
      saveData ||
      slowNet ||
      (lowCores && (lowMemory || smallScreen));

    setTier(isLow ? "low" : "high");
  }, []);

  return tier;
}
