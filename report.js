document.addEventListener('DOMContentLoaded', async () => {
  const { collatedHtml, headerSummary } = await chrome.storage.local.get([
    'collatedHtml',
    'headerSummary',
  ]);
  const summaryEl = document.getElementById('summary');
  const container = document.getElementById('content');

  if (headerSummary && headerSummary.length) {
    headerSummary.forEach((page) => {
      const section = document.createElement('section');
      const heading = document.createElement('h2');
      heading.textContent = page.url;
      section.appendChild(heading);

      const list = document.createElement('ul');
      page.headers.forEach((h) => {
        const li = document.createElement('li');
        li.textContent = `${h.level.toUpperCase()}: ${h.text}`;
        list.appendChild(li);
      });
      section.appendChild(list);
      summaryEl.appendChild(section);
    });
  } else {
    summaryEl.textContent = 'No header summary available.';
  }

  if (collatedHtml) {
    container.innerHTML = collatedHtml;
  } else {
    container.textContent = 'No crawl data available.';
  }
});

