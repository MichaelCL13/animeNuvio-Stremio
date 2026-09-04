const ANILIST_URL = "https://graphql.anilist.co";

const QUERY = `
query ($search: String) {
  Media(search: $search, type: ANIME) {
    id
    type
    title { romaji english native }
    description(asHtml: false)
    startDate { year month day }
    endDate { year month day }
    season
    seasonYear
    format
    episodes
    duration
    genres
    averageScore
    status
    coverImage { extraLarge large medium }
    bannerImage
    siteUrl
  }
}`;

function cleanText(value) {
  return String(value || "")
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+\n/g, "\n")
    .trim();
}

function decodeAddonId(id) {
  const value = decodeURIComponent(String(id || ""));
  const match = value.match(/^(jkanime|animeav1):(.*)$/i);
  if (!match) return null;

  return {
    provider: match[1].toLowerCase(),
    slug: match[2]
  };
}

function titleForSearch(slug) {
  return slug
    .replace(/:\d+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\d+$/, "")
    .trim();
}

async function findAniListAnime(search) {
  if (!search) return null;

  const response = await fetch(ANILIST_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query: QUERY, variables: { search } })
  });

  if (!response.ok) {
    throw new Error(`AniList HTTP ${response.status}`);
  }

  const json = await response.json();
  if (json.errors?.length) throw new Error(json.errors[0].message || "AniList error");
  return json.data?.Media || null;
}

function makeVideos(media, addonId) {
  const totalEpisodes = Number(media.episodes || 0);
  if (!totalEpisodes || media.format === "MOVIE") return [];

  return Array.from({ length: totalEpisodes }, (_, index) => ({
    id: `${addonId}:episode:${index + 1}`,
    title: `Episodio ${index + 1}`,
    season: 1,
    episode: index + 1,
    released: media.startDate?.year ? new Date(Date.UTC(media.startDate.year, (media.startDate.month || 1) - 1, media.startDate.day || 1)).toISOString() : undefined,
    thumbnail: media.coverImage?.large || media.coverImage?.medium
  }));
}

async function getMeta(id) {
  const parsed = decodeAddonId(id);
  if (!parsed) return null;

  const search = titleForSearch(parsed.slug);
  const media = await findAniListAnime(search);
  if (!media) return null;

  const title = media.title?.english || media.title?.romaji || media.title?.native || search;
  const poster = media.coverImage?.extraLarge || media.coverImage?.large || media.coverImage?.medium;
  const meta = {
    id: decodeURIComponent(String(id)),
    type: media.format === "MOVIE" ? "movie" : "series",
    name: title,
    poster,
    background: media.bannerImage || poster,
    description: cleanText(media.description),
    year: media.seasonYear || media.startDate?.year,
    genres: media.genres || [],
    runtime: media.duration,
    imdbRating: media.averageScore ? Number((media.averageScore / 10).toFixed(1)) : undefined,
    status: media.status,
    videos: makeVideos(media, decodeURIComponent(String(id)))
  };

  if (media.title?.romaji && media.title.romaji !== title) meta.aliases = [media.title.romaji];
  if (media.title?.native && media.title.native !== title) meta.aliases = [...new Set([...(meta.aliases || []), media.title.native])];

  Object.keys(meta).forEach(key => meta[key] === undefined && delete meta[key]);
  return meta;
}

module.exports = { getMeta };
