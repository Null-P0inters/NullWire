import { NextResponse } from 'next/server';

export type DeviceStatusRecord = {
  deviceId: string;
  deviceName: string;
  firmwareVersion: string;
  manufacturerId: string;
  walletId: string;
  appwriteId: string;
  hash: string;
  statusInfo: string;
  // Partition index mapping (keep synchronized with dashboard UI):
  // 0 → Root filesystem partition
  // 1 → Configuration slot
  // 2 → OTA slot A
  // 3 → OTA slot B
  partitionHealth: number[];
  receivedAt: string;
};

type DeviceStatusPayload = {
  device_id?: unknown;
  device_name?: unknown;
  firmware_ver?: unknown;
  Manufaturer_id?: unknown;
  WalletID?: unknown;
  Apprwrite_id?: unknown;
  Hash?: unknown;
  status_info?: unknown;
  partition_health?: unknown;
};

const REQUIRED_FIELDS = [
  'device_id',
  'device_name',
  'firmware_ver',
  'Manufaturer_id',
  'WalletID',
  'Apprwrite_id',
  'Hash',
  'status_info',
  'partition_health',
] as const;

type RequiredField = (typeof REQUIRED_FIELDS)[number];

const ensureString = (value: unknown, field: RequiredField): string => {
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }

  throw new Error(`Invalid or missing string field: ${field}`);
};

const ensurePartitionHealth = (value: unknown): number[] => {
  if (!Array.isArray(value)) {
    throw new Error('partition_health must be an array');
  }

  return value.map((entry, idx) => {
    if (entry === 0 || entry === 1) {
      return entry;
    }

    if (typeof entry === 'number') {
      return entry > 0 ? 1 : 0;
    }

    throw new Error(`partition_health index ${idx} must be 0 or 1`);
  });
};

let latestStatus: DeviceStatusRecord | null = null;

export async function POST(request: Request) {
  let payload: DeviceStatusPayload;

  try {
    payload = (await request.json()) as DeviceStatusPayload;
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  try {
    const record: DeviceStatusRecord = {
      deviceId: ensureString(payload.device_id, 'device_id'),
      deviceName: ensureString(payload.device_name, 'device_name'),
      firmwareVersion: ensureString(payload.firmware_ver, 'firmware_ver'),
      manufacturerId: ensureString(payload.Manufaturer_id, 'Manufaturer_id'),
      walletId: ensureString(payload.WalletID, 'WalletID'),
      appwriteId: ensureString(payload.Apprwrite_id, 'Apprwrite_id'),
      hash: ensureString(payload.Hash, 'Hash'),
      statusInfo: ensureString(payload.status_info, 'status_info'),
      partitionHealth: ensurePartitionHealth(payload.partition_health),
      receivedAt: new Date().toISOString(),
    };

    latestStatus = record;

    return NextResponse.json({ message: 'Device status recorded', data: record }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to process payload';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({ data: latestStatus }, { status: 200 });
}
