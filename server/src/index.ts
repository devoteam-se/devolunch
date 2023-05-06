import express from "express";
import { resolve } from "path";
import cors from "cors";

import { loadEnv } from "./env";
import routes from "./routes";
import logger from "./logger";

loadEnv();

const PORT = Number(process.env.PORT) || 8080;
const CLIENT_DIR = resolve(__dirname, "..", "..", "client");

const app = express();
app.use(cors());

// Serve static files
app.use(express.static(resolve(CLIENT_DIR, "dist")));

app.get("/", (req, res) => {
  res.sendFile(resolve(CLIENT_DIR, "dist", "index.html"));
});

app.use("/api", routes);

app.listen(PORT, () => {
  logger.info(`App listening on port ${PORT}`);
});
