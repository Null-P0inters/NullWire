"use client";

import Link from "next/link";

export function CallToAction() {
  return (
    <section
      id="contact"
      className="relative mt-32 overflow-hidden border border-[color:var(--border-soft)] bg-[color:var(--panel-subtle)] p-12 text-center text-[color:var(--text-secondary)] shadow-[14px_14px_0_0_var(--shadow-primary)]"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--border-strong)] to-transparent" />
      <div className="absolute inset-0 opacity-15 [background:radial-gradient(circle_at_top,rgba(250,179,135,0.28),transparent_65%)]" />

      <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-6 text-[color:var(--text-primary)]">
        <span className="rounded-none border border-[color:var(--border-strong)] bg-[color:var(--panel-elevated)] px-4 py-1 text-xs uppercase tracking-[0.3em] text-[color:var(--accent-amber)]">
          Ready to secure
        </span>
        <h2 className="text-balance text-3xl font-semibold leading-snug sm:text-4xl">
          Validate every firmware deployment with a cryptographic paper trail.
        </h2>
        <p className="text-pretty text-base text-[color:var(--text-secondary)] sm:text-lg">
          Nullwire notarizes every binary, automatically attesting provenance and integrity so your teams ship trusted updates with confidence.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-none border border-[color:var(--border-strong)] bg-[color:var(--accent-amber)] px-6 py-3 text-sm font-semibold text-[color:var(--text-primary)] transition hover:bg-[color:var(--accent-amber-strong)]"
          >
            Talk with our team
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-none border border-[color:var(--border-soft)] px-6 py-3 text-sm font-semibold text-[color:var(--text-secondary)] transition hover:text-[color:var(--text-primary)]"
          >
            Launch console
          </Link>
        </div>
      </div>

      <div className="pointer-events-none absolute -inset-20 opacity-20 [background:radial-gradient(circle_at_center,rgba(148,226,213,0.35),transparent_65%)]" />
    </section>
  );
}
