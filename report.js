document.addEventListener('DOMContentLoaded', async () => {
  const { collatedHtml } = await chrome.storage.local.get('collatedHtml');
  const container = document.getElementById('content');
  if (collatedHtml) {
    container.innerHTML = collatedHtml;
  } else {
    container.textContent = 'No crawl data available.';
  }
});

