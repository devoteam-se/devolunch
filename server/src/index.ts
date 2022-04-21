import express = require("express");
import path = require("path");
import cors from "cors";
import Routes from "./routes";

import { Storage } from "@google-cloud/storage";

const BUCKET_NAME = "devolunch";

const storage = new Storage({
  projectId: 'devolunch',
});

const PORT = Number(process.env.PORT) || 8080;
const CLIENT_DIR = path.resolve(__dirname, "..", "..", "client");

const app = express();
app.use(cors());

// Serve static files
app.use(express.static(path.resolve(CLIENT_DIR, "build")));

app.get("/api", (req, res) => {
  res.send("Hello API");
});

app.get("/api/restaurants", async (req, res) => {
  const bucket = storage.bucket(BUCKET_NAME);
  const file = await bucket
    .file("restaurants.json")
    .download();
  res.send(JSON.parse(file[0].toString('utf8')));
});

Routes({ app });

app.get("*", (req, res) => {
  res.sendFile(path.resolve(CLIENT_DIR, "build", "index.html"));
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});