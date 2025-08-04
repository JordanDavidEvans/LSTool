import { modules } from './modules/index.js';

// Safely send a message to the popup if it is open.
const safeSendMessage = (msg) => {
  try {
    chrome.runtime.sendMessage(msg).catch(() => {});
  } catch (e) {
    // ignore errors when no listeners are available
  }
};

// Find a module by its identifier.
const getModule = (id) => modules.find(m => m.id === id);

chrome.runtime.onMessage.addListener(async (request) => {
  if (request.type === 'run-module') {
    const mod = getModule(request.moduleId);
    if (!mod) {
      safeSendMessage({ type: 'error', message: `Unknown module: ${request.moduleId}` });
      return;
    }

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.url) {
      safeSendMessage({ type: 'error', message: 'No active tab to run module.' });
      return;
    }

    safeSendMessage({ type: 'log', message: `Running ${mod.name} at ${tab.url}` });
    try {
      await mod.run(
        tab.url,
        {
          log: (msg) => safeSendMessage({ type: 'log', message: msg }),
          error: (msg) => safeSendMessage({ type: 'error', message: msg })
        }
      );

      safeSendMessage({ type: 'done' });
    } catch (e) {
      safeSendMessage({ type: 'error', message: e.message });
    }
  }
});
