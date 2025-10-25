
'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { account } from '@/lib/appwrite';
import { GridBackground } from '@/components/GridBackground';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

type CallbackState = 'pending' | 'success' | 'error';

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<CallbackSuspense />}>
      <AuthCallbackContent />
    </Suspense>
  );
}

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const userId = searchParams.get('userId');
  const secret = searchParams.get('secret');
  const missingCredentials = !userId || !secret;

  const [state, setState] = useState<CallbackState>('pending');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (missingCredentials || !userId || !secret) {
      return;
    }

    let cancelled = false;

    const finalize = async () => {
      try {
        await account.createSession({ userId, secret });
        if (cancelled) {
          return;
        }
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('appwrite-auth-change'));
        }
        setState('success');
        router.replace('/auth?status=google-success');
      } catch (error) {
        if (cancelled) {
          return;
        }
        setState('error');
        const message = error instanceof Error ? error.message : 'Unable to complete Google authentication.';
        setErrorMessage(message);
      }
    };

    finalize();

    return () => {
      cancelled = true;
    };
  }, [missingCredentials, router, secret, userId]);

  if (missingCredentials) {
    return (
      <CallbackLayout
        headline="Google Sign-In Failed"
        description="Missing credentials from Google OAuth response. Please initiate the authentication flow again."
        showRetry
      />
    );
  }

  const headline =
    state === 'pending'
      ? 'Finalizing Google Sign-In'
      : state === 'success'
        ? 'Google Sign-In Complete'
        : 'Google Sign-In Failed';

  const description =
    state === 'pending'
      ? 'We are exchanging your Google grant for an Appwrite session. Hold tight…'
      : state === 'success'
        ? 'You are being redirected back to the authentication console.'
        : errorMessage ?? 'We could not validate your Google credential. Please try again.';

  return <CallbackLayout headline={headline} description={description} showRetry={state === 'error'} />;
}

function CallbackLayout({
  headline,
  description,
  showRetry,
}: {
  headline: string;
  description: string;
  showRetry?: boolean;
}) {
  return (
    <GridBackground>
      <Header />
      <main className="relative z-10 mx-auto flex w-full max-w-3xl grow flex-col px-6 pb-20 pt-32 text-center">
        <div className="rounded-2xl border border-[color:var(--border-soft)] bg-[color:var(--panel)]/90 p-10 shadow-lg shadow-[color:var(--shadow-primary)]/40 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.35em] text-[color:var(--text-muted)]">OAuth handoff</p>
          <h1 className="mt-4 text-3xl font-semibold text-[color:var(--text-primary)]">{headline}</h1>
          <p className="mt-3 text-sm text-[color:var(--text-secondary)]">{description}</p>
          {showRetry ? (
            <div className="mt-6 flex flex-col items-center gap-3">
              <Link
                href="/auth"
                className="inline-flex items-center justify-center rounded-lg border border-[color:var(--border-strong)] bg-[color:var(--panel-alt)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-[color:var(--text-primary)] transition hover:border-[color:var(--border-strong)]/80"
              >
                Return to Auth Console
              </Link>
              <p className="text-xs text-[color:var(--text-muted)]">
                Need help? <span className="text-[color:var(--border-strong)]">email@email.com</span>
              </p>
            </div>
          ) : null}
        </div>
      </main>
      <Footer />
    </GridBackground>
  );
}

function CallbackSuspense() {
  return (
    <CallbackLayout
      headline="Preparing Google Sign-In"
      description="Loading credentials for final verification…"
    />
  );
}
