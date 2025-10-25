import express from "express";
import * as firmwareController from "../controllers/firmware.controller.js";

const router = express.Router();

router.post("/publish", firmwareController.publishFirmware);
router.post("/verify", firmwareController.verifyFirmware);
router.get("/fetch", firmwareController.fetchMessages);

export default router;
