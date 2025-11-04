const fs = require('fs');
const path = require('path');
const clipboardAddon = require('bindings')('clipboard_addon');

let HISTORY_FILE = '';

function init(filePath) {
  HISTORY_FILE = path.dirname(filePath);
  try {
    clipboardAddon.init(HISTORY_FILE);
  } catch (err) {
    console.error('[Clipboard Manager] Failed to initialize native addon:', err);
  }
}

function saveToSlot(slot, text) {
  if (!text) return;
  try {
    clipboardAddon.saveToSlot(slot, text);
    addToHistory(text);
    return true;
  } catch (err) {
    console.error('[Clipboard Manager] Failed to save to slot:', err);
    return false;
  }
}

function getFromSlot(slot) {
  try {
    return clipboardAddon.getFromSlot(slot);
  } catch (err) {
    console.error('[Clipboard Manager] Failed to get from slot:', err);
    return null;
  }
}

function addToHistory(text) {
  if (!text || text.trim() === '') return;
  try {
    clipboardAddon.addToHistory(text);
    return true;
  } catch (err) {
    console.error('[Clipboard Manager] Failed to add to history:', err);
    return false;
  }
}

function pinItem(text) {
  try {
    const history = clipboardAddon.getHistory();
    const index = history.findIndex(item => item.content === text);
    if (index !== -1) {
      clipboardAddon.pinItem(index);
      return true;
    }
    return false;
  } catch (err) {
    console.error('[Clipboard Manager] Failed to pin item:', err);
    return false;
  }
}

function unpinItem(text) {
  try {
    const history = clipboardAddon.getHistory();
    const index = history.findIndex(item => item.content === text);
    if (index !== -1) {
      clipboardAddon.unpinItem(index);
      return true;
    }
    return false;
  } catch (err) {
    console.error('[Clipboard Manager] Failed to unpin item:', err);
    return false;
  }
}

function deleteItem(text) {
  try {
    const history = clipboardAddon.getHistory();
    const index = history.findIndex(item => item.content === text);
    if (index !== -1) {
      clipboardAddon.deleteItem(index);
      console.log(`[Clipboard Manager] Deleted "${text}"`);
      return true;
    }
    return false;
  } catch (err) {
    console.error('[Clipboard Manager] Failed to delete item:', err);
    return false;
  }
}

function search(query) {
  try {
    if (!query) {
      return clipboardAddon.getHistory();
    }
    return clipboardAddon.searchHistory(query);
  } catch (err) {
    console.error('[Clipboard Manager] Failed to search history:', err);
    return [];
  }
}

function getAll() {
  try {
    const history = clipboardAddon.getHistory();
    const slots = {};
    for (let i = 0; i < 10; i++) {
      const slot = clipboardAddon.getFromSlot(i);
      if (slot) slots[i] = slot;
    }
    return {
      slots,
      history: history.map(item => item.content),
      pinned: history.filter(item => item.pinned).map(item => item.content)
    };
  } catch (err) {
    console.error('[Clipboard Manager] Failed to get all items:', err);
    return { slots: {}, history: [], pinned: [] };
  }
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
  getAll
};
