import { modules } from './modules/index.js';

const startBtn = document.getElementById('start');
const logEl = document.getElementById('log');
const moduleSelect = document.getElementById('module');

// Populate the module dropdown with available modules.
modules.forEach((m) => {
  const option = document.createElement('option');
  option.value = m.id;
  option.textContent = m.name;
  moduleSelect.appendChild(option);
});

startBtn.addEventListener('click', () => {
  logEl.textContent = '';
  const moduleId = moduleSelect.value;
  chrome.runtime.sendMessage({ type: 'run-module', moduleId });
});

// Display progress and errors from the background script.
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'log') {
    logEl.textContent += msg.message + '\n';
  } else if (msg.type === 'error') {
    logEl.textContent += 'Error: ' + msg.message + '\n';
  } else if (msg.type === 'done') {
    logEl.textContent += 'Module complete.\n';
  }
});
