const fs = require('fs');
const path = require('path');

let clipboardAddon = null;
let HISTORY_FILE = '';

// Try to load the native addon
try {
  clipboardAddon = require('bindings')('clipboard_addon');
} catch (err) {
  console.error('[Clipboard Manager] Failed to load native addon:', err.message);
  console.error('[Clipboard Manager] Please run "npm run build" in the extension root directory');
}

function init(filePath) {
  if (!clipboardAddon) {
    throw new Error('Native addon not loaded. Please build the extension first.');
  }
  
  HISTORY_FILE = path.dirname(filePath);
  
  // Ensure data directory exists
  if (!fs.existsSync(HISTORY_FILE)) {
    fs.mkdirSync(HISTORY_FILE, { recursive: true });
  }
  
  try {
    clipboardAddon.init(HISTORY_FILE);
    console.log('[Clipboard Manager] Initialized with data directory:', HISTORY_FILE);
  } catch (err) {
    console.error('[Clipboard Manager] Failed to initialize native addon:', err);
    throw err;
  }
}

function saveToSlot(slot, text) {
  if (!clipboardAddon) return false;
  if (!text) return false;
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
  if (!clipboardAddon) return null;
  try {
    return clipboardAddon.getFromSlot(slot);
  } catch (err) {
    console.error('[Clipboard Manager] Failed to get from slot:', err);
    return null;
  }
}

function addToHistory(text) {
  if (!clipboardAddon) return false;
  if (!text || text.trim() === '') return false;
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
  if (!clipboardAddon) return false;
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
  if (!clipboardAddon) return false;
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
  if (!clipboardAddon) return false;
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
  if (!clipboardAddon) return [];
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
  if (!clipboardAddon) {
    return { slots: {}, history: [], pinned: [] };
  }
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
