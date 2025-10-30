const vscode = require('vscode');
const historyBackend = require('./historyBackend');

class ClipboardSearchWebviewProvider {
  constructor(context, historyFile) {
    this.context = context;
    this.historyFile = historyFile;
  }

  async searchAndReveal(query) {
    try {
      const results = historyBackend.search(this.historyFile, query || '');
      if (this._view && this._view.webview) {
        this._view.webview.postMessage({ command: 'results', results: results.map(r => ({ id: r.id, content: r.content, pinned: r.pinned })) });
      }
      // Try to reveal the container so the user sees the search view
      try { await vscode.commands.executeCommand('workbench.view.extension.clipboard-history-container'); } catch (e) {}
    } catch (e) {
      console.error('searchAndReveal failed', e);
    }
  }

  resolveWebviewView(webviewView) {
    this._view = webviewView;
    webviewView.webview.options = { enableScripts: true };
    webviewView.webview.html = this._getHtml();

    webviewView.webview.onDidReceiveMessage(async (msg) => {
      if (msg.command === 'search') {
        try {
          const results = historyBackend.search(this.historyFile, msg.query || '');
          // send compact results
          webviewView.webview.postMessage({ command: 'results', results: results.map(r => ({ id: r.id, content: r.content, pinned: r.pinned })) });
        } catch (e) {
          console.error('Search failed', e);
          webviewView.webview.postMessage({ command: 'results', results: [] });
        }
      } else if (msg.command === 'copy') {
        const text = msg.text || '';
        await vscode.env.clipboard.writeText(text);
        vscode.window.showInformationMessage('Copied selection from search');
      } else if (msg.command === 'paste') {
        const text = msg.text || '';
        await vscode.env.clipboard.writeText(text);
        // trigger editor paste
        await vscode.commands.executeCommand('editor.action.clipboardPasteAction');
      } else if (msg.command === 'copyMultiple') {
        const items = msg.items || [];
        const joined = items.join('\n');
        await vscode.env.clipboard.writeText(joined);
        vscode.window.showInformationMessage(`Copied ${items.length} item(s)`);
      }
    });
  }

  _getHtml() {
    const nonce = Date.now();
    return `<!doctype html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'nonce-${nonce}'; style-src 'unsafe-inline';">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: var(--vscode-font-family); color: var(--vscode-foreground); background: transparent; padding: 8px; }
        input[type=text] { width: 100%; padding: 6px 8px; box-sizing: border-box; margin-bottom: 8px; }
        .result { padding: 6px; border-bottom: 1px solid rgba(128,128,128,0.12); cursor: pointer; }
        .controls { margin-top: 8px; display:flex; gap:8px; }
        button { padding:6px 10px; }
        .pinned { color: var(--vscode-icon-foreground); font-weight: 600; }
        .empty { color: rgba(128,128,128,0.9); }
      </style>
    </head>
    <body>
      <input id="q" type="text" placeholder="Search clipboard history..." />
      <div id="results"></div>
      <div class="controls">
        <button id="copySelected">Copy Selected</button>
        <button id="pasteSelected">Paste Selected</button>
      </div>
      <script nonce="${nonce}">
        const vscode = acquireVsCodeApi();
        const q = document.getElementById('q');
        const results = document.getElementById('results');
        const copyBtn = document.getElementById('copySelected');
        const pasteBtn = document.getElementById('pasteSelected');
        let lastResults = [];

        function render(items) {
          lastResults = items;
          results.innerHTML = '';
          if (!items || items.length === 0) {
            results.innerHTML = '<div class="empty">No results</div>';
            return;
          }
          items.forEach((it, idx) => {
            const el = document.createElement('div');
            el.className = 'result';
            el.innerHTML = '<input type="checkbox" data-idx="' + idx + '" /> '
              + '<span class="' + (it.pinned ? 'pinned' : '') + '">' + it.id + '.</span> '
              + '<span>' + escapeHtml(it.content) + '</span>';
            el.addEventListener('dblclick', () => {
              // double click -> paste
              vscode.postMessage({ command: 'paste', text: it.content });
            });
            results.appendChild(el);
          });
        }

        function escapeHtml(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

        let debounce = null;
        q.addEventListener('input', () => {
          clearTimeout(debounce);
          debounce = setTimeout(() => {
            vscode.postMessage({ command: 'search', query: q.value });
          }, 250);
        });

        window.addEventListener('message', event => {
          const msg = event.data;
          if (msg.command === 'results') render(msg.results || []);
        });

        copyBtn.addEventListener('click', () => {
          const checks = Array.from(results.querySelectorAll('input[type=checkbox]:checked'));
          const items = checks.map(c => lastResults[parseInt(c.dataset.idx)].content);
          if (!items.length) return;
          vscode.postMessage({ command: 'copyMultiple', items });
        });

        pasteBtn.addEventListener('click', () => {
          const checks = Array.from(results.querySelectorAll('input[type=checkbox]:checked'));
          const items = checks.map(c => lastResults[parseInt(c.dataset.idx)].content);
          if (!items.length) return;
          // for paste, just paste the first selected
          vscode.postMessage({ command: 'paste', text: items[0] });
        });

        // initial empty search to populate recent items
        vscode.postMessage({ command: 'search', query: '' });
      </script>
    </body>
    </html>`;
  }
}

module.exports = ClipboardSearchWebviewProvider;
