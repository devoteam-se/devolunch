import express from "express";
import path = require("path");
import cors from "cors";
import routes from "./routes";

import 'dotenv/config';

const PORT = Number(process.env.PORT) || 8080;
const CLIENT_DIR = path.resolve(__dirname, "..", "..", "client");

const app = express();
app.use(cors());

// Serve static files
app.use(express.static(path.resolve(CLIENT_DIR, "build")));

routes({ app });

app.get("*", (req, res) => {
  res.sendFile(path.resolve(CLIENT_DIR, "build", "index.html"));
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
