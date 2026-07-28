export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <img
        src="/lucky-draw-icon.png"
        alt="LuckyDraw logo"
        className="h-8 w-8 object-contain"
        width={32}
        height={32}
      />
      <span className="font-display text-lg font-bold tracking-tight text-ink">
        Lucky<span className="text-brand">Draw</span>
      </span>
    </span>
  );
}
