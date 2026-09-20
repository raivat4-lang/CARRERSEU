/**
 * CareerSetu brand mark.
 * "Setu" = bridge — a single arched span over a deck, with a guiding star above:
 * the bridge from where a student is now to the career ahead.
 * Drawn inline as SVG so it stays crisp at any size.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" className={className}>
      {/* guiding star */}
      <path
        d="M24 3l2.1 4.7L31 9.8l-4.9 2.1L24 16.6l-2.1-4.7L17 9.8l4.9-2.1L24 3z"
        fill="currentColor"
      />
      {/* arch */}
      <path
        d="M6.5 36c0-9.7 7.8-17.5 17.5-17.5S41.5 26.3 41.5 36"
        stroke="currentColor"
        strokeWidth="4.2"
        strokeLinecap="round"
      />
      {/* deck */}
      <path d="M4 36h40" stroke="currentColor" strokeWidth="4.2" strokeLinecap="round" />
      {/* centre pier */}
      <path
        d="M24 36V23.5"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
}

export function Logo({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const box = size === "lg" ? "size-12" : size === "sm" ? "size-8" : "size-10";
  const text = size === "lg" ? "text-2xl" : size === "sm" ? "text-base" : "text-lg";

  return (
    <span className={`flex min-w-0 items-center gap-2.5 ${className ?? ""}`}>
      <span
        className={`gradient-brand shadow-glow grid ${box} shrink-0 place-items-center rounded-[0.95rem] text-primary-foreground`}
      >
        <LogoMark className="size-[78%]" />
      </span>
      <span className={`truncate font-display ${text} font-extrabold tracking-tight`}>
        Career<span className="text-gradient">Setu</span>
      </span>
    </span>
  );
}
