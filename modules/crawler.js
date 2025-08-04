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
      if (!response.ok) {
        error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
        continue;
      }

      const text = await response.text();

      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');

      // Remove potentially unsafe elements and capture only body content.
      const body = doc.body.cloneNode(true);
      body.querySelectorAll('script, style').forEach(el => el.remove());

      pages.push({ url, html: body.innerHTML });

      doc.querySelectorAll('a[href]').forEach(a => {
        const href = a.getAttribute('href');
        if (!href) return;
        let nextUrl;
        try {
          nextUrl = new URL(href, url);
        } catch {
          return;
        }
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
    .map(
      (p) =>
        `<div class="page"><div class="page-url"><a href="${p.url}" target="_blank">${p.url}</a></div>${p.html}</div>`
    )
    .join('\n');

  // Store the collated HTML and open the report page for viewing.
  await chrome.storage.local.set({ collatedHtml });
  await chrome.runtime.openOptionsPage();

  return { pages, collatedHtml };
}
