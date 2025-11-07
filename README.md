# 📋 Clipboard Manager for VS Code

A powerful, lightweight **Clipboard Manager extension for Visual Studio Code** that helps you store, view, pin, search, and reuse multiple clipboard entries — all within your editor.

This project combines:
- A **VS Code Extension (JavaScript)** frontend for UI and commands.
- A **C++ backend executable** (`clipboard_manager.exe`) for efficient clipboard and system-level operations.

---

## ⚙️ Building the C++ Backend (CLI Interface)

You can compile the backend manually using `g++` or use **CMake** for a cleaner, cross-platform setup.

### 🧮 Manual Compilation (via `g++`)

#### Step 1 — Build the Executable
```bash
g++ -std=c++17 src/main.cpp src/cli/CLI.cpp src/history_manager/HistoryManager.cpp src/advanced_features/AdvancedFeatures.cpp src/clipboard_monitor/ClipboardMonitor.cpp -Iinclude -lole32 -luuid -luser32 -o clipboard_manager.exe
```

#### Step 2 — Run
```
.\clipboard_manager.exe
```
---

### Using the VS Code Extension

Open the folder clipboard-multi/ in Visual Studio Code.

Press F5 — this launches a new VS Code window with the extension in development mode.

Open the Command Palette (Ctrl + Shift + P) and search for:

Clipboard Manager: Show History


Interact with the UI to pin, unpin, search, delete, undo, and refresh clipboard entries.
You can also use quick-copy shortcuts (Ctrl + 0–9) and quick-paste shortcuts (Alt + 0–9).