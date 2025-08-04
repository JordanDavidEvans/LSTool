// Recursive crawler module. Traverses all internal links starting from the
// active page and collates HTML for later analysis.
// Exports metadata used by the popup and background scripts.

export const id = 'crawler';
export const name = 'Recursive Crawler';

/**
 * Crawl all pages on the same origin as startUrl.
 * @param {string} startUrl - Starting page URL.
 * @param {Object} callbacks - Optional logging callbacks.
 * @param {Function} callbacks.log - Called with progress messages.
 * @param {Function} callbacks.error - Called when an error occurs.
 * @returns {Promise<Object>} Crawl results including pages and collated HTML.
 */
export async function run(startUrl, { log = () => {}, error = () => {} } = {}) {
  const origin = new URL(startUrl).origin;
  const toVisit = [startUrl];
  const visited = new Set();
  const pages = [];

  while (toVisit.length) {
    const url = toVisit.shift();
    if (visited.has(url)) continue;
    visited.add(url);
    log(`Visiting ${url}`);

    try {
      const response = await fetch(url);
      const text = await response.text();
      pages.push({ url, html: text });

      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');

      doc.querySelectorAll('a[href]').forEach(a => {
        const href = a.getAttribute('href');
        if (!href) return;
        const nextUrl = new URL(href, url);
        if (
          nextUrl.origin === origin &&
          !visited.has(nextUrl.href) &&
          !toVisit.includes(nextUrl.href)
        ) {
          toVisit.push(nextUrl.href);
        }
      });
    } catch (e) {
      error(`Failed to process ${url}: ${e.message}`);
    }
  }

  const collatedHtml = pages
    .map(p => `<!-- ${p.url} -->\n${p.html}`)
    .join('\n');


  return { pages, collatedHtml };
}
