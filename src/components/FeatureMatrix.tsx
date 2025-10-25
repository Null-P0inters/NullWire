"use client";

const features = [
  {
    title: "Pipeline control",
    headline: "Hardware-backed attestation for every commit",
    description:
      "Gate firmware promotion on signed evidence bundles. Nullwire injects policy checks into your existing CI without slowing deploys.",
    stats: ["GitOps signing hooks", "HSM + KMS key support", "Policy-as-code approvals"],
  },
  {
    title: "Evidence vault",
    headline: "Tamper-evident ledger with instant recall",
    description:
      "All provenance artifacts are fingerprinted, hashed, and immutably stored so auditors can reconstruct your release story in seconds.",
    stats: ["Immutable transparency log", "SBOM + CVE correlation", "Exportable audit packages"],
  },
  {
    title: "Fleet telemetry",
    headline: "Runtime insight across staged and active devices",
    description:
      "Push notarized manifests to downstream fleets and watch drift, rollbacks, and unsigned binaries surface in real time dashboards.",
    stats: ["Device drift alerts", "Release blast radius map", "Service-level guardrails"],
  },
];

export function FeatureMatrix() {
  return (
    <section className="mt-24 grid gap-8 lg:grid-cols-3">
  {features.map((feature, index) => (
        <article
          key={`${feature.title}-${index}`}
          className="feature-card group relative flex flex-col gap-6 border border-[color:var(--border-soft)] bg-[color:var(--panel)] p-8 text-sm text-[color:var(--text-secondary)] shadow-[10px_10px_0_0_var(--shadow-primary)] transition duration-200 hover:border-[color:var(--border-strong)] hover:shadow-[12px_12px_0_0_var(--shadow-accent)]"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--border-strong)] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-[color:var(--border-strong)] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <header className="flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--text-muted)]">
              {feature.title}
            </span>
            <h3 className="text-xl font-semibold text-[color:var(--text-primary)]">
              {feature.headline}
            </h3>
          </header>
          <p>{feature.description}</p>
          <ul className="mt-auto space-y-2 text-xs uppercase tracking-[0.25em] text-[color:var(--text-muted)]">
            {feature.stats.map((detail) => (
              <li
                key={detail}
                className="flex items-center gap-3 border border-[color:var(--border-soft)] bg-[color:var(--panel-soft)] px-3 py-3 text-[11px] shadow-[4px_4px_0_0_var(--shadow-primary)]"
              >
                <span className="size-1.5 bg-[color:var(--ctp-amber)]" />
                <span className="truncate text-[color:var(--text-secondary)]">{detail}</span>
              </li>
            ))}
          </ul>
        </article>
      ))}
    </section>
  );
}
