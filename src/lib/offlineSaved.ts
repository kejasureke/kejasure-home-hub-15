/** Keeps photos of saved homes on the phone so they open without data. */
const CACHE = "kejasure-saved-homes";

export async function cacheImages(urls: string[]) {
  if (!("caches" in window)) return;
  try {
    const c = await caches.open(CACHE);
    await Promise.all(urls.map(async (u) => { if (!(await c.match(u))) await c.add(u).catch(() => {}); }));
  } catch {}
}
