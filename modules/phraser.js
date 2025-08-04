export const id = 'phraser';
export const name = 'DOM Phraser';

/**
 * Capture the DOM of the active tab after scripts have executed.
 * @param {string} startUrl - URL of the active tab.
 * @param {Object} callbacks - Optional logging callbacks.
 * @param {Function} callbacks.log - Called with progress messages.
 * @param {Function} callbacks.error - Called when an error occurs.
 * @returns {Promise<Object>} Results including captured HTML and header summary.
 */
export async function run(startUrl, { log = () => {}, error = () => {} } = {}) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) {
    error('No active tab to capture.');
    return;
  }

  log(`Capturing DOM for ${tab.url}`);

  try {
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const body = document.body.cloneNode(true);
        body.querySelectorAll('script, style').forEach((el) => el.remove());
        const headers = [];
        body.querySelectorAll('h1,h2,h3,h4,h5,h6').forEach((h) => {
          headers.push({ level: h.tagName.toLowerCase(), text: h.textContent.trim() });
        });
        return { html: body.innerHTML, headers };
      },
    });

    const pages = [{ url: tab.url, html: result.html, headers: result.headers }];
    const collatedHtml =
      `<div class="page"><div class="page-url"><a href="${tab.url}" target="_blank">${tab.url}</a></div>${result.html}</div>`;
    const headerSummary = [{ url: tab.url, headers: result.headers }];

    await chrome.storage.local.set({ collatedHtml, headerSummary });
    await chrome.runtime.openOptionsPage();
    return { pages, collatedHtml, headerSummary };
  } catch (e) {
    error(`Failed to capture DOM: ${e.message}`);
  }
}

