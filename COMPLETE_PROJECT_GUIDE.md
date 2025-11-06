# 📋 Complete Clipboard Manager Project Guide

## 🎯 Project Overview

This is a **complete, working Clipboard Manager** for Visual Studio Code that combines:
- **C++ Backend**: High-performance clipboard history management using C++17
- **Node.js Native Addon**: N-API bridge connecting C++ to JavaScript
- **VS Code Extension**: Rich UI with Activity Bar integration

---

## ✨ Features

### Core Features
- ✅ **Multi-Slot Clipboard** (0-9): Save and retrieve up to 10 clipboard items
- ✅ **Clipboard History**: Automatic tracking of all clipboard operations
- ✅ **Pin/Unpin Items**: Keep important items at the top
- ✅ **Search**: Find clipboard items by keyword
- ✅ **Delete & Undo**: Remove items with undo support
- ✅ **Keyboard Shortcuts**: 
  - `Ctrl+0-9`: Save to slot
  - `Alt+0-9`: Paste from slot
  - `Ctrl+Shift+C`: Copy and save to history

### Technical Features
- ✅ **Cross-Platform**: Works on Linux, macOS, and Windows
- ✅ **Persistent Storage**: File-based storage for history and slots
- ✅ **Multi-line Support**: Handles text with newlines correctly
- ✅ **Error Handling**: Comprehensive error handling and user feedback
- ✅ **Zero Dependencies**: Native C++ for maximum performance

---

## 📁 Project Structure

```
/vercel/sandbox/
├── binding.gyp                      # Node-gyp build configuration
├── package.json                     # Root package for native addon
├── CMakeLists.txt                   # CMake build (optional)
├── README.md                        # Project documentation
│
├── src/                             # C++ Source Code
│   ├── node_addon/
│   │   └── clipboard_addon.cpp      # N-API bindings
│   ├── history_manager/
│   │   ├── HistoryManager.h         # History manager interface
│   │   └── HistoryManager.cpp       # History manager implementation
│   ├── cli/                         # CLI interface (standalone)
│   │   ├── CLI.h
│   │   └── CLI.cpp
│   ├── clipboard_monitor/           # Clipboard monitoring (Windows)
│   │   ├── ClipboardMonitor.h
│   │   └── ClipboardMonitor.cpp
│   ├── advanced_features/           # Advanced features
│   │   ├── AdvancedFeatures.h
│   │   └── AdvancedFeatures.cpp
│   └── main.cpp                     # Standalone CLI entry point
│
├── include/                         # C++ Headers
│   ├── Item.h                       # ClipboardItem structure
│   └── nlohmann/                    # JSON library (if needed)
│
├── clipboard-multi/                 # VS Code Extension
│   ├── extension.js                 # Extension entry point
│   ├── historyBackend.js            # Backend interface
│   ├── clipboardDataProvider.js     # Tree view provider
│   ├── package.json                 # Extension manifest
│   └── images/                      # Extension icons
│
├── build/                           # Build output (generated)
│   └── Release/
│       └── clipboard_addon.node     # Compiled native addon
│
├── test/                            # Test files
│   └── test.js                      # Native addon tests
│
└── data/                            # Runtime data (generated)
    ├── history.txt                  # Clipboard history
    ├── slots/                       # Slot storage
    │   ├── slot_0.txt
    │   └── ...
    └── .clipboard_last_deleted.txt  # Undo support
```

---

## 🚀 Quick Start

### Prerequisites

**Linux (Amazon Linux 2023 / Ubuntu / Debian):**
```bash
sudo dnf install -y gcc gcc-c++ make python3-devel  # Amazon Linux
# OR
sudo apt-get install -y build-essential python3-dev  # Ubuntu/Debian
```

**macOS:**
```bash
xcode-select --install
```

**Windows:**
- Install [Visual Studio Build Tools](https://visualstudio.microsoft.com/downloads/)
- Install [Python 3](https://www.python.org/downloads/)

### Installation & Build

1. **Clone or navigate to the project:**
   ```bash
   cd /vercel/sandbox
   ```

2. **Install dependencies and build native addon:**
   ```bash
   npm install
   ```
   This will automatically:
   - Install `node-addon-api` and `bindings`
   - Run `node-gyp rebuild` to compile the C++ addon
   - Create `build/Release/clipboard_addon.node`

3. **Test the native addon:**
   ```bash
   npm test
   ```
   You should see all tests passing ✅

4. **Install VS Code extension dependencies:**
   ```bash
   cd clipboard-multi
   npm install
   ```

---

## 🧪 Testing

### Test Native Addon
```bash
cd /vercel/sandbox
npm test
```

**Expected Output:**
```
🧪 Testing Clipboard Manager Native Addon...
✅ Native addon loaded successfully
✅ Manager initialized
✅ Added 3 items to history
✅ Retrieved 3 items
✅ Saved to slots 0 and 5
✅ Slot 0: "Slot 0 content"
✅ Item 0 pinned: true
✅ Found 3 items matching "clipboard"
✅ All tests passed successfully!
```

### Test VS Code Extension

1. **Open the extension in VS Code:**
   ```bash
   code /vercel/sandbox/clipboard-multi
   ```

2. **Press `F5`** to launch Extension Development Host

3. **Test features:**
   - Open Command Palette (`Ctrl+Shift+P`)
   - Search for "Clipboard Manager"
   - Try copying text with `Ctrl+Shift+C`
   - View clipboard history in Activity Bar
   - Test pin/unpin/delete operations

---

## 🔧 Development

### Rebuild Native Addon
```bash
cd /vercel/sandbox
npm run rebuild
```

### Clean Build
```bash
cd /vercel/sandbox
npm run clean
npm install
```

### Debug Native Addon
Add debug output in C++ code:
```cpp
#include <iostream>
std::cout << "Debug: " << variable << std::endl;
```

Rebuild and test:
```bash
npm run rebuild && npm test
```

---

## 📚 API Reference

### C++ HistoryManager API

```cpp
class HistoryManager {
public:
    HistoryManager(const std::string &data_dir);
    
    // History operations
    std::vector<HistoryItem> readHistory();
    bool addItem(const std::string &text);
    bool deleteItem(size_t index);
    bool pinItem(size_t index);
    bool unpinItem(size_t index);
    bool undoDelete();
    
    // Slot operations (0-9)
    bool setSlot(int slot, const std::string &text);
    std::optional<std::string> getSlot(int slot);
    
    // Search
    std::vector<HistoryItem> search(const std::string &keyword);
};
```

### JavaScript Native Addon API

```javascript
const clipboardAddon = require('bindings')('clipboard_addon');

// Initialize
clipboardAddon.init('/path/to/data/directory');

// History operations
clipboardAddon.addToHistory('text');
const history = clipboardAddon.getHistory(); // Returns array of {timestamp, content, pinned}
clipboardAddon.pinItem(index);
clipboardAddon.unpinItem(index);
clipboardAddon.deleteItem(index);

// Slot operations
clipboardAddon.saveToSlot(slot, 'text');
const text = clipboardAddon.getFromSlot(slot); // Returns string or null

// Search
const results = clipboardAddon.searchHistory('keyword');
```

---

## 🎨 VS Code Extension Usage

### Activity Bar View
1. Click the **Clipboard icon** in the Activity Bar
2. View three sections:
   - **📜 Slots**: Saved clipboard slots (0-9)
   - **📌 Pinned**: Pinned items
   - **⌛ History**: Recent clipboard items

### Commands
- **🔄 Refresh**: Reload clipboard history
- **🔍 Search**: Search clipboard items
- **📋 Copy to Slot**: Save selected text to a slot
- **📥 Paste from Slot**: Paste from a slot
- **💾 Copy and Save**: Add to history
- **📌 Pin Item**: Pin an item
- **📍 Unpin Item**: Unpin an item
- **🗑️ Delete Item**: Remove an item

### Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `Ctrl+0` to `Ctrl+9` | Save to slot 0-9 |
| `Alt+0` to `Alt+9` | Paste from slot 0-9 |
| `Ctrl+Shift+C` | Copy and save to history |

---

## 🐛 Troubleshooting

### Build Errors

**Error: `make: not found`**
```bash
# Linux
sudo dnf install -y make gcc gcc-c++
# macOS
xcode-select --install
```

**Error: `Python not found`**
```bash
# Linux
sudo dnf install -y python3-devel
# macOS/Windows
# Install Python 3 from python.org
```

**Error: `node-gyp rebuild failed`**
```bash
# Clean and rebuild
npm run clean
rm -rf node_modules
npm install
```

### Runtime Errors

**Error: `Native addon not loaded`**
- Ensure you ran `npm install` in the root directory
- Check that `build/Release/clipboard_addon.node` exists
- Try rebuilding: `npm run rebuild`

**Error: `Failed to initialize`**
- Check file permissions in data directory
- Ensure data directory is writable
- Check console output for detailed error messages

### Extension Not Working

1. **Check Output Panel:**
   - View → Output → Select "Clipboard Manager"
   - Look for error messages

2. **Rebuild Native Addon:**
   ```bash
   cd /vercel/sandbox
   npm run rebuild
   ```

3. **Reload Extension:**
   - Press `Ctrl+Shift+P`
   - Run "Developer: Reload Window"

---

## 📦 Distribution

### Package Extension
```bash
cd clipboard-multi
npm install -g @vscode/vsce
vsce package
```

This creates `clipboard-multi-1.0.0.vsix`

### Install Packaged Extension
```bash
code --install-extension clipboard-multi-1.0.0.vsix
```

---

## 🔒 Data Storage

### File Locations

**History File:**
```
<workspace>/.clipboard_data/history.txt
```

**Slot Files:**
```
<workspace>/.clipboard_data/slots/slot_0.txt
<workspace>/.clipboard_data/slots/slot_1.txt
...
<workspace>/.clipboard_data/slots/slot_9.txt
```

**Undo File:**
```
<workspace>/.clipboard_data/.clipboard_last_deleted.txt
```

### File Format

**History Entry:**
```
=== ENTRY START ===
TIMESTAMP: 2025-11-06 18:40:48
PINNED: 0
CONTENT_LENGTH: 25
CONTENT:
This is clipboard content
END_CONTENT
=== ENTRY END ===
```

**Slot Entry:**
```
=== SLOT START ===
CONTENT_LENGTH: 15
CONTENT:
Slot 0 content
END_CONTENT
=== SLOT END ===
```

---

## 🤝 Contributing

### Code Style
- **C++**: Follow C++17 standards, use `std::filesystem`
- **JavaScript**: Use CommonJS, follow VS Code extension guidelines
- **Comments**: Document complex logic, not obvious code

### Adding Features

1. **Add C++ Implementation:**
   - Update `HistoryManager.h` and `HistoryManager.cpp`
   - Add tests in `test/test.js`

2. **Add N-API Binding:**
   - Update `src/node_addon/clipboard_addon.cpp`
   - Export new function in `Init()`

3. **Add JavaScript Interface:**
   - Update `clipboard-multi/historyBackend.js`
   - Add error handling

4. **Update Extension:**
   - Add commands in `clipboard-multi/extension.js`
   - Update `package.json` contributions

5. **Test:**
   ```bash
   npm run rebuild
   npm test
   ```

---

## 📄 License

This project is provided as-is for educational and commercial use.

---

## 🎉 Success Checklist

- ✅ C++ backend compiles without errors
- ✅ Native addon builds successfully
- ✅ All tests pass (`npm test`)
- ✅ VS Code extension loads without errors
- ✅ Can add items to history
- ✅ Can save/retrieve from slots
- ✅ Can pin/unpin items
- ✅ Can search history
- ✅ Can delete items
- ✅ Keyboard shortcuts work
- ✅ Data persists across sessions

---

## 📞 Support

For issues or questions:
1. Check the **Troubleshooting** section
2. Review **VS Code Output Panel** for errors
3. Run `npm test` to verify native addon
4. Check file permissions in data directory

---

**🎊 Congratulations! You now have a fully working Clipboard Manager for VS Code!**
