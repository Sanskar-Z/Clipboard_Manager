const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const ClipboardDataProvider = require('./clipboardDataProvider');
const historyBackend = require('./historyBackend');

let clipboardWatcher;
let lastClipboardText = '';

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    // 🗂️ Store data in the project folder instead of global storage
    const projectDataDir = path.join(__dirname, 'data');
    const slotsDir = path.join(projectDataDir, 'slots');
    const historyFile = path.join(projectDataDir, 'history.txt');

    // Ensure local data folders exist
    if (!fs.existsSync(projectDataDir)) fs.mkdirSync(projectDataDir, { recursive: true });
    if (!fs.existsSync(slotsDir)) fs.mkdirSync(slotsDir, { recursive: true });
    if (!fs.existsSync(historyFile)) fs.writeFileSync(historyFile, '', 'utf8');

    // Tree View Provider
    const provider = new ClipboardDataProvider(historyFile, slotsDir);
    vscode.window.registerTreeDataProvider('clipboardView', provider);

    // 🔄 Refresh Command
    context.subscriptions.push(
        vscode.commands.registerCommand('clipboard.refresh', () => provider.refresh())
    );

    // 📋 Open item (preview)
    context.subscriptions.push(
        vscode.commands.registerCommand('clipboard.openItem', async (meta) => {
            if (!meta?.content) return;
            const doc = await vscode.workspace.openTextDocument({
                content: meta.content,
                language: 'plaintext'
            });
            vscode.window.showTextDocument(doc, { preview: true });
        })
    );

    // 📌 Pin / Unpin
    context.subscriptions.push(
        vscode.commands.registerCommand('clipboard.pin', (meta) => {
            historyBackend.pinItem(historyFile, meta.index);
            provider.refresh();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('clipboard.unpin', (meta) => {
            historyBackend.unpinItem(historyFile, meta.index);
            provider.refresh();
        })
    );

    // 🗑️ Delete and Undo
    context.subscriptions.push(
        vscode.commands.registerCommand('clipboard.delete', (meta) => {
            historyBackend.deleteItem(historyFile, meta.index);
            provider.refresh();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('clipboard.undo', () => {
            historyBackend.undoDelete(historyFile);
            provider.refresh();
        })
    );

    // 💾 Manual slot set
    context.subscriptions.push(
        vscode.commands.registerCommand('clipboard.setSlot', async () => {
            const slotNum = await vscode.window.showInputBox({
                prompt: 'Enter slot number (0-9):',
                validateInput: (val) =>
                    /^[0-9]$/.test(val) ? null : 'Enter a single digit between 0 and 9'
            });
            if (!slotNum) return;
            const text = await vscode.window.showInputBox({ prompt: 'Enter text to store in slot' });
            if (!text) return;
            const filePath = path.join(slotsDir, `slot_${slotNum}.txt`);
            fs.writeFileSync(filePath, text, 'utf8');
            provider.refresh();
        })
    );

    // ⚡ Copy to Slot Command (Ctrl + 0–9)
    context.subscriptions.push(
        vscode.commands.registerCommand('clipboard.copy', async (args) => {
            const slot = args?.slot ?? 0;
            const editor = vscode.window.activeTextEditor;
            if (!editor) return;
            const selection = editor.document.getText(editor.selection);
            if (!selection) return;
            const filePath = path.join(slotsDir, `slot_${slot}.txt`);
            fs.writeFileSync(filePath, selection, 'utf8');
            vscode.window.showInformationMessage(`Copied to slot ${slot}`);
            provider.refresh();
        })
    );

    // ⚡ Paste from Slot Command (Alt + 0–9)
    context.subscriptions.push(
        vscode.commands.registerCommand('clipboard.paste', async (args) => {
            const slot = args?.slot ?? 0;
            const filePath = path.join(slotsDir, `slot_${slot}.txt`);
            if (!fs.existsSync(filePath)) {
                vscode.window.showWarningMessage(`Slot ${slot} is empty`);
                return;
            }
            const text = fs.readFileSync(filePath, 'utf8');
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                editor.edit(editBuilder => editBuilder.insert(editor.selection.active, text));
                vscode.window.showInformationMessage(`Pasted from slot ${slot}`);
            }
        })
    );

    // 🧠 Background Clipboard Watcher — Auto add copied text to history
    clipboardWatcher = setInterval(async () => {
        try {
            const currentText = await vscode.env.clipboard.readText();
            if (currentText && currentText.trim() && currentText !== lastClipboardText) {
                lastClipboardText = currentText;
                historyBackend.addItem(historyFile, currentText);
                provider.refresh();
            }
        } catch (err) {
            console.error('Clipboard watcher error:', err);
        }
    }, 1000);

    // ⚡ Normal Copy (Ctrl + C) → Also Save to History
    context.subscriptions.push(
        vscode.commands.registerCommand('clipboard.copyAndSave', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) return;

            // Perform normal copy
            await vscode.commands.executeCommand('editor.action.clipboardCopyAction');

            // Add copied content to history
            const copiedText = await vscode.env.clipboard.readText();
            if (copiedText && copiedText.trim()) {
                historyBackend.addItem(historyFile, copiedText);
                vscode.window.setStatusBarMessage('✅ Copied & added to history', 2000);
                provider.refresh();
            }
        })
    );

    vscode.window.showInformationMessage('📋 Clipboard Manager Activated');
}

function deactivate() {
    if (clipboardWatcher) clearInterval(clipboardWatcher);
}

module.exports = { activate, deactivate };
