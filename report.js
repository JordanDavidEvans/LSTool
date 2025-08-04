document.addEventListener('DOMContentLoaded', async () => {
  const { collated = '' } = await chrome.storage.local.get('collated');
  const container = document.getElementById('collated');
  container.textContent = collated;
});

