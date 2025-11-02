const fs = require('fs');
const path = require('path');

let HISTORY_FILE = '';
let historyData = {
  slots: {},
  history: [],
  pinned: []
};

function init(filePath) {
  HISTORY_FILE = filePath;
  try {
    if (!fs.existsSync(HISTORY_FILE)) {
      fs.writeFileSync(HISTORY_FILE, JSON.stringify(historyData, null, 2), 'utf8');
    } else {
      const data = fs.readFileSync(HISTORY_FILE, 'utf8');
      try {
        historyData = JSON.parse(data);
      } catch (err) {
        console.warn('[Clipboard Manager] Corrupt history file. Reinitializing.');
        historyData = { slots: {}, history: [], pinned: [] };
        saveFile();
      }
    }
  } catch (err) {
    console.error('[Clipboard Manager] Failed to load history file:', err);
  }
}

function saveFile() {
  try {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(historyData, null, 2), 'utf8');
  } catch (err) {
    console.error('[Clipboard Manager] Failed to save history file:', err);
  }
}

function reload() {
  try {
    const data = fs.readFileSync(HISTORY_FILE, 'utf8');
    historyData = JSON.parse(data);
  } catch (err) {
    console.error('[Clipboard Manager] Failed to reload history file:', err);
  }
}

function saveToSlot(slot, text) {
  if (!text) return;
  historyData.slots[slot] = text;
  addToHistory(text);
  saveFile();
}

function getFromSlot(slot) {
  return historyData.slots[slot] || null;
}

function addToHistory(text) {
  if (!text || text.trim() === '') return;
  historyData.history = historyData.history.filter(item => item !== text);
  historyData.history.unshift(text);

  if (historyData.history.length > 100) historyData.history.pop();
  saveFile();
}

function pinItem(text) {
  if (!text || historyData.pinned.includes(text)) return;
  historyData.pinned.push(text);
  saveFile();
  reload();
}

function unpinItem(text) {
  historyData.pinned = historyData.pinned.filter(item => item !== text);
  saveFile();
  reload();
}

function deleteItem(text) {
  const before = historyData.history.length;
  historyData.history = historyData.history.filter(item => item !== text);
  historyData.pinned = historyData.pinned.filter(item => item !== text);
  saveFile();
  reload();
  const after = historyData.history.length;

  console.log(`[Clipboard Manager] Deleted "${text}". Items before: ${before}, after: ${after}`);
}

function search(query) {
  if (!query) return [...historyData.history];
  const lower = query.toLowerCase();
  return historyData.history.filter(item => item.toLowerCase().includes(lower));
}

function getAll() {
  return {
    slots: { ...historyData.slots },
    history: [...historyData.history],
    pinned: [...historyData.pinned]
  };
}

module.exports = {
  init,
  saveToSlot,
  getFromSlot,
  addToHistory,
  pinItem,
  unpinItem,
  deleteItem,
  search,
  getAll,
  reload
};
