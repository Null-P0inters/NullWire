import Link from 'next/link';

import { Footer } from '@/components/Footer';
import { GridBackground } from '@/components/GridBackground';
import { Header } from '@/components/Header';
import { creators } from '@/lib/creators';

export default function ContactPage() {
  return (
    <GridBackground>
      <Header />
      <main className="relative z-10 mx-auto flex w-full max-w-6xl grow flex-col px-6 pb-20 pt-32">
        <section className="border border-[color:var(--border-soft)] bg-[color:var(--panel)]/85 p-8 shadow-lg shadow-[color:var(--shadow-primary)]/40 backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[color:var(--text-muted)]">Contact</p>
          <h1 className="mt-4 text-3xl font-semibold text-[color:var(--text-primary)]">Reach the Nullwire Trust Desk</h1>
          <p className="mt-3 max-w-2xl text-sm text-[color:var(--text-secondary)]">
            Operators can escalate incidents, request onboarding, or hand off forensic packages through trusted channels.
            The core maintainers respond fastest through their GitHub profiles linked below.
          </p>
          <div className="mt-6 flex flex-col gap-3 text-sm text-[color:var(--text-secondary)]">
            <span className="uppercase tracking-[0.3em] text-[color:var(--text-muted)]">GitHub Maintainers</span>
            <div className="grid gap-3 sm:grid-cols-3">
              {creators.map((creator) => (
                <Link
                  key={creator.href}
                  href={creator.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={`Open ${creator.name}'s GitHub profile`}
                  className="group flex items-center justify-between gap-4 border border-[color:var(--border-soft)] bg-[color:var(--panel-soft)] px-4 py-3 shadow-[4px_4px_0_0_var(--shadow-primary)] transition hover:border-[color:var(--border-strong)] hover:bg-[color:var(--panel-alt)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--border-strong)]"
                >
                  <span className="flex items-center gap-3 text-[color:var(--text-secondary)] transition group-hover:text-[color:var(--text-primary)]">
                    <img
                      src={creator.image}
                      alt={creator.alt}
                      className="size-10 rounded-full border border-[color:var(--border-soft)] shadow-[3px_3px_0_0_var(--shadow-primary)]"
                    />
                    <span className="flex flex-col">
                      <span>{creator.name}</span>
                      <span className="text-[10px] uppercase tracking-[0.35em] text-[color:var(--text-muted)]">GitHub</span>
                    </span>
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.35em] text-[color:var(--text-muted)] transition group-hover:text-[color:var(--text-primary)]">
                    Open {'->'}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </GridBackground>
  );
}
