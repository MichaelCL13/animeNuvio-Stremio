const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 7000;

const manifest = JSON.parse(
  fs.readFileSync(path.join(__dirname, "manifest.json"), "utf8")
);

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

const demo = [
  {
    id: "jkanime:naruto",
    type: "series",
    name: "Naruto",
    poster: "https://placehold.co/600x900?text=Naruto",
    description: "Demo de integración JKAnime.",
    year: 2002
  },
  {
    id: "animeav1:one-piece",
    type: "series",
    name: "One Piece",
    poster: "https://placehold.co/600x900?text=One+Piece",
    description: "Demo de integración AnimeAV1.",
    year: 1999
  }
];

app.get("/manifest.json", (_req, res) => res.json(manifest));

app.get("/", (_req, res) => {
  res.type("html").send(`
    <h1>JKAnime + AnimeAV1 Nuvio</h1>
    <p>Addon v1.0.0 funcionando.</p>
    <a href="/manifest.json">manifest.json</a>
  `);
});

app.get("/catalog/:type/:catalogId.json", (req, res) => {
  const { type, catalogId } = req.params;
  const search = String(req.query.search || "").trim().toLowerCase();

  if (type !== "series") return res.json({ metas: [] });

  let items = demo.filter(x =>
    catalogId === "jkanime"
      ? x.id.startsWith("jkanime:")
      : catalogId === "animeav1"
        ? x.id.startsWith("animeav1:")
        : false
  );

  if (search) {
    items = items.filter(x => x.name.toLowerCase().includes(search));
  }

  res.json({
    metas: items.map(({ id, type, name, poster, description, year }) =>
      ({ id, type, name, poster, description, year })
    )
  });
});

app.get("/meta/:type/:id.json", (req, res) => {
  const item = demo.find(x => x.id === decodeURIComponent(req.params.id));
  if (!item) return res.json({ meta: null });

  res.json({
    meta: {
      ...item,
      videos: []
    }
  });
});

// Preparado para fuentes de reproducción autorizadas.
app.get("/stream/:type/:id.json", (_req, res) => {
  res.json({ streams: [] });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("JKAnime + AnimeAV1 Nuvio v1.0.0");
  console.log(`Manifest: http://localhost:${PORT}/manifest.json`);
});