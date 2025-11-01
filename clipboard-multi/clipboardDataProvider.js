const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const historyBackend = require('./historyBackend');

class ClipboardItem extends vscode.TreeItem {
    constructor(label, collapsibleState, meta) {
        super(label, collapsibleState);
        this.meta = meta;
        this.command = {
            title: 'Open item',
            command: 'clipboard.openItem',
            arguments: [this.meta]
        };
        this.contextValue = 'clipboardItem';
    }
}

class ClipboardDataProvider {
    constructor(historyPath, slotsDir) {
        this.historyPath = historyPath;
        this.slotsDir = slotsDir;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }

    refresh() {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element) {
        return element;
    }

    getChildren(element) {
        if (!element) {
            // root: two groups: Slots and History
            const children = [];
            // slots as top-level collapsible
            const slotsNode = new ClipboardItem('Slots', vscode.TreeItemCollapsibleState.Collapsed, { type: 'slots' });
            const historyNode = new ClipboardItem('History', vscode.TreeItemCollapsibleState.Collapsed, { type: 'history' });
            return Promise.resolve([slotsNode, historyNode]);
        } else {
            if (element.meta && element.meta.type === 'slots') {
                // return slot items
                const arr = [];
                for (let i = 0; i <= 9; ++i) {
                    const p = path.join(this.slotsDir, `slot_${i}.txt`);
                    let label = `Slot ${i} (empty)`;
                    let content = '';
                    if (fs.existsSync(p)) {
                        try { content = fs.readFileSync(p, 'utf8'); } catch (e) { content = ''; }
                        const preview = content.length > 60 ? content.slice(0, 57) + '...' : content;
                        label = `Slot ${i}: ${preview}`;
                    }
                    const meta = { type: 'slot', index: i, content };
                    const it = new ClipboardItem(label, vscode.TreeItemCollapsibleState.None, meta);
                    it.tooltip = content;
                    arr.push(it);
                }
                return Promise.resolve(arr);
            } else if (element.meta && element.meta.type === 'history') {
                const items = historyBackend.readHistory(this.historyPath);
                const arr = items.map(it => {
                    const preview = it.content.length > 80 ? it.content.slice(0, 77) + '...' : it.content;
                    const label = `${it.pinned ? '📌 ' : ''}${preview}`;
                    const meta = { type: 'historyItem', index: it.index, content: it.content, timestamp: it.timestamp, pinned: it.pinned };
                    const ti = new ClipboardItem(label, vscode.TreeItemCollapsibleState.None, meta);
                    ti.tooltip = `${it.timestamp}\n${it.content}`;
                    return ti;
                });
                return Promise.resolve(arr);
            }
        }
        return Promise.resolve([]);
    }
}

module.exports = ClipboardDataProvider;
