const express = require("express");
const fs = require("fs");
const path = require("path");
const metaRouter = require("./routes/meta");
const catalogRouter = require("./routes/catalog");
const streamRouter = require("./routes/streams");

const app = express();
const PORT = process.env.PORT || 7000;
const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, "manifest.json"), "utf8"));

app.disable("x-powered-by");
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.get("/", (_req, res) => res.type("html").send(`<h1>JKAnime + AnimeAV1 Nuvio v2.0.0</h1><p>Addon online.</p><a href="/manifest.json">manifest.json</a>`));
app.get("/manifest.json", (_req, res) => res.json(manifest));
app.use(catalogRouter);
app.use(metaRouter);
app.use(streamRouter);
app.use((_req, res) => res.status(404).json({ error: "Not found" }));

app.listen(PORT, "0.0.0.0", () => console.log(`JKAnime + AnimeAV1 Nuvio v${manifest.version} listening on ${PORT}`));
