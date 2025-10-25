import * as firmwareService from "../services/firmware.service.js";

export const publishFirmware = async (req, res) => {
  try {
    const { device_id, firmware_version, firmware_hash } = req.body;
    if (!device_id || !firmware_version || !firmware_hash) {
      return res.status(400).json({ error: "device_id, firmware_version, and firmware_hash are required" });
    }

    const receipt = await firmwareService.publishFirmware(device_id, firmware_version, firmware_hash);

    res.json({
      success: true,
      transactionHash: receipt.hash,
      message: "Firmware hash published successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const fetchMessages = async (req, res) => {
  try {
    const messages = await firmwareService.getAllMessages();
    res.json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const verifyFirmware = async (req, res) => {
  try {
    const { device_id, firmware_hash } = req.body;
    if (!device_id || !firmware_hash) {
      return res.status(400).json({ error: "device_id and firmware_hash are required" });
    }

    const result = await firmwareService.verifyFirmwareHash(device_id, firmware_hash);
    res.json({...result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
