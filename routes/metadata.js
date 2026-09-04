const ANILIST_URL = "https://graphql.anilist.co";
const CACHE_TTL = 6 * 60 * 60 * 1000;
const cache = new Map();

function slugToSearch(slug) {
  return decodeURIComponent(String(slug || ""))
    .replace(/[-_]+/g, " ")
    .replace(/\b(?:season|temporada|part|parte)\s*\d+\b/gi, "")
    .replace(/\s+/g, " ").trim();
}
function cleanText(value) {
  return value ? String(value).replace(/<br\s*\/?>(?=\n)?/gi, "\n").replace(/<[^>]+>/g, "").trim() : undefined;
}
async function searchAniList(search) {
  const query = `query ($search:String){Page(page:1,perPage:8){media(search:$search,type:ANIME,sort:SEARCH_MATCH){id idMal format status seasonYear episodes duration averageScore countryOfOrigin title{romaji english native} synonyms description(asHtml:false) coverImage{extraLarge large medium} bannerImage genres startDate{year month day}}}}`;
  const r = await fetch(ANILIST_URL,{method:"POST",headers:{"Content-Type":"application/json","Accept":"application/json"},body:JSON.stringify({query,variables:{search}})});
  if(!r.ok) throw new Error(`AniList HTTP ${r.status}`);
  const d = await r.json(); return d?.data?.Page?.media || [];
}
function score(x,q){
  q=q.toLowerCase(); const ts=[x.title?.romaji,x.title?.english,x.title?.native,...(x.synonyms||[])].filter(Boolean).map(s=>s.toLowerCase());
  let s=0; for(const t of ts){if(t===q)s=Math.max(s,100); else if(t.includes(q)||q.includes(t))s=Math.max(s,75);} if(x.format==='TV')s+=8; return s;
}
function pick(items,q){return [...items].sort((a,b)=>score(b,q)-score(a,q))[0]||null;}
function toMeta(m,id){
  return {id,type:"series",name:m.title?.english||m.title?.romaji||m.title?.native||"Anime",poster:m.coverImage?.extraLarge||m.coverImage?.large||m.coverImage?.medium,background:m.bannerImage||m.coverImage?.extraLarge,description:cleanText(m.description),year:m.startDate?.year,genres:m.genres||[],imdbRating:m.averageScore?(m.averageScore/10).toFixed(1):undefined,runtime:m.duration?`${m.duration} min`:undefined,status:m.status,country:m.countryOfOrigin,videos:[]};
}
async function getMeta(id){
  if(cache.has(id)&&cache.get(id).expires>Date.now()) return cache.get(id).value;
  const parts=id.split(":"); if(parts.length<2||!['jkanime','animeav1'].includes(parts[0])) throw new Error('Unsupported provider ID');
  const q=slugToSearch(parts.slice(1).join(":")); if(!q) throw new Error('Empty anime slug');
  const m=pick(await searchAniList(q),q); if(!m) throw new Error(`No AniList match for ${q}`);
  const result=toMeta(m,id); cache.set(id,{value:result,expires:Date.now()+CACHE_TTL}); return result;
}
module.exports={getMeta,slugToSearch};
