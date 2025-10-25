import { NextResponse } from 'next/server';

import type { Models } from 'node-appwrite';

import { ID, Query, serverConfig, serverDatabases } from '@/lib/appwriteServer';

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

type DeviceStatusDocument = DeviceStatusRecord & Models.Document;

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

    const document = await serverDatabases.createDocument<DeviceStatusDocument>(
      serverConfig.databaseId,
      serverConfig.deviceCollectionId,
      ID.unique(),
      record
    );

    return NextResponse.json({ message: 'Device status recorded', data: record, documentId: document.$id }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to process payload';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const appwriteId = url.searchParams.get('appwriteId');

  if (!appwriteId) {
    return NextResponse.json({ error: 'Missing appwriteId query parameter' }, { status: 400 });
  }

  try {
    const documents = await serverDatabases.listDocuments<DeviceStatusDocument>(
      serverConfig.databaseId,
      serverConfig.deviceCollectionId,
      [Query.equal('appwriteId', appwriteId), Query.orderDesc('$createdAt'), Query.limit(1)]
    );

    const latest = documents.documents[0] ?? null;

    if (!latest) {
      return NextResponse.json({ data: null }, { status: 200 });
    }

    const partitionHealth = Array.isArray(latest.partitionHealth)
      ? latest.partitionHealth.map((value: unknown) => {
          if (value === 0 || value === 1) {
            return value;
          }
          if (typeof value === 'number') {
            return value > 0 ? 1 : 0;
          }
          const numeric = Number(value);
          return Number.isNaN(numeric) ? 0 : numeric > 0 ? 1 : 0;
        })
      : [];

    const record: DeviceStatusRecord = {
      deviceId: latest.deviceId,
      deviceName: latest.deviceName,
      firmwareVersion: latest.firmwareVersion,
      manufacturerId: latest.manufacturerId,
      walletId: latest.walletId,
      appwriteId: latest.appwriteId,
      hash: latest.hash,
      statusInfo: latest.statusInfo,
      partitionHealth,
      receivedAt: latest.receivedAt,
    };

    return NextResponse.json({ data: record }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load device status';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
