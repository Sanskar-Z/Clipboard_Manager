#include "history_manager/HistoryManager.h"
#include "cli/CLI.h"
#include "clipboard_monitor/ClipboardMonitor.h"
#include <thread>
#include <windows.h>
#include <string>
#include <iostream>
#include <algorithm>
#include <vector>

void printUsage() {
    std::cout << "Usage: clipboard_manager.exe [command] [slot]\n"
              << "Commands:\n"
              << "  copy <slot>   - Copy current clipboard to slot (0-9)\n"
              << "  paste <slot>  - Paste from slot (0-9) to clipboard\n"
              << "  (no args)     - Run interactive CLI mode\n";
}

// Handle command-line operations (copy/paste)
bool handleCommand(const std::string& cmd, int slot, HistoryManager& history) {
    if (slot < 0 || slot > 9) {
        std::cerr << "Error: Slot must be between 0 and 9\n";
        return false;
    }

    if (cmd == "copy") {
        // Get text from clipboard
        HWND hwnd = GetDesktopWindow();
        if (!OpenClipboard(hwnd)) {
            std::cerr << "Failed to open clipboard\n";
            return false;
        }

        // Try Unicode text first
        HANDLE hData = GetClipboardData(CF_UNICODETEXT);
        std::string text;

        if (hData != nullptr) {
            wchar_t* pwszText = static_cast<wchar_t*>(GlobalLock(hData));
            if (pwszText != nullptr) {
                // Get required buffer size
                int size_needed = WideCharToMultiByte(CP_UTF8, 0, pwszText, -1, nullptr, 0, nullptr, nullptr);
                if (size_needed > 0) {
                    // Allocate buffer and convert
                    std::vector<char> utf8str(size_needed * 2); // Extra space for safety
                    int result = WideCharToMultiByte(CP_UTF8, 0, pwszText, -1, 
                                                   utf8str.data(), utf8str.size(), 
                                                   nullptr, nullptr);
                    if (result > 0) {
                        text = std::string(utf8str.data(), strlen(utf8str.data()));
                    }
                }
                GlobalUnlock(hData);
            }
        }
        
        // If Unicode failed or was empty, try ANSI text
        if (text.empty()) {
            hData = GetClipboardData(CF_TEXT);
            if (hData != nullptr) {
                char* pszText = static_cast<char*>(GlobalLock(hData));
                if (pszText != nullptr) {
                    text = std::string(pszText, strlen(pszText));
                    GlobalUnlock(hData);
                }
            }
        }

        CloseClipboard();

        if (text.empty()) {
            std::cerr << "No text in clipboard or failed to read clipboard data\n";
            return false;
        }

        // Save text directly to the specified slot
        history.setSlot(slot, text);
        return true;
    }
    else if (cmd == "paste") {
        // Get item from the specified slot
        ClipboardItem item = history.getSlot(slot);
        if (item.content.empty()) {
            std::cerr << "No data in slot " << slot << "\n";
            return false;
        }

        // Set clipboard content
        HWND hwnd = GetDesktopWindow();
        if (!OpenClipboard(hwnd)) {
            std::cerr << "Failed to open clipboard\n";
            return false;
        }

        EmptyClipboard();

        // Convert UTF-8 to Unicode wide string
        int size_needed = MultiByteToWideChar(CP_UTF8, 0, item.content.c_str(), 
                                            item.content.length(), nullptr, 0);
        if (size_needed > 0) {
            // Allocate buffer for wide string (+1 for null terminator)
            std::vector<wchar_t> wstr(size_needed + 1);
            
            // Convert the string
            MultiByteToWideChar(CP_UTF8, 0, item.content.c_str(), 
                              item.content.length(), wstr.data(), size_needed);
            wstr[size_needed] = L'\0'; // Ensure null termination

            // Allocate and copy Unicode text
            size_t len = (size_needed + 1) * sizeof(wchar_t);
            HGLOBAL hGlob = GlobalAlloc(GMEM_MOVEABLE, len);
            if (hGlob) {
                wchar_t* pwszData = static_cast<wchar_t*>(GlobalLock(hGlob));
                if (pwszData) {
                    memcpy(pwszData, wstr.data(), len);
                    GlobalUnlock(hGlob);
                    SetClipboardData(CF_UNICODETEXT, hGlob);
                }
            }

            // Also set ANSI text for compatibility
            len = item.content.length() + 1;
            hGlob = GlobalAlloc(GMEM_MOVEABLE, len);
            if (hGlob) {
                char* pszData = static_cast<char*>(GlobalLock(hGlob));
                if (pszData) {
                    memcpy(pszData, item.content.c_str(), len);
                    GlobalUnlock(hGlob);
                    SetClipboardData(CF_TEXT, hGlob);
                }
            }
        }

        CloseClipboard();
        return true;
    }

    return false;
}

int main(int argc, char* argv[]) {
    HistoryManager history;

    // Command-line mode
    if (argc == 3) {
        std::string cmd = argv[1];
        int slot;
        try {
            slot = std::stoi(argv[2]);
        } catch (const std::exception&) {
            std::cerr << "Error: Invalid slot number\n";
            printUsage();
            return 1;
        }

        if (handleCommand(cmd, slot, history)) {
            return 0;
        }
        return 1;
    }
    // Interactive CLI mode
    else if (argc == 1) {
        CLI cli(history);
        ClipboardMonitor monitor(history);

        // Start clipboard monitoring in a background thread
        std::thread monitorThread([&monitor]() { 
            monitor.startMonitoring(); 
        });

        // Run the CLI interface in the main thread
        cli.runMenu();

        // When CLI exits, wait for monitor thread
        monitorThread.join();
        return 0;
    }
    else {
        printUsage();
        return 1;
    }
}
