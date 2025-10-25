import * as firmwareRepo from "../repositories/firmware.repository.js";

export const publishFirmware = async (device_id, firmware_version, firmware_hash) => {
  return await firmwareRepo.publishMessage(device_id, firmware_version, firmware_hash);
};

export const getAllMessages = async () => {
  return await firmwareRepo.fetchMessages();
};

export const verifyFirmwareHash = async (device_id, firmware_hash) => {
  const messages = await firmwareRepo.fetchMessages();

  const deviceMessages = messages
    .filter((msg) => msg.device_id === device_id)
    .sort((a, b) => b.timestamp - a.timestamp);

  if (deviceMessages.length === 0) {
    return { verified: false, message: "No firmware found for this device_id" };
  }

  const latest = deviceMessages[0];
  return {
    verified: latest.firmware_hash === firmware_hash,
    latest_firmware_version: latest.firmware_version,
    latest_firmware_hash: latest.firmware_hash,
    timestamp: latest.timestamp,
    date: latest.date,
  };
};
