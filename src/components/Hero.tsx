"use client";

const creators = [
  {
    href: "https://github.com/ImonChakraborty",
    image: "https://avatars.githubusercontent.com/u/135951651?s=96&v=4",
    alt: "GitHub avatar for contributor ImonChakraborty",
  },
  {
    href: "https://github.com/mintRaven-05",
    image: "https://avatars.githubusercontent.com/u/136410764?s=96&v=4",
    alt: "GitHub avatar for contributor mintRaven-05",
  },
  {
    href: "https://github.com/Nilanjan-Mondal",
    image: "https://avatars.githubusercontent.com/u/141814986?s=96&v=4",
    alt: "GitHub avatar for contributor Nilanjan-Mondal",
  },
];

export function Hero() {
  return (
    <section className="relative isolate flex min-h-[70vh] flex-col justify-center gap-12 py-20">
  <div className="pointer-events-none absolute left-0 top-1/2 hidden -translate-x-[150%] -translate-y-1/2 flex-col items-center gap-4 text-[color:var(--text-muted)] sm:flex">
  <span className="pointer-events-auto -rotate-270 -translate-y-15 text-[10px] uppercase tracking-[0.4em] text-[color:var(--text-secondary)]">Created by:</span>
        <div className="pointer-events-auto flex flex-col items-center gap-3">
          {creators.map((creator) => (
            <a
              key={creator.image}
              href={creator.href}
              target="_blank"
              rel="noreferrer noopener"
              className="transition hover:scale-105"
            >
              <img
                src={creator.image}
                alt={creator.alt}
                className="size-12 rounded-full border border-[color:var(--border-soft)] shadow-[4px_4px_0_0_var(--shadow-primary)]"
              />
            </a>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-[color:var(--text-muted)] sm:hidden">
        <span className="text-[color:var(--text-secondary)]">Created by:</span>
        <div className="flex items-center gap-2">
          {creators.map((creator) => (
            <a key={`${creator.href}-mobile`} href={creator.href} target="_blank" rel="noreferrer noopener" className="transition hover:scale-105">
              <img
                src={creator.image}
                alt={creator.alt}
                className="size-8 rounded-full border border-[color:var(--border-soft)] shadow-[3px_3px_0_0_var(--shadow-primary)]"
              />
            </a>
          ))}
        </div>
      </div>

      <div className="inline-flex max-w-max items-center gap-3 border border-[color:var(--border-soft)] bg-[color:var(--panel)] px-4 py-2 text-xs uppercase tracking-[0.3em] text-[color:var(--ctp-amber-strong)] shadow-[0_0_0_1px_var(--border-strong)]">
        <span className="size-2 rounded-full bg-[color:var(--ctp-amber)]" />
        Firmware lineage • Zero-trust delivery
      </div>

      <h1 className="max-w-4xl text-balance text-5xl font-semibold leading-tight text-[color:var(--text-primary)] sm:text-6xl">
        Prove every firmware image leaving your pipeline.
        <span className="relative ml-3 inline-flex items-center px-2 text-[color:var(--ctp-amber-strong)]">
          <span className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[color:var] to-transparent" />
          Nullwire notarizes every release.
        </span>
      </h1>

      <p className="max-w-2xl text-pretty text-lg leading-relaxed text-[color:var(--text-secondary)]">
        Nullwire anchors your binary provenance to an immutable ledger, emits compliance-grade reports, and
        keeps compromised firmware from ever reaching production fleets.
      </p>

      <div className="grid gap-4 text-sm text-[color:var(--text-secondary)] sm:grid-cols-2">
        <div className="flex flex-col gap-2 border border-[color:var(--border-soft)] bg-[color:var(--panel-soft)] px-5 py-4 shadow-[6px_6px_0_0_var(--shadow-primary)]">
          <span className="text-xs uppercase tracking-[0.3em] text-[color:var(--text-muted)]">Why teams choose Nullwire</span>
          <p className="text-pretty">
            Automated attestation streamlines secure release reviews while preserving the audit trail needed for
            regulatory disclosure.
          </p>
        </div>
        <div className="flex flex-col gap-2 border border-[color:var(--border-soft)] bg-[color:var(--panel-soft)] px-5 py-4 shadow-[6px_6px_0_0_var(--shadow-primary)]">
          <span className="text-xs uppercase tracking-[0.3em] text-[color:var(--text-muted)]">Operational insight</span>
          <p className="text-pretty">
            Real-time lineage dashboards expose which teams signed what and surface anomalies before firmware leaves staging.
          </p>
        </div>
      </div>
    </section>
  );
}
