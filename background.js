import { crawlSite } from './modules/crawler.js';

chrome.runtime.onMessage.addListener(async (request) => {
  if (request.type === 'start-crawl') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.url) {
      chrome.runtime.sendMessage({ type: 'error', message: 'No active tab to crawl.' });
      return;
    }
    chrome.runtime.sendMessage({ type: 'log', message: `Starting crawl at ${tab.url}` });
    try {
      const data = await crawlSite(
        tab.url,
        msg => chrome.runtime.sendMessage({ type: 'log', message: msg }),
        msg => chrome.runtime.sendMessage({ type: 'error', message: msg })
      );
      await chrome.storage.local.set({ report: data });
      chrome.runtime.sendMessage({ type: 'done' });
      chrome.tabs.create({ url: chrome.runtime.getURL('report.html') });
    } catch (e) {
      chrome.runtime.sendMessage({ type: 'error', message: e.message });
    }
  }
});
