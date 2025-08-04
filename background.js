import { crawlSite } from './modules/crawler.js';

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.url) return;
  const data = await crawlSite(tab.url);
  await chrome.storage.local.set({ report: data });
  chrome.tabs.create({ url: chrome.runtime.getURL('report.html') });
});
