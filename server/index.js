import express from "express";
import * as dotenv from "dotenv";
import firmwareRoutes from "./routes/firmware.routes.js";
import cors from "cors";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

app.use("/", firmwareRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
