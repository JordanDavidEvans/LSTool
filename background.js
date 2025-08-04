import { crawlSite } from './modules/crawler.js';

const safeSendMessage = (msg) => {
  try {
    chrome.runtime.sendMessage(msg).catch(() => {});
  } catch (e) {
    // ignore
  }
};

chrome.runtime.onMessage.addListener(async (request) => {
  if (request.type === 'start-crawl') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.url) {
      safeSendMessage({ type: 'error', message: 'No active tab to crawl.' });
      return;
    }
    safeSendMessage({ type: 'log', message: `Starting crawl at ${tab.url}` });
    try {
      const data = await crawlSite(
        tab.url,
        msg => safeSendMessage({ type: 'log', message: msg }),
        msg => safeSendMessage({ type: 'error', message: msg })
      );
      await chrome.storage.local.set({ report: data });
      safeSendMessage({ type: 'done' });
      chrome.tabs.create({ url: chrome.runtime.getURL('report.html') });
    } catch (e) {
      safeSendMessage({ type: 'error', message: e.message });
    }
  }
});
