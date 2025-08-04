/**
 * Service worker for the Header Structure Crawler extension.
 * Injects the crawler script into the current tab when the user
 * clicks the extension icon.
 */

// Listen for the user clicking the extension's action icon
chrome.action.onClicked.addListener((tab) => {
  // Ensure a valid tab ID exists
  if (tab.id) {
    // Inject the crawler script into the active tab
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['crawler.js']
    });
  }
});
