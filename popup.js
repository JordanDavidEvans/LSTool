const startBtn = document.getElementById('start');
const logEl = document.getElementById('log');

startBtn.addEventListener('click', () => {
  logEl.textContent = '';
  chrome.runtime.sendMessage({ type: 'start-crawl' });
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'log') {
    logEl.textContent += msg.message + '\n';
  } else if (msg.type === 'error') {
    logEl.textContent += 'Error: ' + msg.message + '\n';
  } else if (msg.type === 'done') {
    logEl.textContent += 'Crawl complete.\n';
  }
});
