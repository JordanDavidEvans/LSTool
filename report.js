function rgbToHex(rgb) {
  const result = rgb.match(/\d+/g).map(Number);
  return '#' + result.map(x => x.toString(16).padStart(2, '0')).join('');
}

document.addEventListener('DOMContentLoaded', async () => {
  const { report = [] } = await chrome.storage.local.get('report');
  const pages = document.getElementById('pages');
  report.forEach(page => {
    const pageDiv = document.createElement('div');
    pageDiv.className = 'page';
    const title = document.createElement('h2');
    title.textContent = page.url;
    pageDiv.appendChild(title);
    page.headers.forEach(h => {
      const div = document.createElement('div');
      div.className = `header ${h.level}`;
      div.textContent = `${h.level.toUpperCase()}: ${h.text}`;
      pageDiv.appendChild(div);
    });
    pages.appendChild(pageDiv);
  });

  const controls = document.getElementById('controls');
  ['h1','h2','h3','h4','h5','h6'].forEach(level => {
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
