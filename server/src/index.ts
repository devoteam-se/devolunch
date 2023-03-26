import express from "express";
import path = require("path");
import cors from "cors";

import { loadEnv } from "./env";
import routes from "./routes";
import logger from "./logger";

loadEnv();

const PORT = Number(process.env.PORT) || 8080;
const CLIENT_DIR = path.resolve(__dirname, "..", "..", "client");

const app = express();
app.use(cors());

// Serve static files
app.use(express.static(path.resolve(CLIENT_DIR, "build")));

app.get("/", (req, res) => {
  res.sendFile(path.resolve(CLIENT_DIR, "build", "index.html"));
});

app.use("/api", routes);

app.listen(PORT, () => {
  logger.info(`App listening on port ${PORT}`);
});
