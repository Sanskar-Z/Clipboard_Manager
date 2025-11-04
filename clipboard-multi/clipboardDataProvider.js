const vscode = require('vscode');

class ClipboardDataProvider {
  constructor(backend) {
    this.backend = backend;
    this._onDidChangeTreeData = new vscode.EventEmitter();
    this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    this.allItems = backend.getAll();
  }

  refresh() {
    this.allItems = this.backend.getAll();
    this._onDidChangeTreeData.fire();
  }

  search(query) {
    try {
      const results = this.backend.search(query);
      this.allItems.history = Array.isArray(results) ? results : [];
      this._onDidChangeTreeData.fire();
    } catch (err) {
      vscode.window.showErrorMessage(`❌ Search failed: ${err.message}`);
    }
  }

  getTreeItem(element) {
    return element;
  }

  getChildren() {
    const { slots = {}, pinned = [], history = [] } = this.allItems || {};
    const items = [];

    // --- 🧩 SLOTS ---
    items.push(this._createSectionHeader('📜  Slots'));
    const slotEntries = Object.entries(slots);
    if (slotEntries.length) {
      for (const [slot, text] of slotEntries) {
        const safeText = this._sanitize(text);
        const item = new vscode.TreeItem(`🔹 Slot ${slot}: ${safeText}`, vscode.TreeItemCollapsibleState.None);
        item.iconPath = new vscode.ThemeIcon('database');
        item.contextValue = 'slot';
        item.tooltip = `📋 Slot ${slot}\n\n${safeText}`;
        item.command = {
          command: 'clipboard.paste',
          title: 'Paste from Slot',
          arguments: [{ slot }],
        };
        items.push(item);
      }
    } else {
      items.push(this._createEmptyMessage('No saved slots'));
    }

    // --- 📌 PINNED ITEMS ---
    items.push(this._createSectionHeader('📌  Pinned'));
    if (pinned.length) {
      pinned.forEach((text, index) => {
        const fullText = this._getFullText(text);
        const safeText = this._sanitize(fullText);
        const item = new vscode.TreeItem(`${index + 1}. ${safeText}`, vscode.TreeItemCollapsibleState.None);
        item.iconPath = new vscode.ThemeIcon('pin');
        item.tooltip = `📍 Pinned item\n\n${fullText}`;
        item.contextValue = 'pinnedItem';
        item.label = `${index + 1}. ${safeText}`;
        item.command = {
          command: 'clipboard.copyAndSave',
          title: 'Copy Pinned Item',
          arguments: [fullText],
        };
        items.push(item);
      });
    } else {
      items.push(this._createEmptyMessage('No pinned items'));
    }

    // --- 🕘 HISTORY ITEMS ---
    items.push(this._createSectionHeader('⌛  History'));
    const filteredHistory = history.filter((text) => !pinned.includes(text));
    if (filteredHistory.length) {
      filteredHistory.forEach((text, index) => {
        const fullText = this._getFullText(text);
        const safeText = this._sanitize(fullText);
        const item = new vscode.TreeItem(`${index + 1}. ${safeText}`, vscode.TreeItemCollapsibleState.None);
        item.iconPath = new vscode.ThemeIcon('clock');
        item.tooltip = `📄 Clipboard item\n\n${fullText}`;
        item.contextValue = 'historyItem';
        item.label = `${index + 1}. ${safeText}`;
        item.command = {
          command: 'clipboard.copyAndSave',
          title: 'Copy History Item',
          arguments: [fullText],
        };
        items.push(item);
      });
    } else {
      items.push(this._createEmptyMessage('No history items'));
    }

    // --- 🧼 FALLBACK ---
    if (!slotEntries.length && !pinned.length && !history.length) {
      const empty = new vscode.TreeItem('✨ Clipboard is empty — copy something to begin!');
      empty.iconPath = new vscode.ThemeIcon('info');
      empty.contextValue = 'empty';
      items.push(empty);
    }

    return items;
  }

  // --- 🧠 Helpers ---
  _sanitize(text) {
    // Preserve first line for display, indicate if there are more lines
    const lines = (text || '').split(/\r?\n/);
    if (lines.length > 1) {
      return `${lines[0].trim()}... (+${lines.length - 1} more lines)`;
    }
    return (text || '').trim() || '[Empty]';
  }

  _getFullText(text) {
    // Remove any index prefix if present (e.g., "1. text")
    return text.replace(/^\d+\.\s*/, '');
  }

  _createSectionHeader(label) {
    const item = new vscode.TreeItem(label, vscode.TreeItemCollapsibleState.None);
    item.iconPath = new vscode.ThemeIcon('symbol-namespace');
    item.contextValue = 'section';
    item.tooltip = label.replace(/📜|📌|⌛/g, '').trim();
    return item;
  }

  _createEmptyMessage(label) {
    const item = new vscode.TreeItem(`🕳️ ${label}`, vscode.TreeItemCollapsibleState.None);
    item.iconPath = new vscode.ThemeIcon('circle-slash');
    item.contextValue = 'empty';
    return item;
  }
}

module.exports = ClipboardDataProvider;
