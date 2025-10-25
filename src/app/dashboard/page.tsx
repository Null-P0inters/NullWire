'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import type { DeviceStatusRecord } from '@/app/api/device-status/route';
import { account } from '@/lib/appwrite';

const partitionSegments = [
  { label: 'Root FS', description: 'Primary root filesystem partition' },
  { label: 'Config Slot', description: 'Device configuration block' },
  { label: 'OTA Slot A', description: 'Primary OTA update slot' },
  { label: 'OTA Slot B', description: 'Secondary OTA update slot' },
];// NOTE: indices 0-3 must align with the partitionHealth array defined in the API route comments.

const controlScripts = [
  'Sync notarized firmware manifest',
  'Rotate device keys',
  'Trigger integrity sweep',
];

const HEALTHY = 'bg-[color:var(--ctp-green)]';
const FAULTED = 'bg-[color:var(--ctp-red)]';

type ApiResponse = { data: DeviceStatusRecord | null };

export default function DashboardPage() {
  const [status, setStatus] = useState<DeviceStatusRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appwriteId, setAppwriteId] = useState<string | null>(null);
  const [isCheckingUser, setIsCheckingUser] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      setIsCheckingUser(true);
      try {
        const user = await account.get();
        if (!isMounted) {
          return;
        }
        setAppwriteId(user.$id);
      } catch {
        if (!isMounted) {
          return;
        }
        setAppwriteId(null);
      } finally {
        if (isMounted) {
          setIsCheckingUser(false);
        }
      }
    };

    void loadUser();

    return () => {
      isMounted = false;
    };
  }, []);

  const fetchStatus = useCallback(async () => {
    if (!appwriteId) {
      return;
    }

    try {
      setError(null);
      const response = await fetch(`/api/device-status?appwriteId=${encodeURIComponent(appwriteId)}`, {
        cache: 'no-store',
      });
      if (!response.ok) {
        throw new Error(`Unexpected response ${response.status}`);
      }

      const payload = (await response.json()) as ApiResponse;
      const deviceData = payload.data;
      
      if (deviceData) {
        setStatus(deviceData);
      } else {
        setStatus(null);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to load device status';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [appwriteId]);

  useEffect(() => {
    if (!appwriteId) {
      return;
    }

    void fetchStatus();

    const interval = setInterval(() => {
      void fetchStatus();
    }, 15000);

    return () => clearInterval(interval);
  }, [appwriteId, fetchStatus]);

  useEffect(() => {
    if (!isCheckingUser && !appwriteId) {
      setIsLoading(false);
      setStatus(null);
      setError('No Appwrite session found. Authenticate to view device status.');
    }
  }, [appwriteId, isCheckingUser]);

  const partitionHealth = useMemo(() => {
    if (!status) {
      return partitionSegments.map((segment) => ({ ...segment, state: 'unknown' as const }));
    }

    return partitionSegments.map((segment, idx) => {
      const state = status.partitionHealth[idx];
      if (state === 1) {
        return { ...segment, state: 'healthy' as const };
      }
      if (state === 0) {
        return { ...segment, state: 'faulted' as const };
      }
      return { ...segment, state: 'unknown' as const };
    });
  }, [status]);

  const statusSummary = useMemo(() => {
    if (!status) {
      return [
        'Awaiting telemetry. Post to /api/device-status to populate this console.',
        'Manufacturer, wallet bindings, and Appwrite identity will appear once a device checks in.',
      ];
    }

    return [
      `Status: ${status.statusInfo}`,
      `Manufacturer ID: ${status.manufacturerId}`,
      `Wallet ID: ${status.walletId}`,
      `Appwrite ID: ${status.appwriteId}`,
    ];
  }, [status]);

  const ledgerEvents = useMemo(() => {
    if (!status) {
      return [
        { id: '—', status: 'Idle', detail: 'No integrity hash recorded yet.' },
        { id: '—', status: 'Idle', detail: 'Wallet binding pending device check-in.' },
      ];
    }

    return [
      {
        id: status.hash,
        status: 'Integrity Hash',
        detail: `Latest notarized hash reported at ${status.receivedAt}.`,
      },
      {
        id: status.walletId,
        status: 'Wallet Binding',
        detail: `Publishing wallet ${status.walletId} associated with this device.`,
      },
      {
        id: status.appwriteId,
        status: 'Operator Identity',
        detail: `Appwrite operator reference ${status.appwriteId}.`,
      },
    ];
  }, [status]);

  const lastUpdated = status?.receivedAt ? new Date(status.receivedAt).toLocaleString() : null;

  return (
    <>
      <header className="border border-[color:var(--border-soft)] bg-[color:var(--panel)]/85 p-6 shadow-[color:var(--shadow-primary)]/30 shadow-lg backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[color:var(--text-muted)]">Connected Device</p>
        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[color:var(--text-primary)]">
              {status?.deviceName ?? 'No device telemetry yet'}
            </h1>
            <p className="mt-2 text-sm text-[color:var(--text-secondary)]">
              {status
                ? `Device ID ${status.deviceId} · Firmware ${status.firmwareVersion}`
                : 'Push a POST payload to /api/device-status to populate this dashboard.'}
            </p>
          </div>
          <div className="border border-[color:var(--border-soft)] bg-[color:var(--panel-soft)] px-4 py-2 text-xs uppercase tracking-[0.3em] text-[color:var(--text-secondary)]">
            {lastUpdated ? `Updated ${lastUpdated}` : isLoading ? 'Checking…' : 'Waiting for update'}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-[color:var(--text-secondary)]">
          {error ? <span className="text-[color:var(--ctp-red-strong)]">{error}</span> : null}
          <button
            type="button"
            className="border border-[color:var(--border-soft)] bg-[color:var(--panel-soft)] px-3 py-2 text-[11px] uppercase tracking-[0.3em] text-[color:var(--text-secondary)] transition hover:border-[color:var(--border-strong)] hover:bg-[color:var(--panel-alt)] hover:text-[color:var(--text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--border-strong)]"
            onClick={() => {
              setIsLoading(true);
              void fetchStatus();
            }}
          >
            Refresh Status
          </button>
        </div>
      </header>

      <div className="grid gap-6">
        <div className="grid gap-6 lg:grid-cols-12">
          <section className="lg:col-span-7 border border-[color:var(--border-soft)] bg-[color:var(--panel)]/85 p-6 shadow-[color:var(--shadow-primary)]/30 shadow-lg backdrop-blur">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[color:var(--text-muted)]">Partition Health</p>
              <span className="text-xs text-[color:var(--text-secondary)]">Green = healthy · Red = needs attention</span>
            </div>
            <div className="mt-6 grid gap-6 sm:grid-cols-3">
              {partitionHealth.map((partition) => {
                const tone =
                  partition.state === 'healthy'
                    ? HEALTHY
                    : partition.state === 'faulted'
                      ? FAULTED
                      : 'bg-[color:var(--panel-subtle)]';

                return (
                  <div key={partition.label} className="flex flex-col gap-2">
                    <div className={`h-32 w-full border border-[color:var(--border-soft)] ${tone}`} />
                    <div className="flex flex-col text-[11px] uppercase tracking-[0.2em] text-[color:var(--text-muted)]">
                      <span>{partition.label}</span>
                      <span className="text-[color:var(--text-secondary)] normal-case tracking-normal text-[10px]">
                        {partition.description}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="lg:col-span-5 border border-[color:var(--border-soft)] bg-[color:var(--panel)]/85 p-6 shadow-[color:var(--shadow-primary)]/30 shadow-lg backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[color:var(--text-muted)]">Status Info</p>
            <ul className="mt-4 space-y-3 text-sm text-[color:var(--text-secondary)]">
              {statusSummary.map((entry) => (
                <li key={entry}>{entry}</li>
              ))}
            </ul>
          </section>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          <section className="lg:col-span-5 border border-[color:var(--border-soft)] bg-[color:var(--panel)]/85 p-6 shadow-[color:var(--shadow-primary)]/30 shadow-lg backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[color:var(--text-muted)]">Device Control Buttons</p>
            <div className="mt-4 grid gap-3">
              {controlScripts.map((script) => (
                <button
                  key={script}
                  type="button"
                  className="flex items-center justify-between border border-[color:var(--border-soft)] bg-[color:var(--panel-soft)] px-4 py-3 text-left text-sm text-[color:var(--text-secondary)] transition hover:border-[color:var(--border-strong)] hover:bg-[color:var(--panel-alt)] hover:text-[color:var(--text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--border-strong)]"
                  disabled={!status}
                >
                  <span>{script}</span>
                  <span className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--text-muted)]">
                    {status ? 'Execute' : 'Awaiting device'}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="lg:col-span-7 border border-[color:var(--border-soft)] bg-[color:var(--panel)]/85 p-6 shadow-[color:var(--shadow-primary)]/30 shadow-lg backdrop-blur">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[color:var(--text-muted)]">Blockchain Status Info</p>
              <span className="text-xs text-[color:var(--text-secondary)]">
                {status ? 'Wallet link active' : 'Wallet pending device check-in'}
              </span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {ledgerEvents.map((event) => (
                <div
                  key={event.id + event.status}
                  className="border border-[color:var(--border-soft)] bg-[color:var(--panel-soft)]/80 px-4 py-3 text-sm text-[color:var(--text-secondary)]"
                >
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.3em] text-[color:var(--text-muted)]">
                    <span>{event.status}</span>
                    <span>{status ? 'Reported' : 'Idle'}</span>
                  </div>
                  <p className="mt-2 break-all text-[color:var(--text-primary)]">{event.id}</p>
                  <p className="text-xs text-[color:var(--text-secondary)]">{event.detail}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
