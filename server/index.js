import express from "express";
import * as dotenv from "dotenv";
import firmwareRoutes from "./routes/firmware.routes.js";

dotenv.config();

const app = express();
app.use(express.json());

app.use("/", firmwareRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
