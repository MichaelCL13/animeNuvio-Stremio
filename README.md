# JKAnime-AV1-Nuvio v1.0

Addon base compatible con Nuvio/Stremio.

## Incluye

- JKAnime
- AnimeAV1
- Catálogos separados
- Búsqueda
- Metadata
- Endpoint stream preparado

## Ejecutar

Requiere Node.js 18+.

    npm install
    npm start

Manifest:

    http://localhost:7000/manifest.json

Desde otro dispositivo de la misma red:

    http://IP_DEL_PC:7000/manifest.json

## Docker

    docker build -t jkanime-av1-nuvio .
    docker run --rm -p 7000:7000 jkanime-av1-nuvio

## Nota

Esta v1 es la base del addon. No incluye extracción ni redistribución de enlaces de reproducción protegidos.
