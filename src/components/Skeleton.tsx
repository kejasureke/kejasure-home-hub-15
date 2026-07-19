/**
 * Lightweight shimmer skeletons used for perceived-speed polish while a
 * screen mounts or a segment change re-runs a filter. Purely cosmetic —
 * mock data resolves instantly, so these show briefly on mount.
 */
export const Shimmer = ({ className = "" }: { className?: string }) => (
  <div
    className={`bg-secondary rounded-xl overflow-hidden relative ${className}`}
    style={{
      backgroundImage:
        "linear-gradient(90deg, transparent 0%, hsl(var(--muted) / 0.35) 50%, transparent 100%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.2s ease-in-out infinite",
    }}
    aria-hidden
  />
);

export const PropertyCardSkeleton = () => (
  <div className="w-full bg-card rounded-2xl card-shadow overflow-hidden animate-fade-in">
    <Shimmer className="w-full aspect-[16/10] rounded-none" />
    <div className="p-4 space-y-2.5">
      <Shimmer className="h-4 w-3/4" />
      <div className="flex gap-2">
        <Shimmer className="h-3 w-16" />
        <Shimmer className="h-3 w-20" />
      </div>
      <div className="flex gap-3">
        <Shimmer className="h-3 w-12" />
        <Shimmer className="h-3 w-12" />
      </div>
    </div>
  </div>
);

export const HeroSkeleton = () => (
  <div className="space-y-3">
    <Shimmer className="w-full aspect-[4/3] rounded-2xl" />
    <Shimmer className="h-5 w-1/2" />
    <Shimmer className="h-4 w-1/3" />
  </div>
);

export default Shimmer;
