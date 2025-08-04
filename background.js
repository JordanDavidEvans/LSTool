const disallowedPatterns = [/\/wp-admin/i, /\.php/i, /\/login/i];
const fileExtensions = /\.(pdf|jpe?g|png|gif|svg|zip|rar|tar|gz|mp4|mp3|docx?|xlsx?|pptx?)$/i;

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'startCrawl') {
    crawlSite(msg.url, msg.html);
  }
});

async function crawlSite(startUrl, initialHtml) {
  const origin = new URL(startUrl).origin;
  const visited = new Set();
  const queue = [{ url: startUrl, html: initialHtml }];
  const results = [];
  await chrome.storage.local.set({ results: [] });

  while (queue.length) {
    const { url, html } = queue.shift();
    const normUrl = normalize(url);
    if (visited.has(normUrl)) continue;
    visited.add(normUrl);

    let pageHtml = html;
    if (!pageHtml) {
      try {
        const resp = await fetch(normUrl);
        pageHtml = await resp.text();
      } catch (e) {
        continue;
      }
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(pageHtml, 'text/html');
    const headerEls = Array.from(doc.querySelectorAll('h1,h2,h3,h4,h5,h6'));
    const headers = headerEls.map(h => ({ level: h.tagName, text: h.textContent.trim() }));
    results.push({ url: normUrl, headers, html: pageHtml });
    chrome.storage.local.set({ results });

    const links = Array.from(doc.querySelectorAll('a[href]')).map(a => a.getAttribute('href'));
    for (const link of links) {
      if (!link || link.startsWith('#')) continue;
      let linkUrl;
      try {
        linkUrl = new URL(link, normUrl);
      } catch (e) {
        continue;
      }
      if (linkUrl.origin !== origin) continue;
      if (linkUrl.search) continue;
      if (fileExtensions.test(linkUrl.pathname)) continue;
      if (disallowedPatterns.some(p => p.test(linkUrl.pathname))) continue;
      const normalized = normalize(linkUrl.href);
      if (!visited.has(normalized)) {
        queue.push({ url: normalized });
      }
    }
  }
}

function normalize(u) {
  try {
    const urlObj = new URL(u);
    urlObj.hash = '';
    urlObj.search = '';
    let href = urlObj.href;
    if (href.endsWith('/')) href = href.slice(0, -1);
    return href;
  } catch (e) {
    return u;
  }
}
