document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('results');

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content.js'] });

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  }

  function render(pages) {
    if (!pages || !pages.length) {
      container.textContent = 'No results yet...';
      return;
    }
    const items = pages.map((p, idx) => {
      const headerItems = p.headers.map(h => `<li><strong>${h.level}:</strong> ${escapeHtml(h.text)}</li>`).join('');
      return `
        <div class="accordion-item">
          <h2 class="accordion-header" id="heading${idx}">
            <button class="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#collapse${idx}"
                    aria-expanded="false"
                    aria-controls="collapse${idx}">
              ${escapeHtml(p.url)}
            </button>
          </h2>
          <div id="collapse${idx}"
               class="accordion-collapse collapse"
               aria-labelledby="heading${idx}"
               data-bs-parent="#resultsAccordion">
            <div class="accordion-body">
              <ul>${headerItems || '<li>No headers found</li>'}</ul>
            </div>
          </div>
        </div>`;
    }).join('');
    container.innerHTML = `<div class="accordion" id="resultsAccordion">${items}</div>`;
  }

  chrome.storage.local.get('results', data => render(data.results));
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.results) {
      render(changes.results.newValue);
    }
  });
});
