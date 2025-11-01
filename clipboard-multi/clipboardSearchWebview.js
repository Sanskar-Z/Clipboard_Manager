const vscode = require('vscode');
const historyBackend = require('./historyBackend');

async function openSearch(historyFile) {
    const items = historyBackend.readHistory(historyFile);
    const picks = items.map(it => ({ label: it.content.length > 80 ? it.content.slice(0,77) + '...' : it.content, description: it.timestamp, full: it }));
    const sel = await vscode.window.showQuickPick(picks, { placeHolder: 'Search clipboard history (type to filter)' });
    if (sel) {
        await vscode.env.clipboard.writeText(sel.full.content);
        await vscode.commands.executeCommand('editor.action.clipboardPasteAction');
    }
}

module.exports = {
    openSearch
};
