const cache = new Map();
const MAX_CACHE = 300;

// PDF copy artefacts: "mechan-\nism" -> "mechanism", hard line wraps -> spaces
const clean = (s) => s
  .replace(/(\p{L})-\r?\n\s*(\p{Ll})/gu, '$1$2')
  .replace(/\s*\r?\n\s*/g, ' ')
  .replace(/[ \t]{2,}/g, ' ')
  .trim();

async function google(text) {
  const res = await fetch(
    'https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=bn&dt=t',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body: 'q=' + encodeURIComponent(text),
      signal: AbortSignal.timeout(8000),
    });
  if (!res.ok) throw new Error(`google ${res.status}`);
  const data = await res.json();
  return data[0].map((seg) => seg[0]).join('');
}

async function mymemory(text) {
  const url = `https://api.mymemory.translated.net/get?langpair=en|bn&q=${encodeURIComponent(text.slice(0, 480))}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`mymemory ${res.status}`);
  const data = await res.json();
  return data.responseData.translatedText;
}

async function toBangla(text) {
  if (cache.has(text)) return cache.get(text);
  let out;
  try { out = await google(text); }
  catch (e) { out = await mymemory(text); }
  if (cache.size >= MAX_CACHE) cache.delete(cache.keys().next().value);
  cache.set(text, out);
  return out;
}

module.exports = { clean, toBangla };
