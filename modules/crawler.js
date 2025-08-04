export async function crawlSite(startUrl, onProgress = () => {}, onError = () => {}) {
  const origin = new URL(startUrl).origin;
  const toVisit = [startUrl];
  const visited = new Set();
  const results = [];

  while (toVisit.length) {
    const url = toVisit.shift();
    if (visited.has(url)) continue;
    visited.add(url);
    onProgress(`Visiting ${url}`);

    try {
      const response = await fetch(url);
      const text = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');

      const headers = [];
      for (let i = 1; i <= 6; i++) {
        doc.querySelectorAll(`h${i}`).forEach(h => {
          headers.push({ level: `h${i}`, text: h.textContent.trim() });
        });
      }
      results.push({ url, headers });

      doc.querySelectorAll('a[href]').forEach(a => {
        const href = a.getAttribute('href');
        if (!href) return;
        const nextUrl = new URL(href, url);
        if (nextUrl.origin === origin && !visited.has(nextUrl.href)) {
          toVisit.push(nextUrl.href);
        }
      });
    } catch (e) {
      onError(`Failed to process ${url}: ${e.message}`);
    }
  }

  return results;
}
