import express = require("express");
import path = require("path");

const PORT = Number(process.env.PORT) || 8080;
const CLIENT_DIR = path.resolve(__dirname, "..", "..", "client")

const app = express();

// Serve static files
app.use(express.static(path.resolve(CLIENT_DIR, "build")));

app.get("/api", (req, res) => {
  res.send("🎉 Hello API! 🎉");
});

app.get("*", (req, res) => {
  res.sendFile(path.resolve(CLIENT_DIR, "build", "index.html"));
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
