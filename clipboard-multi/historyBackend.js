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
    // Clean any existing number prefixes or display artifacts
    const cleanText = cleanDisplayText(text);
    
    // Check if this content already exists by first line
    const history = clipboardAddon.getHistory();
    const firstLineNew = getFirstLine(cleanText);
    const exists = history.some(item => getFirstLine(item.content) === firstLineNew);
    
    if (!exists) {
      clipboardAddon.addToHistory(cleanText);
      return true;
    }
    return false;
  } catch (err) {
    console.error('[Clipboard Manager] Failed to add to history:', err);
    return false;
  }
}

function cleanDisplayText(text) {
  // Clean the display format text to get original content
  return text
    .replace(/^\d+\.\s*/, '') // Remove index prefix
    .replace(/\.\.\. \(\+\d+ more lines\)$/, '') // Remove "more lines" suffix
    .trim();
}

function getFirstLine(text) {
  return text.split(/\r?\n/)[0].trim();
}

function findItemIndex(history, text) {
  // Clean the target text of any display artifacts and normalize
  const cleanText = cleanDisplayText(text);
  
  // Find exact match of full content, not just first line
  return history.findIndex(item => {
    const itemContent = cleanDisplayText(item.content);
    return itemContent === cleanText;
  });
}

function pinItem(text) {
  try {
    const history = clipboardAddon.getHistory();
    const index = findItemIndex(history, text);
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
    const index = findItemIndex(history, text);
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
    const index = findItemIndex(history, text);
    if (index !== -1) {
      clipboardAddon.deleteItem(index);
      console.log(`[Clipboard Manager] Deleted item at index ${index}`);
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
