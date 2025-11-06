# 📋 Clipboard Manager for VS Code

A powerful, lightweight **Clipboard Manager extension for Visual Studio Code** with a high-performance C++ backend.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Platform](https://img.shields.io/badge/platform-Linux%20%7C%20macOS%20%7C%20Windows-lightgrey)

---

## ✨ Features

- 📋 **Multi-Slot Clipboard** (0-9): Save and retrieve up to 10 clipboard items
- 📚 **Clipboard History**: Automatic tracking of all clipboard operations
- 📌 **Pin/Unpin Items**: Keep important items at the top
- 🔍 **Search**: Find clipboard items by keyword
- 🗑️ **Delete & Undo**: Remove items with undo support
- ⌨️ **Keyboard Shortcuts**: Quick access with `Ctrl+0-9` and `Alt+0-9`
- 🚀 **High Performance**: Native C++ backend for speed
- 💾 **Persistent Storage**: Your clipboard history survives restarts
- 🎨 **Beautiful UI**: Integrated into VS Code Activity Bar

---

## 🚀 Quick Start

### Prerequisites

**Linux:**
```bash
sudo dnf install -y gcc gcc-c++ make python3-devel  # Amazon Linux / Fedora
# OR
sudo apt-get install -y build-essential python3-dev  # Ubuntu / Debian
```

**macOS:**
```bash
xcode-select --install
```

**Windows:**
- Install [Visual Studio Build Tools](https://visualstudio.microsoft.com/downloads/)
- Install [Python 3](https://www.python.org/downloads/)

### Installation

1. **Build the native addon:**
   ```bash
   cd /vercel/sandbox
   npm install
   ```

2. **Test the installation:**
   ```bash
   npm test
   ```
   
   You should see:
   ```
   ✨ All tests passed successfully!
   ```

3. **Install VS Code extension:**
   ```bash
   cd clipboard-multi
   npm install
   ```

4. **Launch in VS Code:**
   ```bash
   code .
   ```
   Press `F5` to start the Extension Development Host

---

## 📖 Usage

### Activity Bar

Click the **Clipboard icon** in the Activity Bar to view:
- **📜 Slots**: Your saved clipboard slots (0-9)
- **📌 Pinned**: Pinned items that stay at the top
- **⌛ History**: Recent clipboard items

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+0` to `Ctrl+9` | Save selected text to slot 0-9 |
| `Alt+0` to `Alt+9` | Paste from slot 0-9 |
| `Ctrl+Shift+C` | Copy and save to history |

### Commands

Open Command Palette (`Ctrl+Shift+P`) and search for:
- `Clipboard Manager: Show History`
- `Clipboard Manager: Search`
- `Clipboard Manager: Refresh`

### Context Menu

Right-click on any clipboard item to:
- 📌 Pin / 📍 Unpin
- 🗑️ Delete
- 📋 Copy

---

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│   VS Code Extension (JavaScript)    │
│  - extension.js                     │
│  - clipboardDataProvider.js         │
│  - historyBackend.js                │
└──────────────┬──────────────────────┘
               │
               │ N-API Bindings
               │
┌──────────────▼──────────────────────┐
│   Native Addon (C++)                │
│  - clipboard_addon.cpp              │
└──────────────┬──────────────────────┘
               │
               │
┌──────────────▼──────────────────────┐
│   HistoryManager (C++)              │
│  - File-based storage               │
│  - History management               │
│  - Slot management                  │
│  - Search functionality             │
└─────────────────────────────────────┘
```

---

## 🔧 Development

### Build Commands

```bash
# Install dependencies and build
npm install

# Rebuild native addon
npm run rebuild

# Clean build artifacts
npm run clean

# Run tests
npm test
```

### Project Structure

```
/vercel/sandbox/
├── src/                    # C++ source code
│   ├── node_addon/         # N-API bindings
│   ├── history_manager/    # Core logic
│   └── ...
├── clipboard-multi/        # VS Code extension
│   ├── extension.js        # Extension entry
│   ├── historyBackend.js   # Backend interface
│   └── package.json        # Extension manifest
├── test/                   # Test files
├── binding.gyp             # Build configuration
└── package.json            # Root package
```

---

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Test Output
```
🧪 Testing Clipboard Manager Native Addon...
✅ Native addon loaded successfully
✅ Manager initialized
✅ Added 3 items to history
✅ Retrieved 3 items
✅ Saved to slots 0 and 5
✅ Item 0 pinned: true
✅ Found 3 items matching "clipboard"
✅ Deleted item. Count: 3 → 2
✨ All tests passed successfully!
```

---

## 📦 Building for Distribution

### Package the Extension

```bash
cd clipboard-multi
npm install -g @vscode/vsce
vsce package
```

This creates `clipboard-multi-1.0.0.vsix`

### Install the Package

```bash
code --install-extension clipboard-multi-1.0.0.vsix
```

---

## 🐛 Troubleshooting

### Build Fails

**Problem:** `make: not found`
```bash
# Install build tools
sudo dnf install -y make gcc gcc-c++  # Linux
xcode-select --install                 # macOS
```

**Problem:** `Python not found`
```bash
sudo dnf install -y python3-devel  # Linux
# Install from python.org on macOS/Windows
```

### Extension Not Loading

1. Check Output Panel: View → Output → "Clipboard Manager"
2. Rebuild: `cd /vercel/sandbox && npm run rebuild`
3. Reload Window: `Ctrl+Shift+P` → "Developer: Reload Window"

### Data Not Persisting

- Check file permissions in workspace `.clipboard_data/` directory
- Ensure workspace folder is writable
- Check console for error messages

---

## 📊 Performance

- **Native C++ Backend**: Minimal overhead
- **File-based Storage**: No database required
- **Efficient Search**: Fast keyword matching
- **Memory Efficient**: Only loads data when needed

---

## 🔒 Privacy & Security

- **Local Storage Only**: All data stored locally in your workspace
- **No Network Calls**: Zero external dependencies
- **No Telemetry**: Your clipboard data stays private
- **Open Source**: Full transparency

---

## 📄 Data Storage

Clipboard data is stored in your workspace:

```
<workspace>/.clipboard_data/
├── history.txt              # Clipboard history
├── slots/                   # Slot storage
│   ├── slot_0.txt
│   └── ...
└── .clipboard_last_deleted.txt  # Undo support
```

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

---

## 📚 Documentation

For detailed documentation, see:
- [Complete Project Guide](./COMPLETE_PROJECT_GUIDE.md)
- [API Reference](./COMPLETE_PROJECT_GUIDE.md#-api-reference)
- [Troubleshooting](./COMPLETE_PROJECT_GUIDE.md#-troubleshooting)

---

## 🎯 Roadmap

- [ ] Image clipboard support
- [ ] Cloud sync (optional)
- [ ] Clipboard templates
- [ ] Export/import history
- [ ] Custom keyboard shortcuts
- [ ] Clipboard statistics

---

## 📝 Changelog

### v1.0.0 (2025-11-06)
- ✅ Initial release
- ✅ Multi-slot clipboard (0-9)
- ✅ Clipboard history
- ✅ Pin/unpin functionality
- ✅ Search capability
- ✅ Delete with undo
- ✅ Keyboard shortcuts
- ✅ Activity Bar integration
- ✅ Cross-platform support

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🙏 Acknowledgments

- Built with [Node-API](https://nodejs.org/api/n-api.html)
- Uses [node-addon-api](https://github.com/nodejs/node-addon-api)
- Inspired by clipboard managers across platforms

---

## 📞 Support

- 📖 [Documentation](./COMPLETE_PROJECT_GUIDE.md)
- 🐛 [Report Issues](https://github.com/yourusername/clipboard-manager/issues)
- 💬 [Discussions](https://github.com/yourusername/clipboard-manager/discussions)

---

**Made with ❤️ for VS Code developers**

⭐ Star this project if you find it useful!
