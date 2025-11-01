const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const child_process = require('child_process');

const dataDir = path.join(vscode.workspace.rootPath || '.', 'data');
const slotsDir = path.join(dataDir, 'slots');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(slotsDir)) fs.mkdirSync(slotsDir, { recursive: true });

const HISTORY_FILE = path.join(dataDir, 'history.txt');
const EXE_PATH = path.join(vscode.workspace.rootPath || '.', 'clipboard_manager.exe'); // adjust if needed

const historyBackend = require('./historyBackend');
const ClipboardDataProvider = require('./clipboardDataProvider');

function activate(context) {
    const provider = new ClipboardDataProvider(HISTORY_FILE, slotsDir);
    vscode.window.registerTreeDataProvider('clipboardHistory', provider);

    context.subscriptions.push(
        vscode.commands.registerCommand('clipboard.refresh', () => provider.refresh()),
        vscode.commands.registerCommand('clipboard.openSearch', () => {
            vscode.commands.executeCommand('workbench.action.quickOpen', '>Clipboard Search');
        }),
        vscode.commands.registerCommand('clipboard.paste', async (args) => {
            const slot = args && typeof args.slot !== 'undefined' ? args.slot : undefined;
            if (slot === undefined) {
                vscode.window.showInputBox({ prompt: 'Paste slot number (0-9)' }).then(async (val) => {
                    if (val === undefined) return;
                    const n = parseInt(val);
                    await doPaste(n);
                });
            } else {
                await doPaste(slot);
            }
        }),
        vscode.commands.registerCommand('clipboard.copy', async (args) => {
            const slot = args && typeof args.slot !== 'undefined' ? args.slot : undefined;
            let text = '';
            // Use editor selection if available
            const editor = vscode.window.activeTextEditor;
            if (editor && !editor.selection.isEmpty) {
                text = editor.document.getText(editor.selection);
            } else {
                // fallback: read system clipboard
                text = await vscode.env.clipboard.readText();
            }
            if (slot === undefined) {
                const val = await vscode.window.showInputBox({ prompt: 'Copy to slot (0-9)' });
                if (!val) return;
                const n = parseInt(val);
                await doCopy(n, text);
            } else {
                await doCopy(slot, text);
            }
        }),
        vscode.commands.registerCommand('clipboard.setSlot', async (args) => {
            const slot = args && typeof args.slot !== 'undefined' ? args.slot : undefined;
            const value = await vscode.window.showInputBox({ prompt: 'Text to set into slot' });
            if (!value) return;
            const n = slot === undefined ? 0 : slot;
            historyBackend.setSlot(path.join(slotsDir, `slot_${n}.txt`), n, value);
            vscode.window.showInformationMessage(`Set slot ${n}`);
            provider.refresh();
        }),
        vscode.commands.registerCommand('clipboard.pin', async (item) => {
            historyBackend.pinItem(HISTORY_FILE, item.index);
            provider.refresh();
        }),
        vscode.commands.registerCommand('clipboard.unpin', async (item) => {
            historyBackend.unpinItem(HISTORY_FILE, item.index);
            provider.refresh();
        }),
        vscode.commands.registerCommand('clipboard.delete', async (item) => {
            historyBackend.deleteItem(HISTORY_FILE, item.index);
            provider.refresh();
        }),
        vscode.commands.registerCommand('clipboard.undo', async () => {
            historyBackend.undoDelete(HISTORY_FILE);
            provider.refresh();
        }),
        vscode.commands.registerCommand('clipboard.openItem', async (item) => {
            // When user clicks an item in the tree, paste it into editor.
            if (!item) return;
            // Copy item content to slot 0 temporarily then paste via VS Code paste action
            await vscode.env.clipboard.writeText(item.content);
            await vscode.commands.executeCommand('editor.action.clipboardPasteAction');
        })
    );

    // helper: copy content to slot file and update history
    async function doCopy(slot, text) {
        if (typeof slot !== 'number' || slot < 0 || slot > 9) {
            vscode.window.showErrorMessage('Slot must be 0-9');
            return;
        }
        // prefer to call native exe to set system slot (if exists) so other native tools can read
        if (fs.existsSync(EXE_PATH)) {
            try {
                // spawn exe as separate process to avoid locking
                child_process.spawn(EXE_PATH, ['copy', String(slot)], { detached: true, shell: true, stdio: 'ignore' });
                // Also write slot file directly
                historyBackend.setSlot(path.join(slotsDir, `slot_${slot}.txt`), slot, text);
            } catch (e) {
                console.error(e);
            }
        } else {
            historyBackend.setSlot(path.join(slotsDir, `slot_${slot}.txt`), slot, text);
        }
        historyBackend.addItem(HISTORY_FILE, text);
        provider.refresh();
        vscode.window.showInformationMessage(`Copied to slot ${slot}`);
    }

    // helper: paste slot into editor
    async function doPaste(slot) {
        if (typeof slot !== 'number' || slot < 0 || slot > 9) {
            vscode.window.showErrorMessage('Slot must be 0-9');
            return;
        }
        if (fs.existsSync(EXE_PATH)) {
            // ask exe to update system clipboard then trigger paste action
            try {
                await new Promise((resolve, reject) => {
                    const p = child_process.spawn(EXE_PATH, ['paste', String(slot)], { shell: true });
                    p.on('exit', (code) => {
                        resolve();
                    });
                    p.on('error', reject);
                });
                // Now trigger paste
                await vscode.commands.executeCommand('editor.action.clipboardPasteAction');
            } catch (e) {
                console.error('Failed to run exe', e);
                // fallback to reading slot file
                const txt = historyBackend.readSlotFile(path.join(slotsDir, `slot_${slot}.txt`));
                if (txt !== null) {
                    await vscode.env.clipboard.writeText(txt);
                    await vscode.commands.executeCommand('editor.action.clipboardPasteAction');
                }
            }
        } else {
            const txt = historyBackend.readSlotFile(path.join(slotsDir, `slot_${slot}.txt`));
            if (txt !== null) {
                await vscode.env.clipboard.writeText(txt);
                await vscode.commands.executeCommand('editor.action.clipboardPasteAction');
            } else {
                vscode.window.showWarningMessage(`Slot ${slot} empty`);
            }
        }
    }
}
exports.activate = activate;

function deactivate() {}
exports.deactivate = deactivate;
