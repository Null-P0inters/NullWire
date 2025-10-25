const validatorSet = [
  { name: 'Validator 8', status: 'online', latency: '1.8s', lastBlock: '#5,203,118' },
  { name: 'Validator 12', status: 'online', latency: '2.4s', lastBlock: '#5,203,118' },
  { name: 'Validator 03', status: 'syncing', latency: '5.6s', lastBlock: '#5,203,102' },
  { name: 'Validator 21', status: 'offline', latency: '—', lastBlock: '#5,202,998' },
];

const notarizationFeed = [
  { id: '0x9de1', type: 'FirmwareHash', state: 'Confirmed', time: '12s ago' },
  { id: '0xa3f4', type: 'RevocationList', state: 'Pending', time: '38s ago' },
  { id: '0x7bc2', type: 'Attestation', state: 'Confirmed', time: '2m ago' },
  { id: '0x6fd8', type: 'FirmwareHash', state: 'Failed', time: '6m ago' },
];

export default function BlockchainStatusPage() {
  return (
    <>
      <header className="border border-[color:var(--border-soft)] bg-[color:var(--panel)]/85 p-6 shadow-[color:var(--shadow-primary)]/30 shadow-lg backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[color:var(--text-muted)]">Ledger Telemetry</p>
        <div className="mt-3 grid gap-4 text-sm text-[color:var(--text-secondary)] sm:grid-cols-2">
          <div>
            <span className="block text-[11px] uppercase tracking-[0.3em] text-[color:var(--text-muted)]">Network</span>
            <span className="text-[color:var(--text-primary)]">Sepolia Testnet · Chain ID 11155111</span>
          </div>
          <div>
            <span className="block text-[11px] uppercase tracking-[0.3em] text-[color:var(--text-muted)]">Wallet Status</span>
            <span className="text-[color:var(--text-primary)]">Wallet connected · Session valid</span>
          </div>
        </div>
      </header>

      <div className="grid gap-6">
        <section className="border border-[color:var(--border-soft)] bg-[color:var(--panel)]/85 p-6 shadow-[color:var(--shadow-primary)]/30 shadow-lg backdrop-blur">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[color:var(--text-muted)]">Finality Snapshot</p>
            <span className="text-xs text-[color:var(--text-secondary)]">All figures are static placeholders</span>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Latest Block', value: '#5,203,119' },
              { label: 'Avg Finality', value: '11.4s' },
              { label: 'Gas Price', value: '15 gwei' },
              { label: 'Sync Drift', value: '+1 block' },
            ].map((metric) => (
              <div key={metric.label} className="border border-[color:var(--border-soft)] bg-[color:var(--panel-soft)]/80 px-4 py-4">
                <span className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--text-muted)]">{metric.label}</span>
                <p className="mt-2 text-lg font-semibold text-[color:var(--text-primary)]">{metric.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border border-[color:var(--border-soft)] bg-[color:var(--panel)]/85 p-6 shadow-[color:var(--shadow-primary)]/30 shadow-lg backdrop-blur">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[color:var(--text-muted)]">Validator Health</p>
            <span className="text-xs text-[color:var(--text-secondary)]">Dummy fleet for UI scaffolding</span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {validatorSet.map((validator) => {
              const tone =
                validator.status === 'online'
                  ? 'border-[color:var(--ctp-green)]/55 text-[color:var(--ctp-green-strong)]'
                  : validator.status === 'syncing'
                    ? 'border-[color:var(--border-strong)] text-[color:var(--ctp-amber-strong)]'
                    : 'border-[color:var(--ctp-red)] text-[color:var(--ctp-red-strong)]';

              return (
                <div key={validator.name} className={`border bg-[color:var(--panel-soft)]/75 px-4 py-3 text-sm text-[color:var(--text-secondary)] ${tone}`}>
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.3em] text-[color:var(--text-muted)]">
                    <span>{validator.name}</span>
                    <span>{validator.status}</span>
                  </div>
                  <p className="mt-2">Latency {validator.latency}</p>
                  <p>Last block {validator.lastBlock}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="border border-[color:var(--border-soft)] bg-[color:var(--panel)]/85 p-6 shadow-[color:var(--shadow-primary)]/30 shadow-lg backdrop-blur">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[color:var(--text-muted)]">Notarization Feed</p>
            <span className="text-xs text-[color:var(--text-secondary)]">Represents mocked inbound webhook events</span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {notarizationFeed.map((event) => {
              const tone =
                event.state === 'Confirmed'
                  ? 'border-[color:var(--ctp-green)]/60 text-[color:var(--ctp-green-strong)]'
                  : event.state === 'Pending'
                    ? 'border-[color:var(--border-strong)] text-[color:var(--ctp-amber-strong)]'
                    : 'border-[color:var(--ctp-red)] text-[color:var(--ctp-red-strong)]';

              return (
                <div key={event.id} className={`border bg-[color:var(--panel-soft)]/75 px-3 py-3 text-sm text-[color:var(--text-secondary)] ${tone}`}>
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.3em] text-[color:var(--text-muted)]">
                    <span>{event.type}</span>
                    <span>{event.state}</span>
                  </div>
                  <p className="mt-2 text-[color:var(--text-primary)]">{event.id}</p>
                  <p className="text-xs text-[color:var(--text-secondary)]">Received {event.time}</p>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}
