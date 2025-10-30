const vscode = require('vscode');
const { exec } = require('child_process');
const path = require('path');
const ClipboardDataProvider = require('./clipboardDataProvider');
const historyBackend = require('./historyBackend');
const fs = require('fs');

// Use relative path from extension directory to exe
const EXE_PATH = path.join(__dirname, '..', 'clipboard_manager.exe');
// Determine history file location. Preference order:
// 1. workspace root history.txt (if workspace open and file exists)
// 2. Windows AppData %APPDATA%\ClipboardManager\history.txt
// 3. fallback: repository history.txt (one level up from extension)
let HISTORY_FILE = path.join(__dirname, '..', 'history.txt');
try {
  if (vscode.workspace && vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
    const wsRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
    const wsHistory = path.join(wsRoot, 'history.txt');
    if (fs.existsSync(wsHistory)) {
      HISTORY_FILE = wsHistory;
    } else if (process.platform === 'win32' && process.env.APPDATA) {
      HISTORY_FILE = path.join(process.env.APPDATA, 'ClipboardManager', 'history.txt');
    }
  } else if (process.platform === 'win32' && process.env.APPDATA) {
    HISTORY_FILE = path.join(process.env.APPDATA, 'ClipboardManager', 'history.txt');
  }
} catch (e) {
  // fallback already set
}

/**
 * Runs the C++ CLI command and handles success/error.
 * @param {string} action 'copy' or 'paste'
 * @param {number} slot The slot index (0-9)
 * @param {function} successCallback Function to run on success (optional)
 */
function runClipboardCommand(action, slot, successCallback) {
    const cmd = `"${EXE_PATH}" ${action} ${slot}`;
    console.log("Running command:", cmd);

    exec(cmd, (err, stdout, stderr) => {
        if (err) {
            vscode.window.showErrorMessage(
                `ClipboardManager Error (${err.code}): ${stderr.trim() || 'Failed to execute command'}`
            );
            console.error(`Command failed:`, stderr);
            return;
        }

        if (successCallback) {
            successCallback();
        }
    });
}

function activate(context) {
  // Register TreeDataProvider
  const clipboardProvider = new ClipboardDataProvider(HISTORY_FILE);
  const treeView = vscode.window.createTreeView('clipboardHistory', {
    treeDataProvider: clipboardProvider
  });

  // Register Search webview view provider (shows an input field + results)
  const ClipboardSearchWebview = require('./clipboardSearchWebview');
  const searchWebviewProvider = new ClipboardSearchWebview(context, HISTORY_FILE);
  vscode.window.registerWebviewViewProvider('clipboardSearch', searchWebviewProvider, { webviewOptions: { retainContextWhenHidden: true } });

  // helper to refresh provider after backend changes
  function refreshAndNotify(msg) {
    clipboardProvider.refresh();
    if (msg) vscode.window.showInformationMessage(msg);
  }

  // Register paste command for tree items
  const pasteFromHistoryCmd = vscode.commands.registerCommand('clipboardHistory.paste', (contentOrItem) => {
    let text = '';
    if (typeof contentOrItem === 'string') text = contentOrItem;
    else if (contentOrItem && typeof contentOrItem.content === 'string') text = contentOrItem.content;
    if (!text) {
      vscode.window.showWarningMessage('No text to paste');
      return;
    }
    vscode.env.clipboard.writeText(text).then(() => {
      vscode.commands.executeCommand('editor.action.clipboardPasteAction');
    });
  });

  // Register copy command for inline button (copy to clipboard only)
  const copyFromHistoryCmd = vscode.commands.registerCommand('clipboardHistory.copy', (contentOrItem) => {
    let text = '';
    if (typeof contentOrItem === 'string') text = contentOrItem;
    else if (contentOrItem && typeof contentOrItem.content === 'string') text = contentOrItem.content;
    if (!text) {
      vscode.window.showWarningMessage('No text to copy');
      return;
    }
    vscode.env.clipboard.writeText(text).then(() => {
      vscode.window.showInformationMessage('Copied clip from history');
    }, (err) => {
      vscode.window.showErrorMessage('Failed to copy from history');
    });
  });

  // Register refresh command
  const refreshCmd = vscode.commands.registerCommand('clipboardHistory.refresh', () => {
    clipboardProvider.refresh();
  });

  // Open search tab and prompt for query
  const openSearchCmd = vscode.commands.registerCommand('clipboardHistory.openSearch', async () => {
    const q = await vscode.window.showInputBox({ prompt: 'Search clipboard history' });
    if (typeof q === 'undefined') return; // cancelled
    // Post the query to the webview-based search and reveal the container
    try { await searchWebviewProvider.searchAndReveal(q); } catch (e) { console.error('openSearch failed', e); }
  });

  // Copy multiple selected items from Search view (or quickpick)
  const copyMultipleCmd = vscode.commands.registerCommand('clipboardHistory.copyMultiple', async () => {
    // The Search view is now a webview; use a quick pick fallback to choose multiple items.
    const all = historyBackend.readHistory(HISTORY_FILE);
    const picks = await vscode.window.showQuickPick(all.map(i => ({ label: `${i.id}. ${i.content.substring(0,80)}`, id: i.id.toString(), content: i.content })), { canPickMany: true, placeHolder: 'Select items to copy' });
    if (!picks || !picks.length) return;
    const items = picks.map(p => p.content);
    const joined = items.join('\n');
    await vscode.env.clipboard.writeText(joined);
    vscode.window.showInformationMessage(`Copied ${items.length} item(s) (${joined.length} chars)`);
  });

  context.subscriptions.push(openSearchCmd, copyMultipleCmd);

  // --- CLI-like commands from the C++ CLI menu ---
  const addCmd = vscode.commands.registerCommand('clipboardHistory.add', async () => {
    const text = await vscode.window.showInputBox({ prompt: 'Enter text to add to history' });
    if (!text) return;
    historyBackend.addItem(HISTORY_FILE, text);
    refreshAndNotify('Added item to history');
  });

  const deleteCmd = vscode.commands.registerCommand('clipboardHistory.delete', async (item) => {
    let id = null;
    if (item && typeof item.id === 'number') id = item.id;
    else {
      const all = historyBackend.readHistory(HISTORY_FILE);
      const pick = await vscode.window.showQuickPick(all.map(i => ({ label: `${i.id}. ${i.content.substring(0,40)}`, id: i.id.toString() })), { placeHolder: 'Select item to delete' });
      if (!pick) return;
      id = parseInt(pick.id);
    }
    const confirm = await vscode.window.showWarningMessage(`Delete item ${id}?`, { modal: true }, 'Delete');
    if (confirm !== 'Delete') return;
    const deleted = historyBackend.deleteItem(HISTORY_FILE, id);
    if (deleted) refreshAndNotify(`Deleted item ${id}`);
    else vscode.window.showWarningMessage(`Item ${id} not found`);
  });

  const pinCmd = vscode.commands.registerCommand('clipboardHistory.pin', async (item) => {
    let id = null;
    if (item && typeof item.id === 'number') id = item.id;
    else {
      const all = historyBackend.readHistory(HISTORY_FILE);
      const pick = await vscode.window.showQuickPick(all.map(i => ({ label: `${i.id}. ${i.content.substring(0,40)}`, id: i.id.toString() })), { placeHolder: 'Select item to pin/unpin' });
      if (!pick) return;
      id = parseInt(pick.id);
    }
    // Toggle pin state
    const all = historyBackend.readHistory(HISTORY_FILE);
    const it = all.find(x => x.id === id);
    if (!it) { vscode.window.showWarningMessage(`Item ${id} not found`); return; }
    if (it.pinned) {
      historyBackend.unpinItem(HISTORY_FILE, id);
      refreshAndNotify(`Unpinned ${id}`);
    } else {
      historyBackend.pinItem(HISTORY_FILE, id);
      refreshAndNotify(`Pinned ${id}`);
    }
  });

  const undoCmd = vscode.commands.registerCommand('clipboardHistory.undoDelete', () => {
    const restored = historyBackend.undoDelete(HISTORY_FILE);
    if (restored) refreshAndNotify(`Restored ${restored.id}`);
    else vscode.window.showInformationMessage('Nothing to undo');
  });

  const showCmd = vscode.commands.registerCommand('clipboardHistory.show', async () => {
    const all = historyBackend.readHistory(HISTORY_FILE);
    if (!all.length) { vscode.window.showInformationMessage('History empty'); return; }
    const out = all.map(i => `${i.id}. ${i.content}${i.pinned ? ' [Pinned]' : ''}`).join('\n');
    const doc = await vscode.workspace.openTextDocument({ content: out, language: 'text' });
    await vscode.window.showTextDocument(doc, { preview: false });
  });

  const searchCmd = vscode.commands.registerCommand('clipboardHistory.search', async () => {
    const q = await vscode.window.showInputBox({ prompt: 'Enter search query' });
    if (!q) return;
    const results = historyBackend.search(HISTORY_FILE, q);
    if (!results.length) { vscode.window.showInformationMessage('No matches'); return; }
  const pick = await vscode.window.showQuickPick(results.map(i => ({ label: `${i.id}. ${i.content.substring(0,80)}`, id: i.id.toString() })), { placeHolder: 'Search results' });
    if (!pick) return;
    // paste or copy selected
  const chosen = results.find(r => r.id === parseInt(pick.id));
    if (chosen) {
      vscode.env.clipboard.writeText(chosen.content).then(() => {
        vscode.commands.executeCommand('editor.action.clipboardPasteAction');
      });
    }
  });

  context.subscriptions.push(addCmd, deleteCmd, pinCmd, undoCmd, showCmd, searchCmd);

  context.subscriptions.push(treeView, pasteFromHistoryCmd, refreshCmd);
  context.subscriptions.push(copyFromHistoryCmd);

  // Intercept Ctrl+C: copy then ask to add to history
  const captureCopyCmd = vscode.commands.registerCommand('clipboardHistory.captureCopy', async () => {
    // perform built-in copy
    await vscode.commands.executeCommand('editor.action.clipboardCopyAction');
    // read clipboard
    const text = await vscode.env.clipboard.readText();
    if (!text || text.trim() === '') {
      vscode.window.showInformationMessage('Copied empty text');
      return;
    }
    const choice = await vscode.window.showQuickPick(['Add', 'Add & Pin', 'Ignore'], { placeHolder: 'Add copied text to history?' });
    if (!choice || choice === 'Ignore') return;
    if (choice === 'Add') {
      historyBackend.addItem(HISTORY_FILE, text);
    } else if (choice === 'Add & Pin') {
      const it = historyBackend.addItem(HISTORY_FILE, text);
      historyBackend.pinItem(HISTORY_FILE, it.id);
    }
    clipboardProvider.refresh();
    vscode.window.showInformationMessage('Copied text processed');
  });
  context.subscriptions.push(captureCopyCmd);

  // Register slot commands
  for (let i = 0; i < 10; i++) {
    // --- COPY Command Handler (Ctrl + i) ---
    const copyCmd  = vscode.commands.registerCommand(`clipboard.copy${i}`, () => {
        // 1. Trigger the built-in VS Code copy command first.
        // This puts the user's selection onto the system clipboard.
        vscode.commands.executeCommand('editor.action.clipboardCopyAction')
            .then(() => {
                // 2. THEN run C++ to read the system clipboard and save it to the file.
                runClipboardCommand('copy', i, () => {
                     vscode.window.showInformationMessage(`✅ Copied selection to slot ${i}`);
                       clipboardProvider.refresh(); // Refresh tree view after copy
                       // Also write per-slot file from the system clipboard so other tools can read slotN.txt
                       vscode.env.clipboard.readText().then((txt) => {
                         try {
                           historyBackend.setSlot(HISTORY_FILE, i, txt);
                         } catch (e) {
                           console.error('Failed to write slot file from extension:', e);
                         }
                       });
                });
            });
    });

    // --- PASTE Command Handler (Alt + i) ---
    const pasteCmd = vscode.commands.registerCommand(`clipboard.paste${i}`, () => {
        // 1. Run C++ to load the clip from file and put it onto the system clipboard.
        runClipboardCommand('paste', i, () => {
            // 2. THEN, after the system clipboard is updated, trigger the native paste action.
            vscode.commands.executeCommand('editor.action.clipboardPasteAction')
                .then(() => {
                    vscode.window.showInformationMessage(`📋 Pasted from slot ${i}`);
                });
        });
    });
    
    context.subscriptions.push(copyCmd, pasteCmd);
  }
}

function deactivate() {}

module.exports = { activate, deactivate };