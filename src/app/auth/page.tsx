'use client';

import Link from 'next/link';
import { Suspense, type ChangeEvent, type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Models } from 'appwrite';
import { ID, OAuthProvider } from 'appwrite';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useChainId, useDisconnect, useSwitchChain } from 'wagmi';

import { account } from '@/lib/appwrite';
import { GridBackground } from '@/components/GridBackground';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { FaGoogle } from 'react-icons/fa';
import { appChains } from '@/lib/wagmi';

type MessageTone = 'error' | 'info' | 'success';

type EmailChallenge = {
  userId: string;
  expireAt?: string;
  phrase?: string;
};

export default function AuthPage() {
  return (
    <Suspense fallback={<AuthPageSuspense />}>
      <AuthPageContent />
    </Suspense>
  );
}

function AuthPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [challenge, setChallenge] = useState<EmailChallenge | null>(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isRedirectingOAuth, setIsRedirectingOAuth] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<MessageTone>('info');
  const [currentUser, setCurrentUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const isAuthenticated = Boolean(currentUser);
  const redirectPath = searchParams.get('redirect');
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { disconnectAsync } = useDisconnect();
  const {
    chains: switchableChains,
    switchChainAsync,
    isPending: isSwitchingChain,
  } = useSwitchChain();

  const networkOptions = useMemo(() => {
    return switchableChains.length ? switchableChains : appChains;
  }, [switchableChains]);

  const defaultChainId = useMemo(() => networkOptions[0]?.id ?? appChains[0].id, [networkOptions]);

  const walletSummary = useMemo(() => {
    if (!address) {
      return null;
    }

    return `${address.slice(0, 6)}…${address.slice(-4)}`;
  }, [address]);

  const resetFeedback = useCallback(() => {
    setMessage(null);
    setMessageTone('info');
  }, []);

  const notifyAuthChange = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('appwrite-auth-change'));
    }
  }, []);

  const loadUser = useCallback(async () => {
    try {
      const user = await account.get<Models.Preferences>();
      setCurrentUser(user);
    } catch {
      setCurrentUser(null);
    } finally {
      setIsLoadingUser(false);
    }
  }, []);

  useEffect(() => {
    setIsLoadingUser(true);
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    const status = searchParams.get('status');
    const error = searchParams.get('error');

    if (status === 'google-success') {
      setMessage('Google authentication completed successfully.');
      setMessageTone('success');
      setIsLoadingUser(true);
      loadUser();
      notifyAuthChange();
      router.replace('/auth');
      return;
    }

    if (error) {
      setMessage('Google authentication was cancelled or failed.');
      setMessageTone('error');
    }
  }, [loadUser, notifyAuthChange, router, searchParams]);

  useEffect(() => {
    if (!isAuthenticated || isLoadingUser) {
      return;
    }

    if (redirectPath && redirectPath.startsWith('/')) {
      router.replace(redirectPath);
    }
  }, [isAuthenticated, isLoadingUser, redirectPath, router]);

  const handleRequestOtp = useCallback(
    async (evt: React.FormEvent<HTMLFormElement>) => {
      evt.preventDefault();
      resetFeedback();

      if (currentUser) {
        setMessage('You are already signed in. Sign out to request a new OTP.');
        setMessageTone('info');
        return;
      }

      if (!email.trim()) {
        setMessage('Please enter a valid email address.');
        setMessageTone('error');
        return;
      }

      setIsSendingOtp(true);

      try {
        const token = await account.createEmailToken({
          userId: ID.unique(),
          email: email.trim(),
          phrase: true,
        });

        setChallenge({
          userId: token.userId,
          expireAt: token.expire,
          phrase: (token as Models.Token & { phrase?: string }).phrase,
        });
        setMessage('OTP sent. Check your inbox for the verification code.');
        setMessageTone('success');
        setOtp('');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unable to send OTP. Please try again.';
        setMessage(errorMessage);
        setMessageTone('error');
      } finally {
        setIsSendingOtp(false);
      }
    },
    [currentUser, email, resetFeedback]
  );

  const handleVerifyOtp = useCallback(
    async (evt: React.FormEvent<HTMLFormElement>) => {
      evt.preventDefault();
      resetFeedback();

      if (currentUser) {
        setMessage('You are already signed in. Sign out to verify a different account.');
        setMessageTone('info');
        return;
      }

      if (!challenge) {
        setMessage('Request an OTP before attempting verification.');
        setMessageTone('error');
        return;
      }

      if (!otp.trim()) {
        setMessage('Enter the OTP you received to continue.');
        setMessageTone('error');
        return;
      }

      setIsVerifyingOtp(true);

      try {
        await account.createSession({
          userId: challenge.userId,
          secret: otp.trim(),
        });

        setMessage('Authentication complete. Welcome back.');
        setMessageTone('success');
        setChallenge(null);
        setOtp('');
        setIsLoadingUser(true);
        await loadUser();
        notifyAuthChange();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Invalid OTP. Please try again.';
        setMessage(errorMessage);
        setMessageTone('error');
      } finally {
        setIsVerifyingOtp(false);
      }
    },
    [challenge, currentUser, loadUser, notifyAuthChange, otp, resetFeedback]
  );

  const handleGoogleOAuth = useCallback(() => {
    resetFeedback();
    setIsRedirectingOAuth(true);

    if (currentUser) {
      setMessage('You are already signed in. Sign out to launch a new Google authentication.');
      setMessageTone('info');
      setIsRedirectingOAuth(false);
      return;
    }

    const origin = typeof window !== 'undefined' ? window.location.origin : '';

    if (!origin) {
      setMessage('Unable to determine redirect origin.');
      setMessageTone('error');
      setIsRedirectingOAuth(false);
      return;
    }

    try {
      const result = account.createOAuth2Token({
        provider: OAuthProvider.Google,
        success: `${origin}/auth/callback`,
        failure: `${origin}/auth?error=oauth`,
      });

      if (typeof result === 'string') {
        window.location.href = result;
        return;
      }

      setIsRedirectingOAuth(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unable to start Google OAuth right now.';
      setMessage(errorMessage);
      setMessageTone('error');
      setIsRedirectingOAuth(false);
    }
  }, [currentUser, resetFeedback]);

  const handleLogout = useCallback(async () => {
    resetFeedback();

    try {
      await account.deleteSession('current');
      if (disconnectAsync) {
        try {
          await disconnectAsync();
        } catch (walletError) {
          console.error('Failed to disconnect wallet', walletError);
        }
      }
      setMessage('Signed out.');
      setMessageTone('info');
      setCurrentUser(null);
      notifyAuthChange();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unable to sign out right now.';
      setMessage(errorMessage);
      setMessageTone('error');
    }
  }, [disconnectAsync, notifyAuthChange, resetFeedback]);

  const otpHint = useMemo(() => {
    if (!challenge?.expireAt) {
      return null;
    }

    try {
      const expiry = new Date(challenge.expireAt);
      return `Expires ${expiry.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
    } catch {
      return null;
    }
  }, [challenge]);

  return (
    <GridBackground>
      <Header />
      <main className="relative z-10 mx-auto flex w-full max-w-6xl grow flex-col px-6 pb-16 pt-32">
        <section className="mb-12 flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[color:var(--text-muted)]">Access Control</p>
          <h1 className="text-4xl font-semibold text-[color:var(--text-primary)] md:text-5xl">Verify Your Nullwire Session</h1>
          <p className="max-w-2xl text-sm text-[color:var(--text-secondary)]">
            Pick an email one-time passcode or Google OAuth to step into the integrity console.
          </p>
        </section>

        {message ? (
          <div
            className={`mb-8 border px-4 py-3 text-sm transition ${
              messageTone === 'success'
                ? 'border-[color:var(--border-strong)] bg-[color:var(--panel-soft)] text-[color:var(--text-primary)]'
                : messageTone === 'error'
                  ? 'border-red-400/40 bg-red-400/10 text-red-200'
                  : 'border-[color:var(--border-soft)] bg-[color:var(--panel-subtle)] text-[color:var(--text-secondary)]'
            }`}
            role="status"
          >
            {message}
          </div>
        ) : null}

        <div className="mb-8 border border-[color:var(--border-soft)] bg-[color:var(--panel-soft)]/80 p-6 text-sm text-[color:var(--text-secondary)] backdrop-blur">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--text-muted)]">Session state</p>
              {isLoadingUser ? (
                <p className="mt-1 text-sm text-[color:var(--text-secondary)]">Checking for an active session…</p>
              ) : currentUser ? (
                <p className="mt-1 text-sm text-[color:var(--text-primary)]">
                  Signed in as <span className="font-semibold">{currentUser.email ?? currentUser.name ?? currentUser.$id}</span>
                </p>
              ) : (
                <p className="mt-1 text-sm text-[color:var(--text-secondary)]">Not signed in.</p>
              )}
            </div>
            {currentUser ? (
              <button
                type="button"
                onClick={handleLogout}
                className="border border-[color:var(--border-soft)] bg-transparent px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-[color:var(--text-secondary)] transition hover:border-[color:var(--border-strong)] hover:text-[color:var(--text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--border-strong)]"
              >
                Sign out
              </button>
            ) : null}
          </div>
          <p className="mt-4">
            Need help?{' '}
            <Link
              href="mailto:debjeetbanerjee48@gmail.com"
              className="text-[color:var(--ctp-amber)] underline underline-offset-4 transition hover:text-[color:var(--ctp-amber-strong)]"
            >
              Contact the Nullwire trust desk
            </Link>{' '}
            for manual provisioning.
          </p>
        </div>

        {currentUser ? (
          <div className="mb-8 border border-[color:var(--border-soft)] bg-[color:var(--panel)]/85 p-6 text-sm text-[color:var(--text-secondary)] shadow-[10px_10px_0_0_var(--shadow-primary)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--text-muted)]">Wallet link</p>
                <p className="mt-1 text-sm text-[color:var(--text-secondary)]">
                  {isConnected
                    ? `Wallet link active${walletSummary ? ` (${walletSummary})` : ''}. Ledger notarizations will mirror this session.`
                    : 'Connect a compatible wallet to notarize firmware releases on-ledger.'}
                </p>
              </div>
            </div>
            <div className="mt-6">
              <ConnectButton.Custom>
                {({
                  account,
                  chain,
                  openAccountModal,
                  openChainModal,
                  openConnectModal,
                  mounted,
                  authenticationStatus,
                }) => {
                  const ready = mounted && authenticationStatus !== 'loading';
                  const connected =
                    ready &&
                    account &&
                    chain &&
                    (!authenticationStatus || authenticationStatus === 'authenticated');
                  const fallbackChainId = defaultChainId ?? appChains[0].id;
                  const selectedChainId = String(chain?.id ?? chainId ?? fallbackChainId);
                  const isUnsupported = Boolean(chain?.unsupported);

                  const handleNetworkChange = async (event: ChangeEvent<HTMLSelectElement>) => {
                    const nextChainId = Number(event.target.value);
                    if (Number.isNaN(nextChainId) || nextChainId === Number(selectedChainId)) {
                      return;
                    }

                    if (!ready) {
                      return;
                    }

                    if (!connected) {
                      openConnectModal();
                      return;
                    }

                    const targetChain = networkOptions.find((option) => option.id === nextChainId);
                    if (!targetChain) {
                      return;
                    }

                    try {
                      if (switchChainAsync) {
                        await switchChainAsync({ chainId: targetChain.id });
                      } else {
                        openChainModal();
                      }
                    } catch {
                      openChainModal();
                    }
                  };

                  let buttonContent: ReactNode;

                  if (!ready) {
                    buttonContent = (
                      <button
                        type="button"
                        disabled
                        className="inline-flex items-center justify-center border border-[color:var(--border-soft)] bg-[color:var(--panel-soft)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-[color:var(--text-muted)]"
                      >
                        Connect wallet
                      </button>
                    );
                  } else if (!connected) {
                    buttonContent = (
                      <button
                        type="button"
                        onClick={openConnectModal}
                        className="inline-flex items-center justify-center border border-[color:var(--border-soft)] bg-[color:var(--panel-soft)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-[color:var(--text-secondary)] transition hover:border-[color:var(--border-strong)] hover:bg-[color:var(--panel-alt)] hover:text-[color:var(--text-primary)]"
                      >
                        Connect wallet
                      </button>
                    );
                  } else if (isUnsupported) {
                    buttonContent = (
                      <button
                        type="button"
                        onClick={openChainModal}
                        className="inline-flex items-center justify-center border border-red-400/40 bg-red-500/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-red-100 transition hover:border-red-300/60"
                      >
                        Switch network
                      </button>
                    );
                  } else {
                    buttonContent = (
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={openAccountModal}
                          className="inline-flex items-center justify-center border border-[color:var(--border-soft)] bg-[color:var(--panel-soft)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-[color:var(--text-secondary)] transition hover:border-[color:var(--border-strong)] hover:bg-[color:var(--panel-alt)] hover:text-[color:var(--text-primary)]"
                        >
                          {account.displayName}
                        </button>
                        {account.displayBalance ? (
                          <span className="rounded-full border border-[color:var(--border-soft)] bg-[color:var(--panel-subtle)] px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-[color:var(--text-muted)]">
                            {account.displayBalance}
                          </span>
                        ) : null}
                      </div>
                    );
                  }

                  return (
                    <div
                      {...(!ready && {
                        'aria-hidden': true,
                        style: { opacity: 0, pointerEvents: 'none', userSelect: 'none' },
                      })}
                      className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      {buttonContent}
                      <div className="flex w-full flex-col gap-2 sm:max-w-xs">
                        <label
                          htmlFor="wallet-network-select"
                          className="text-xs uppercase tracking-[0.3em] text-[color:var(--text-muted)]"
                        >
                          Network
                        </label>
                        <select
                          id="wallet-network-select"
                          value={selectedChainId}
                          onChange={handleNetworkChange}
                          disabled={!ready || isSwitchingChain}
                          className="w-full appearance-none border border-[color:var(--border-soft)] bg-[color:var(--panel-soft)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[color:var(--text-secondary)] transition hover:border-[color:var(--border-strong)] focus:border-[color:var(--border-strong)] focus:bg-[color:var(--panel-alt)] focus:outline-none"
                        >
                          {networkOptions.map((option) => (
                            <option key={option.id} value={String(option.id)}>
                              {option.name}
                            </option>
                          ))}
                        </select>
                        {isSwitchingChain ? (
                          <span className="text-xs text-[color:var(--text-muted)]">Switching network…</span>
                        ) : isUnsupported ? (
                          <span className="text-xs text-red-200">Unsupported network selected. Switch to continue.</span>
                        ) : null}
                      </div>
                    </div>
                  );
                }}
              </ConnectButton.Custom>
            </div>
          </div>
        ) : null}

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col justify-between gap-6 border border-[color:var(--border-soft)] bg-[color:var(--panel)]/90 p-6 shadow-lg shadow-[color:var(--shadow-primary)]/40 backdrop-blur">
            <div className="flex flex-col gap-3">
              <h2 className="text-lg font-semibold text-[color:var(--text-primary)]">Authenticate with Google</h2>
              <p className="text-sm text-[color:var(--text-secondary)]">
                Delegate identity to Google Workspace. We&apos;ll return you to Nullwire the moment consent completes.
              </p>
            </div>
            <button
              type="button"
              onClick={handleGoogleOAuth}
              disabled={isRedirectingOAuth || isAuthenticated}
              className="inline-flex items-center justify-center gap-2 border border-[color:var(--border-soft)] bg-[color:var(--panel-soft)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-[color:var(--text-secondary)] transition hover:border-[color:var(--border-strong)] hover:bg-[color:var(--panel-alt)] hover:text-[color:var(--text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--border-strong)] disabled:opacity-60"
            >
              {isRedirectingOAuth ? (
                'Redirecting…'
              ) : isAuthenticated ? (
                'Already authenticated'
              ) : (
                <>
                  <FaGoogle aria-hidden="true" className="size-4" />
                  Continue with Google
                </>
              )}
            </button>
            <p className="text-xs text-[color:var(--text-muted)]">
              You&apos;ll be redirected to Google for consent. On completion we create your Appwrite session and return you
              to this console.
            </p>
          </div>

          <div className="flex flex-col gap-6 border border-[color:var(--border-soft)] bg-[color:var(--panel)]/90 p-6 shadow-lg shadow-[color:var(--shadow-primary)]/40 backdrop-blur">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-[color:var(--text-primary)]">Email + One-Time Passcode</h2>
                <p className="mt-1 text-sm text-[color:var(--text-secondary)]">Generate a code for your operator inbox and exchange it for an Appwrite session.</p>
              </div>
              {otpHint ? <span className="text-xs text-[color:var(--text-muted)]">{otpHint}</span> : null}
            </div>

            <form onSubmit={handleRequestOtp} className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex flex-1 flex-col gap-2">
                <label htmlFor="auth-email" className="text-xs uppercase tracking-[0.3em] text-[color:var(--text-muted)]">
                  Email
                </label>
                <input
                  id="auth-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={isAuthenticated}
                  className="w-full border border-transparent bg-[color:var(--panel-subtle)] px-3 py-2 text-sm text-[color:var(--text-primary)] outline-none transition focus:border-[color:var(--border-strong)] focus:bg-[color:var(--panel-alt)]"
                  placeholder="debjeetbanerjee48@gmail.com"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isSendingOtp || isAuthenticated}
                className="inline-flex items-center justify-center whitespace-nowrap border border-[color:var(--border-soft)] bg-[color:var(--panel-soft)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-[color:var(--text-secondary)] transition hover:border-[color:var(--border-strong)] hover:bg-[color:var(--panel-alt)] hover:text-[color:var(--text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--border-strong)] disabled:opacity-60 sm:self-end"
              >
                {isSendingOtp ? 'Sending…' : 'Send OTP'}
              </button>
            </form>

            <div className="flex flex-col gap-4">
              <p className="text-xs text-[color:var(--text-muted)]">
                {isAuthenticated
                  ? 'Signed-in sessions cannot request a new passcode. Sign out to verify another account.'
                  : 'Enter the six-digit code from your inbox. Each request issues a short-lived, single-use token.'}
              </p>
              <form onSubmit={handleVerifyOtp} className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex flex-1 flex-col gap-2">
                  <label htmlFor="auth-otp" className="text-xs uppercase tracking-[0.3em] text-[color:var(--text-muted)]">
                    One-Time Passcode
                  </label>
                  <input
                    id="auth-otp"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    value={otp}
                    onChange={(event) => setOtp(event.target.value.replace(/\D/g, ''))}
                    disabled={!challenge || isAuthenticated}
                    className="w-full border border-transparent bg-[color:var(--panel-subtle)] px-3 py-2 text-sm text-[color:var(--text-primary)] outline-none transition focus:border-[color:var(--border-strong)] focus:bg-[color:var(--panel-alt)] disabled:opacity-50"
                    placeholder="000000"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={!challenge || isVerifyingOtp || isAuthenticated}
                  className="inline-flex w-full items-center justify-center whitespace-nowrap border border-[color:var(--border-soft)] bg-[color:var(--panel-soft)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-[color:var(--text-secondary)] transition hover:border-[color:var(--border-strong)] hover:bg-[color:var(--panel-alt)] hover:text-[color:var(--text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--border-strong)] disabled:opacity-60 sm:w-auto sm:self-end"
                >
                  {isVerifyingOtp ? 'Verifying…' : 'Verify Code'}
                </button>
              </form>
              {challenge?.phrase ? (
                <p className="border border-[color:var(--border-soft)] bg-[color:var(--panel-subtle)] px-3 py-2 text-xs text-[color:var(--text-secondary)]">
                  Security phrase: <span className="font-semibold text-[color:var(--text-primary)]">{challenge.phrase}</span>
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </GridBackground>
  );
}

function AuthPageSuspense() {
  return (
    <GridBackground>
      <Header />
      <main className="relative z-10 mx-auto flex w-full max-w-6xl grow flex-col px-6 pb-16 pt-32">
        <section className="mb-12 flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[color:var(--text-muted)]">Access Control</p>
          <h1 className="text-4xl font-semibold text-[color:var(--text-primary)] md:text-5xl">Verify Your Nullwire Session</h1>
          <p className="max-w-2xl text-sm text-[color:var(--text-secondary)]">
            Loading authentication options…
          </p>
        </section>
        <section className="border border-[color:var(--border-soft)] bg-[color:var(--panel)]/85 p-6 text-sm text-[color:var(--text-secondary)] shadow-[color:var(--shadow-primary)]/30 shadow-lg backdrop-blur">
          Preparing session details…
        </section>
      </main>
      <Footer />
    </GridBackground>
  );
}
