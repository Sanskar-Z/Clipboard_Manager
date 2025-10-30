const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

class ClipboardTreeItem extends vscode.TreeItem {
    constructor(id, content, pinned) {
        const shortContent = content.length > 40 ? content.substring(0, 40) + '...' : content;
        // show id first so it's easy to operate from UI
        super(`${id}. ${shortContent}`, vscode.TreeItemCollapsibleState.None);
        this.id = id;
        this.content = content;
        this.tooltip = content;
        this.command = {
            command: 'clipboardHistory.paste',
            title: 'Paste',
            arguments: [content]
        };
        // allow view/item menus and inline actions to target this item
        this.contextValue = 'historyItem';
        this.iconPath = pinned 
            ? new vscode.ThemeIcon('pinned')
            : new vscode.ThemeIcon('clippy');
    }
}

class ClipboardDataProvider {
    constructor(historyFile) {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.historyFile = historyFile;
    }

    refresh() {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element) {
        return element;
    }

    getChildren() {
        try {
            if (!fs.existsSync(this.historyFile)) {
                return Promise.resolve([]);
            }

            const content = fs.readFileSync(this.historyFile, 'utf8');
            const items = content.split('\n')
                .filter(line => line.trim())
                .map(line => {
                    const parts = line.split('|');
                    if (parts.length < 4) return null;
                    const id = parseInt(parts[0]);
                    const pinned = parts[2] === '1' || parts[2] === 'true';
                    // join remaining parts as content in case '|' appears in the text
                    const text = parts.slice(3).join('|');
                    return new ClipboardTreeItem(id, text, pinned);
                })
                .filter(x => x !== null);

            return Promise.resolve(items);
        } catch (error) {
            console.error('Error reading clipboard history:', error);
            return Promise.resolve([]);
        }
    }
}

module.exports = ClipboardDataProvider;