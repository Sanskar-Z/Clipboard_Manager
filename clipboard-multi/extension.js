// 📋 Clipboard Manager for VS Code
// --------------------------------
// Main Extension Activation File

const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const historyBackend = require('./historyBackend');
const ClipboardDataProvider = require('./clipboardDataProvider');

let dataProvider;

function activate(context) {
  const workspacePath = vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath || __dirname;
  const historyFilePath = path.join(workspacePath, 'clipboard_history.json');

  // ✅ Ensure history file exists
  if (!fs.existsSync(historyFilePath)) {
    fs.writeFileSync(historyFilePath, JSON.stringify({ slots: {}, pinned: [], history: [] }, null, 2));
  }

  // ✅ Initialize backend
  historyBackend.init(historyFilePath);

  // ✅ Create and register TreeDataProvider
  dataProvider = new ClipboardDataProvider(historyBackend);
  vscode.window.registerTreeDataProvider('clipboardView', dataProvider);

  // --------------------------------------------------------------------------
  // 🧩 Commands
  // --------------------------------------------------------------------------

  // 🔄 Refresh
  register(context, 'clipboard.refresh', () => dataProvider.refresh());

  // 📋 Copy to slot
  register(context, 'clipboard.copy', async (args) => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const selectedText = editor.document.getText(editor.selection);
    if (!selectedText.trim()) return vscode.window.showWarningMessage('⚠️ No text selected.');

    historyBackend.saveToSlot(args.slot, selectedText);
    vscode.window.showInformationMessage(`✅ Copied to Slot ${args.slot}`);
    dataProvider.refresh();
  });

  // 📥 Paste from slot
  register(context, 'clipboard.paste', async (args) => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const text = historyBackend.getFromSlot(args.slot);
    if (!text) return vscode.window.showWarningMessage(`⚠️ Slot ${args.slot} is empty.`);

    await editor.edit((builder) => builder.replace(editor.selection, text));
    vscode.window.showInformationMessage(`📥 Pasted from Slot ${args.slot}`);
  });

  // 💾 Copy and Save
  register(context, 'clipboard.copyAndSave', async (textArg) => {
    let text = textArg;
    if (!text) {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;
      text = editor.document.getText(editor.selection);
    }

    if (!text || !text.trim()) return vscode.window.showWarningMessage('⚠️ Nothing to copy.');

    historyBackend.addToHistory(text);
    vscode.window.showInformationMessage('💾 Saved to clipboard history.');
    dataProvider.refresh();
  });

  // 📌 Pin item
  register(context, 'clipboard.pin', (item) => {
    const cleanText = getCleanLabel(item);
    if (!cleanText) return;

    historyBackend.pinItem(cleanText);
    vscode.window.showInformationMessage(`📌 Pinned item: "${cleanText}"`);
    dataProvider.refresh();
  });

  // 📤 Unpin item
  register(context, 'clipboard.unpin', (item) => {
    const cleanText = getCleanLabel(item);
    if (!cleanText) return;

    historyBackend.unpinItem(cleanText);
    vscode.window.showInformationMessage(`📤 Unpinned item: "${cleanText}"`);
    dataProvider.refresh();
  });

  // ❌ Delete item
  register(context, 'clipboard.delete', async (item) => {
    const cleanText = getCleanLabel(item);
    if (!cleanText) return;

    const confirm = await vscode.window.showQuickPick(['Yes', 'No'], {
      placeHolder: `🗑️ Delete "${cleanText}" from clipboard history?`,
    });

    if (confirm === 'Yes') {
      historyBackend.deleteItem(cleanText);
      vscode.window.showInformationMessage(`🗑️ Deleted: "${cleanText}"`);
      dataProvider.refresh();
    }
  });

  // 🔍 Search
  register(context, 'clipboard.search', async () => {
    const query = await vscode.window.showInputBox({ prompt: '🔍 Search clipboard history...' });
    if (query !== undefined) dataProvider.search(query);
  });

  console.log('✅ Clipboard Manager activated successfully.');
}

// --------------------------------------------------------------------------
// 🧠 Utility Functions
// --------------------------------------------------------------------------

function getCleanLabel(item) {
  // If no item or label, return empty
  if (!item?.label) return '';
  
  // Get the full text from tooltip which contains the complete content
  const tooltipText = item.tooltip || '';
  const match = tooltipText.match(/(?:📍 Pinned item|📋 History item)\n\n([\s\S]+)/);
  
  // If we found the full text in tooltip, use that
  if (match) {
    return match[1];
  }
  
  // Fallback to label if tooltip parsing fails
  return item.label.replace(/^\d+\.\s*/, '');
}

function register(context, command, callback) {
  context.subscriptions.push(vscode.commands.registerCommand(command, callback));
}

function deactivate() {}

module.exports = { activate, deactivate };
