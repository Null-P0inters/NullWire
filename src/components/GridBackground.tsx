"use client";

interface GridBackgroundProps {
  children: React.ReactNode;
}

export function GridBackground({ children }: GridBackgroundProps) {
  return (
    <div
      className="group relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-b from-[color:var(--ctp-crust)] via-[color:var(--ctp-mantle)] to-[color:var(--ctp-base)] text-[color:var(--text-primary)] [--grid-cell:64px]"
    >
      {/* Faint grid: Removed [background-position:center] 
        to fix the "repeating segments" issue.
      */}
      <div className="pointer-events-none absolute inset-0 opacity-30 transition-opacity duration-500 group-hover:opacity-50 [background-image:linear-gradient(var(--grid-line)_1px,transparent_1px),linear-gradient(90deg,var(--grid-line)_1px,transparent_1px)] [background-size:var(--grid-cell)_var(--grid-cell)]" />
      
      {/* Strong grid: Also removed [background-position:center] 
        for seamless alignment.
      */}
      <div className="pointer-events-none absolute inset-0 opacity-25 transition-opacity duration-500 group-hover:opacity-40 [background-image:linear-gradient(var(--grid-line-strong)_1px,transparent_1px),linear-gradient(90deg,var(--grid-line-strong)_1px,transparent_1px)] [background-size:calc(var(--grid-cell)*4)_calc(var(--grid-cell)*4)]" />
      
      {/* Glow (unchanged) */}
      <div className="pointer-events-none absolute inset-0 opacity-25 [background:radial-gradient(circle_at_center,var(--grid-glow),transparent_75%)]" />
      
      {/* Content (unchanged) */}
      <div className="relative z-10 flex grow">
        <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--border-strong)] to-transparent" />
        <div className="pointer-events-none absolute inset-x-10 bottom-0 h-px bg-gradient-to-r from-transparent via-[color:var(--border-strong)] to-transparent" />
        <div className="relative flex grow flex-col">{children}</div>
      </div>
    </div>
  );
}