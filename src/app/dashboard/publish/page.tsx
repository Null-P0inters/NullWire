'use client';

import { useCallback, useMemo, useState } from 'react';

type PublishPayload = {
  deviceId: string;
  firmwareVersion: string;
  firmwareHash: string | null;
  timestamp: string | null;
};

type PublishResponse = {
  message?: unknown;
  error?: unknown;
} | null;

const initialPayload: PublishPayload = {
  deviceId: '',
  firmwareVersion: '',
  firmwareHash: null,
  timestamp: null,
};

export default function PublishFormPage() {
  const [payload, setPayload] = useState(initialPayload);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isHashing, setIsHashing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<'info' | 'success' | 'error'>('info');

  const resetMessage = useCallback(() => {
    setMessage(null);
    setMessageTone('info');
  }, []);

  const computeHash = useCallback(async (file: File) => {
    setIsHashing(true);
    resetMessage();
    try {
      const buffer = await file.arrayBuffer();
      const digest = await crypto.subtle.digest('SHA-256', buffer);
      const view = new DataView(digest);
      let hex = '';
      for (let i = 0; i < view.byteLength; i++) {
        const value = view.getUint8(i);
        hex += value.toString(16).padStart(2, '0');
      }

      setPayload((prev) => ({ ...prev, firmwareHash: hex }));
      setFileName(file.name);
      setMessage('SHA-256 hash generated successfully.');
      setMessageTone('success');
    } catch (error) {
      console.error(error);
      setPayload((prev) => ({ ...prev, firmwareHash: null }));
      setFileName(null);
      setMessage('Unable to generate firmware hash. Try a different file.');
      setMessageTone('error');
    } finally {
      setIsHashing(false);
    }
  }, [resetMessage]);

  const handleFileInput = useCallback(
    async (files: FileList | null) => {
      if (!files || !files.length) {
        return;
      }

      const file = files[0];
      await computeHash(file);
    },
    [computeHash]
  );

  const handleDrop = useCallback(
    async (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      await handleFileInput(event.dataTransfer.files);
    },
    [handleFileInput]
  );

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      resetMessage();

      const deviceId = payload.deviceId.trim();
      const firmwareVersion = payload.firmwareVersion.trim();
      const firmwareHash = payload.firmwareHash;

      if (!deviceId || !firmwareVersion) {
        setMessage('Device ID and firmware version are required before publishing.');
        setMessageTone('error');
        return;
      }

      if (!firmwareHash) {
        setMessage('Attach a firmware file so the SHA-256 hash can be included.');
        setMessageTone('error');
        return;
      }

      setIsSubmitting(true);
      const submittedAt = new Date().toISOString();

      // Ensure the publish endpoint is configured at runtime to satisfy the fetch type
      const endpoint = process.env.NEXT_PUBLIC_PUBLISH_ENDPOINT;
      if (!endpoint) {
        setMessage('Publish endpoint is not configured.');
        setMessageTone('error');
        setIsSubmitting(false);
        return;
      }

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            device_id: deviceId,
            firmware_version: firmwareVersion,
            firmware_hash: firmwareHash,
          }),
        });

        let responseBody: PublishResponse = null;
        try {
          responseBody = (await response.json()) as PublishResponse;
        } catch {
          responseBody = null;
        }

        if (!response.ok) {
          const errorMessage = responseBody?.error
            ? String(responseBody.error)
            : `Publish request failed with status ${response.status}`;
          setMessage(errorMessage);
          setMessageTone('error');
          return;
        }

        const successMessage = responseBody?.message ? String(responseBody.message) : 'Firmware publish queued successfully.';

        setPayload((prev) => ({
          ...prev,
          deviceId,
          firmwareVersion,
          timestamp: submittedAt,
        }));
        setMessage(successMessage);
        setMessageTone('success');
      } catch (error) {
        console.error('Publish request failed', error);
        setMessage('Failed to queue publish job. Please retry.');
        setMessageTone('error');
      } finally {
        setIsSubmitting(false);
      }
    },
    [payload.deviceId, payload.firmwareHash, payload.firmwareVersion, resetMessage]
  );

  const dropLabel = useMemo(() => {
    if (isHashing) {
      return 'Calculating SHA-256…';
    }

    if (fileName && payload.firmwareHash) {
      return `${fileName} • ${payload.firmwareHash.slice(0, 10)}…`;
    }

    return 'Drop .bin file or click to browse';
  }, [fileName, isHashing, payload.firmwareHash]);

  return (
    <>
      <header className="border border-[color:var(--border-soft)] bg-[color:var(--panel)]/85 p-6 shadow-[color:var(--shadow-primary)]/30 shadow-lg backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[color:var(--text-muted)]">Publish Firmware</p>
        <p className="mt-3 text-sm text-[color:var(--text-secondary)]">
          Provide the device identifier, firmware version, and drop the binary so we can derive the hash for the outgoing publish
          request.
        </p>
      </header>

      <section className="border border-[color:var(--border-soft)] bg-[color:var(--panel)]/85 p-6 shadow-[color:var(--shadow-primary)]/30 shadow-lg backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[color:var(--text-muted)]">Release Parameters</p>

        {message ? (
          <div
            className={`mt-4 border px-4 py-3 text-sm ${
              messageTone === 'success'
                ? 'border-[color:var(--border-strong)] bg-[color:var(--panel-soft)] text-[color:var(--text-primary)]'
                : messageTone === 'error'
                  ? 'border-[color:var(--ctp-red)]/70 bg-[color:var(--ctp-red)]/20 text-[color:var(--ctp-red-strong)]'
                  : 'border-[color:var(--border-soft)] bg-[color:var(--panel-subtle)] text-[color:var(--text-secondary)]'
            }`}
            role="status"
          >
            {message}
          </div>
        ) : null}

        <form className="mt-4 grid gap-6" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm text-[color:var(--text-secondary)]">
              <span className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--text-muted)]">Device ID</span>
              <input
                type="text"
                name="deviceId"
                placeholder="device-alpha-17"
                value={payload.deviceId}
                onChange={(event) => setPayload((prev) => ({ ...prev, deviceId: event.target.value }))}
                className="border border-[color:var(--border-soft)] bg-[color:var(--panel-subtle)] px-3 py-2 text-sm text-[color:var(--text-primary)] outline-none transition focus:border-[color:var(--border-strong)] focus:bg-[color:var(--panel-alt)]"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-[color:var(--text-secondary)]">
              <span className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--text-muted)]">Firmware Version</span>
              <input
                type="text"
                name="firmwareVersion"
                placeholder="v1.9.4"
                value={payload.firmwareVersion}
                onChange={(event) => setPayload((prev) => ({ ...prev, firmwareVersion: event.target.value }))}
                className="border border-[color:var(--border-soft)] bg-[color:var(--panel-subtle)] px-3 py-2 text-sm text-[color:var(--text-primary)] outline-none transition focus:border-[color:var(--border-strong)] focus:bg-[color:var(--panel-alt)]"
              />
            </label>
          </div>

          <div
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDrop}
            className="flex cursor-pointer flex-col gap-2 border border-dashed border-[color:var(--border-soft)] bg-[color:var(--panel-subtle)] px-5 py-6 text-center text-sm text-[color:var(--text-secondary)] transition hover:border-[color:var(--border-strong)] hover:bg-[color:var(--panel-alt)]"
          >
            <label className="flex cursor-pointer flex-col gap-2">
              <span className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--text-muted)]">Firmware Binary</span>
              <span>{dropLabel}</span>
              <input
                type="file"
                accept=".bin,.img,.fw"
                className="hidden"
                onChange={(event) => handleFileInput(event.target.files)}
              />
            </label>
          </div>

          {payload.firmwareHash ? (
            <div className="border border-[color:var(--border-soft)] bg-[color:var(--panel-soft)] px-4 py-3 text-xs text-[color:var(--text-secondary)]">
              <p className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--text-muted)]">SHA-256 Hash</p>
              <p className="mt-2 break-all text-sm text-[color:var(--text-primary)]">{payload.firmwareHash}</p>
            </div>
          ) : null}

          <button
            type="submit"
            className="inline-flex items-center justify-center border border-[color:var(--border-soft)] bg-[color:var(--panel-soft)] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.35em] text-[color:var(--text-secondary)] transition hover:border-[color:var(--border-strong)] hover:bg-[color:var(--panel-alt)] hover:text-[color:var(--text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--border-strong)] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isHashing || isSubmitting}
          >
            {isSubmitting ? 'Queuing…' : 'Queue Publish Job'}
          </button>

          {payload.timestamp ? (
            <p className="text-xs text-[color:var(--text-secondary)]">Last queued at {payload.timestamp}</p>
          ) : null}
        </form>
      </section>
    </>
  );
}
