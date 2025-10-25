"use client";

const guarantees = [
  {
    title: "Provable lineage on demand",
    detail:
      "Export cryptographically sealed attestation bundles for every firmware lineage so auditors can replay your entire release in minutes.",
  },
  {
    title: "Policy guardrails that enforce trust",
    detail:
      "Gate deployments on signer roles, CVE posture, and custom business logic. Exceptions are tracked, justified, and timestamped.",
  },
  {
    title: "Regulatory reporting without the scramble",
    detail:
      "Generate SBOM attestations, secure delivery manifests, and executive rollup summaries aligned to NIST and EU CRA expectations.",
  },
];

const signal = [
  {
    metric: "99.98%",
    label: "Pipeline uptime",
  },
  {
    metric: "15 min",
    label: "Median drift detection",
  },
  {
    metric: "0",
    label: "Unsigned releases shipped",
  },
];

export function IntegrityPanel() {
  return (
    <section className="mt-28 flex flex-col gap-8 border border-[color:var(--border-soft)] bg-[color:var(--panel-subtle)] p-10 text-sm text-[color:var(--text-secondary)] shadow-[12px_12px_0_0_var(--shadow-primary)]">
      <header className="flex flex-col gap-2">
        <span className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--text-muted)]">
          Operational guarantees
        </span>
        <h2 className="text-2xl font-semibold text-[color:var(--text-primary)]">
          Trust signals your compliance and firmware teams can share
        </h2>
      </header>

      <ul className="space-y-4">
        {guarantees.map((item) => (
          <li
            key={item.title}
            className="border border-[color:var(--border-soft)] bg-[color:var(--panel)] p-6 shadow-[8px_8px_0_0_var(--shadow-primary)]"
          >
            <h3 className="text-base font-semibold text-[color:var(--text-primary)]">{item.title}</h3>
            <p className="mt-2 text-sm">{item.detail}</p>
          </li>
        ))}
      </ul>

      <div className="grid gap-3 text-xs uppercase tracking-[0.25em] text-[color:var(--text-muted)] sm:grid-cols-3">
        {signal.map((item) => (
          <div key={item.label} className="border border-[color:var(--border-soft)] bg-[color:var(--panel)] px-4 py-6 text-center shadow-[8px_8px_0_0_var(--shadow-primary)]">
            <div className="text-2xl font-semibold tracking-tight text-[color:var(--text-primary)]">
              {item.metric}
            </div>
            <div className="mt-2 text-[11px] text-[color:var(--text-muted)]">{item.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
