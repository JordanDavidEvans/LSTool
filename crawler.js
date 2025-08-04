/**
 * Content script for the Header Structure Crawler extension.
 * Crawls same-domain links, extracts header tags, and displays
 * a structured summary in a new tab.
 */

(async () => {
  /**
   * Collect all eligible internal links from the current document.
   * @returns {string[]} Array of unique URLs on the same domain.
   */
  function collectInternalLinks() {
    const origin = location.origin; // Base origin for comparison
    const anchors = Array.from(document.querySelectorAll('a[href]'));
    const urls = new Set(); // Use a set to avoid duplicates

    for (const anchor of anchors) {
      const url = new URL(anchor.href, origin); // Resolve relative URLs

      // Skip external domains
      if (url.origin !== origin) continue;

      // Skip links that point to anchors on the same page
      if (url.hash) continue;

      const path = url.pathname.toLowerCase();

      // Skip administrative areas
      if (path.includes('/wp-admin') || path.includes('/admin') || path.includes('/login')) continue;

      // Skip common file extensions that are not HTML pages
      if (/(\.pdf|\.jpg|\.jpeg|\.png|\.gif|\.svg|\.webp|\.zip|\.rar|\.csv|\.json|\.xml|\.php)$/i.test(path)) continue;

      // Remove query parameters to avoid duplicate crawling
      url.search = '';

      urls.add(url.toString());
    }

    // Ensure the current page is included in the crawl
    const current = new URL(location.href);
    current.search = '';
    current.hash = '';
    urls.add(current.toString());

    return Array.from(urls);
  }

  /**
   * Fetch a page's HTML and extract header information.
   * @param {string} url - The URL to fetch.
   * @returns {Promise<object>} Object containing page metadata and headers.
   */
  async function fetchAndExtract(url) {
    const response = await fetch(url); // Fetch the raw HTML
    const text = await response.text(); // Convert the response to text

    // Parse the HTML into a document
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');

    const headers = [];

    // Loop through header levels H1 to H6
    for (let level = 1; level <= 6; level++) {
      const elements = Array.from(doc.querySelectorAll(`h${level}`));
      for (const element of elements) {
        headers.push({
          level,
          text: element.textContent.trim(),
        });
      }
    }

    return {
      url,
      title: doc.querySelector('title')?.textContent.trim() || '',
      description: doc.querySelector('meta[name="description"]')?.getAttribute('content') || '',
      headers,
    };
  }

  /**
   * Build a complete HTML document summarizing the crawl results.
   * @param {Array} data - Array of page data objects.
   * @returns {string} HTML string representing the summary page.
   */
  function buildSummaryHTML(data) {
    const html = [`<!DOCTYPE html>`,
      `<html lang="en">`,
      `<head>`,
      `<meta charset="UTF-8">`,
      `<title>Header Summary</title>`,
      `<style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        input { width: 100%; padding: 6px; margin-bottom: 10px; }
        details { margin-bottom: 12px; }
        summary { font-weight: bold; cursor: pointer; }
        ul { list-style: none; padding-left: 0; }
        li { margin: 2px 0; }
      </style>`,
      `</head>`,
      `<body>`,
      `<h1>Header Summary</h1>`,
      `<input type="text" id="filter" placeholder="Filter URLs" />`,
      `<div id="content"></div>`,
      `<script>
        const pages = ${JSON.stringify(data)};
        const container = document.getElementById('content');
        const filterInput = document.getElementById('filter');

        function render(list) {
          container.innerHTML = '';
          for (const page of list) {
            const wrapper = document.createElement('details');
            const summary = document.createElement('summary');
            summary.textContent = page.url;
            wrapper.appendChild(summary);

            if (page.title || page.description) {
              const meta = document.createElement('p');
              meta.innerHTML = '<strong>Title:</strong> ' + page.title + '<br><strong>Description:</strong> ' + page.description;
              wrapper.appendChild(meta);
            }

            const ul = document.createElement('ul');
            for (const header of page.headers) {
              const li = document.createElement('li');
              li.textContent = 'H' + header.level + ': ' + header.text;
              li.style.marginLeft = (header.level - 1) * 10 + 'px';
              ul.appendChild(li);
            }
            wrapper.appendChild(ul);
            container.appendChild(wrapper);
          }
        }

        render(pages);

        filterInput.addEventListener('input', () => {
          const term = filterInput.value.toLowerCase();
          const filtered = pages.filter(p => p.url.toLowerCase().includes(term));
          render(filtered);
        });
      </script>`,
      `</body>`,
      `</html>`];

    return html.join('');
  }

  // Main crawling workflow
  const links = collectInternalLinks();
  const results = [];

  for (const link of links) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const data = await fetchAndExtract(link);
      results.push(data);
    } catch (error) {
      console.error('Failed to fetch', link, error);
    }
  }

  const summary = buildSummaryHTML(results);

  // Open a new window to display the summary
  const viewer = window.open('', '_blank');
  if (viewer) {
    viewer.document.write(summary);
    viewer.document.close();
  } else {
    alert('Popup blocked. Please allow popups for this extension.');
  }
})();
