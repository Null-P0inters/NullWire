"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FiUser } from "react-icons/fi";

import { account } from "@/lib/appwrite";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Contact", href: "/contact" },
];

export function Header() {
  const [checkedAuth, setCheckedAuth] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        const user = await account.get();
        if (mounted) {
          setUserEmail(user.email ?? user.name ?? null);
          setIsAuthenticated(true);
        }
      } catch {
        if (mounted) {
          setUserEmail(null);
          setIsAuthenticated(false);
        }
      } finally {
        if (mounted) {
          setCheckedAuth(true);
        }
      }
    };

    checkAuth();

    const handleAuthChange = () => {
      if (!mounted) {
        return;
      }
      setCheckedAuth(false);
      checkAuth();
    };

    window.addEventListener("appwrite-auth-change", handleAuthChange);

    return () => {
      mounted = false;
      window.removeEventListener("appwrite-auth-change", handleAuthChange);
    };
  }, []);

  return (
    <header className="header-wrapper border-b border-[color:var(--border-soft)] bg-[color:var(--header-glass)] backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <Link
          href="/"
          className="header-fade text-sm font-semibold uppercase tracking-[0.35em] text-[color:var(--text-primary)]"
        >
          Nullwire
        </Link>
        <nav className="header-fade hidden items-center gap-6 text-xs uppercase tracking-[0.35em] text-[color:var(--text-muted)] sm:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="nav-item group relative px-2 py-1 transition duration-200 hover:text-[color:var(--text-primary)]"
            >
              <span>{item.label}</span>
              <span className="pointer-events-none absolute inset-x-1 bottom-0 h-px origin-center scale-x-0 bg-[color:var(--border-strong)] transition duration-200 group-hover:scale-x-100" />
            </Link>
          ))}
        </nav>
        <div className="header-fade flex items-center gap-4">
          <Link
            href="/auth"
            title={isAuthenticated && userEmail ? `Signed in as ${userEmail}` : undefined}
            className="inline-flex min-w-[12.5rem] items-center justify-center gap-2 border border-[color:var(--border-soft)] bg-[color:var(--panel-soft)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-[color:var(--text-secondary)] transition duration-200 hover:border-[color:var(--border-strong)] hover:bg-[color:var(--panel-alt)] hover:text-[color:var(--text-primary)]"
          >
            {checkedAuth ? (
              isAuthenticated ? (
                <span className="inline-flex items-center gap-2">
                  <FiUser aria-hidden="true" className="size-4" />
                  <span>Account</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <span aria-hidden="true" className="size-2 rounded-full bg-[color:var(--border-soft)]" />
                  <span>Authenticate</span>
                </span>
              )
            ) : (
              <span className="inline-flex items-center gap-2">
                <span aria-hidden="true" className="size-2 animate-pulse rounded-full bg-[color:var(--border-soft)]" />
                <span>Checking…</span>
              </span>
            )}
            {isAuthenticated && userEmail ? (
              <span className="sr-only">Signed in as {userEmail}</span>
            ) : null}
          </Link>
        </div>
      </div>
    </header>
  );
}
