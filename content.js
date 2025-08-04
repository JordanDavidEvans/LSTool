(() => {
  const html = document.documentElement.outerHTML;
  chrome.runtime.sendMessage({
    type: 'startCrawl',
    url: location.href,
    html
  });
})();
