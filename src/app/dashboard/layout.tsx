'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';

import { Footer } from '@/components/Footer';
import { GridBackground } from '@/components/GridBackground';
import { Header } from '@/components/Header';
import { account } from '@/lib/appwrite';

const consoleItems = [
  { label: 'Device Status', href: '/dashboard' },
  { label: 'Publish Form', href: '/dashboard/publish' },
  { label: 'Blockchain Status', href: '/dashboard/blockchain' },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const verifySession = async () => {
      setIsCheckingSession(true);

      try {
        await account.get();
        if (!isMounted) {
          return;
        }
        setIsAuthorized(true);
      } catch {
        if (!isMounted) {
          return;
        }
        setIsAuthorized(false);
        const target = pathname || '/dashboard';
        router.replace(`/auth?redirect=${encodeURIComponent(target)}`);
      } finally {
        if (isMounted) {
          setIsCheckingSession(false);
        }
      }
    };

    void verifySession();

    const handleAuthChange = () => {
      if (!isMounted) {
        return;
      }
      void verifySession();
    };

    window.addEventListener('appwrite-auth-change', handleAuthChange);

    return () => {
      isMounted = false;
      window.removeEventListener('appwrite-auth-change', handleAuthChange);
    };
  }, [pathname, router]);

  if (isCheckingSession) {
    return (
      <GridBackground>
        <Header />
        <main className="relative z-10 mx-auto flex w-full max-w-6xl grow flex-col px-6 pb-20 pt-32">
          <section className="border border-[color:var(--border-soft)] bg-[color:var(--panel)]/85 p-6 text-sm text-[color:var(--text-secondary)] shadow-[color:var(--shadow-primary)]/30 shadow-lg backdrop-blur">
            Checking Auth Status…
          </section>
        </main>
        <Footer />
      </GridBackground>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <GridBackground>
      <Header />
      <main className="relative z-10 mx-auto flex w-full max-w-6xl grow flex-col px-6 pb-20 pt-32">
        <div className="grid gap-6 lg:grid-cols-[220px,1fr]">
          <aside className="border border-[color:var(--border-soft)] bg-[color:var(--panel)]/85 p-4 shadow-[color:var(--shadow-primary)]/30 shadow-lg backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[color:var(--text-muted)]">Console</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {consoleItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex-1 min-w-[120px] border px-3 py-2 text-left text-xs font-medium uppercase tracking-[0.2em] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--border-strong)] ${
                      isActive
                        ? 'border-[color:var(--border-strong)] bg-[color:var(--panel-alt)] text-[color:var(--text-primary)]'
                        : 'border-[color:var(--border-soft)] bg-[color:var(--panel-soft)] text-[color:var(--text-secondary)] hover:border-[color:var(--border-strong)] hover:bg-[color:var(--panel-alt)] hover:text-[color:var(--text-primary)]'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </aside>
          <section className="flex flex-col gap-6">{children}</section>
        </div>
      </main>
      <Footer />
    </GridBackground>
  );
}
