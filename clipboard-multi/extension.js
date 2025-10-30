const vscode = require('vscode');
const { exec } = require('child_process');
const path = require('path');

// Use relative path from extension directory to exe
const EXE_PATH = path.join(__dirname, '..', 'clipboard_manager.exe');

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