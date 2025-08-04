function rgbToHex(rgb) {
  const result = rgb.match(/\d+/g).map(Number);
  return '#' + result.map(x => x.toString(16).padStart(2, '0')).join('');
}

document.addEventListener('DOMContentLoaded', async () => {
  const { report = [] } = await chrome.storage.local.get('report');
  const summaryTable = document.getElementById('summary');
  const pagesContainer = document.getElementById('pages');
  const levels = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

  // Build summary header row
  const headerRow = document.createElement('tr');
  const thPage = document.createElement('th');
  thPage.textContent = 'Page';
  headerRow.appendChild(thPage);
  levels.forEach(level => {
    const th = document.createElement('th');
    th.textContent = level.toUpperCase();
    headerRow.appendChild(th);
  });
  summaryTable.appendChild(headerRow);

  report.forEach(page => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(page.html, 'text/html');
    const headers = Array.from(doc.querySelectorAll(levels.join(','))).map(h => ({
      level: h.tagName.toLowerCase(),
      text: h.textContent.trim()
    }));

    // Summary row
    const row = document.createElement('tr');
    const urlCell = document.createElement('td');
    urlCell.textContent = page.url;
    row.appendChild(urlCell);
    levels.forEach(level => {
      const cell = document.createElement('td');
      cell.textContent = headers.filter(h => h.level === level).length;
      row.appendChild(cell);
    });
    summaryTable.appendChild(row);

    // Detailed headers per page
    const pageDiv = document.createElement('div');
    pageDiv.className = 'page';
    const title = document.createElement('h2');
    title.textContent = page.url;
    pageDiv.appendChild(title);
    headers.forEach(h => {
      const div = document.createElement('div');
      div.className = `header ${h.level}`;
      div.textContent = `${h.level.toUpperCase()}: ${h.text}`;
      pageDiv.appendChild(div);
    });
    pagesContainer.appendChild(pageDiv);
  });

  // Color controls
  const controls = document.getElementById('controls');
  levels.forEach(level => {
    const label = document.createElement('label');
    label.textContent = `${level.toUpperCase()} color: `;
    const input = document.createElement('input');
    input.type = 'color';
    const color = getComputedStyle(document.documentElement)
      .getPropertyValue(`--${level}-color`).trim();
    input.value = color.startsWith('#') ? color : rgbToHex(color);
    input.addEventListener('input', () => {
      document.documentElement.style.setProperty(`--${level}-color`, input.value);
    });
    label.appendChild(input);
    controls.appendChild(label);
  });
});
