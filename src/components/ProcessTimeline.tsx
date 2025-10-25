"use client";

const steps = [
  {
    tag: "01",
    label: "Source control",
    title: "Developers commit firmware to a signed repository",
    description:
      "Nullwire captures metadata, calculates a reproducible digest, and mints a provenance claim the moment code lands on protected branches.",
  },
  {
    tag: "02",
    label: "Build + attest",
    title: "CI compiles binaries with attestation sidecars",
    description:
      "We inject attestor containers that seal SBOMs, test summaries, and signing proofs into an immutable evidence bundle bound to your release candidate.",
  },
  {
    tag: "03",
    label: "Policy gate",
    title: "Security reviews approve or reject promotion",
    description:
      "Policy-as-code rules check signer roles, dependency posture, and custom risk signals before notarizing the build for fleet delivery.",
  },
  {
    tag: "04",
    label: "Fleet observe",
    title: "Deployment telemetry confirms integrity in the wild",
    description:
      "Deployed devices validate manifests against the ledger. Drift and unsigned rollouts raise alerts with remediation guidance.",
  },
];

export function ProcessTimeline() {
  return (
    <section className="relative border border-[color:var(--border-soft)] bg-[color:var(--panel-subtle)] p-10 text-[color:var(--text-secondary)] shadow-[12px_12px_0_0_var(--shadow-primary)]">
      <div className="absolute left-12 top-12 bottom-12 w-px bg-gradient-to-b from-[color:var] via-[color:var] to-transparent" />
      <header className="mb-12 flex flex-col gap-2">
        <span className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--text-muted)]">
          Release timeline
        </span>
        <h2 className="text-2xl font-semibold text-[color:var(--text-primary)]">
          How Nullwire notarizes your firmware supply chain
        </h2>
      </header>
      <ol className="space-y-9">
        {steps.map((step, index) => (
          <li key={step.tag} className="timeline-step relative pl-16">
            <span className="absolute left-0 top-[6px] inline-flex size-12 items-center justify-center border border-[color:var(--border-strong)] bg-[color:var(--panel)] text-xs font-semibold tracking-[0.2em] text-[color:var(--ctp-amber-strong)]">
              {step.tag}
            </span>
            <div className="flex flex-col gap-2 border border-[color:var(--border-soft)] bg-[color:var(--panel)] p-6 text-sm text-[color:var(--text-secondary)] shadow-[8px_8px_0_0_var(--shadow-primary)]">
              <span className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--text-muted)]">
                {step.label}
              </span>
              <h3 className="text-lg font-semibold text-[color:var(--text-primary)]">{step.title}</h3>
              <p>{step.description}</p>
            </div>
            {index < steps.length - 1 ? (
              <span className="absolute left-5 top-full h-9 w-px bg-[color:var]" />
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
