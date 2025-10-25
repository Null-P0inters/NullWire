import { NextResponse } from "next/server";

const UPSTREAM_ENDPOINT = "https://nullwireserver-three.vercel.app/publish";

type IncomingPayload = {
  deviceId?: unknown;
  firmwareVersion?: unknown;
  firmwareHash?: unknown;
};

type UpstreamPayload = {
  device_id: string;
  firmware_version: string;
  firmware_hash: string;
};

const ensureString = (value: unknown, field: keyof UpstreamPayload): string => {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  throw new Error(`${field} is required`);
};

export async function POST(request: Request) {
  let incoming: IncomingPayload;

  try {
    incoming = (await request.json()) as IncomingPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  let upstreamPayload: UpstreamPayload;
  try {
    upstreamPayload = {
      device_id: ensureString(incoming.deviceId, "device_id"),
      firmware_version: ensureString(incoming.firmwareVersion, "firmware_version"),
      firmware_hash: ensureString(incoming.firmwareHash, "firmware_hash"),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid payload.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    const upstreamResponse = await fetch(UPSTREAM_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(upstreamPayload),
      cache: "no-store",
    });

    const contentType = upstreamResponse.headers.get("content-type") ?? "";
    let upstreamBody: unknown = null;

    if (contentType.includes("application/json")) {
      upstreamBody = await upstreamResponse.json();
    } else {
      upstreamBody = await upstreamResponse.text();
    }

    if (!upstreamResponse.ok) {
      const errorMessage =
        typeof upstreamBody === "string"
          ? upstreamBody
          : upstreamBody && typeof upstreamBody === "object" && "error" in upstreamBody
            ? String((upstreamBody as { error: unknown }).error)
            : `Upstream request failed with status ${upstreamResponse.status}`;

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          upstream: upstreamBody,
        },
        { status: upstreamResponse.status },
      );
    }

    const message =
      typeof upstreamBody === "string"
        ? upstreamBody || "Firmware publish queued successfully."
        : upstreamBody && typeof upstreamBody === "object" && "message" in upstreamBody
          ? String((upstreamBody as { message: unknown }).message)
          : "Firmware publish queued successfully.";

    return NextResponse.json(
      {
        success: true,
        message,
        upstream: upstreamBody,
      },
      { status: upstreamResponse.status },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to contact upstream endpoint.";
    return NextResponse.json({ success: false, error: message }, { status: 502 });
  }
}
