#include <iostream>
#include <string>
#include <vector>
#include <windows.h>
#include "cli/CLI.h"
#include "clipboard_monitor/ClipboardMonitor.h"
#include "history_manager/HistoryManager.h"
#include "advanced_features/AdvancedFeatures.h"

int main(int argc, char* argv[]) {
    std::string dataDir = "data";  // Folder for storing history and slots
    HistoryManager history(dataDir);
    CLI cli(dataDir);

    if (argc > 1) {
        std::string cmd = argv[1];
        std::vector<std::string> args(argv + 1, argv + argc);

        // ---------- HISTORY COMMAND ----------
        if (cmd == "history") {
            auto items = history.readHistory();
            for (size_t i = 0; i < items.size(); ++i) {
                std::cout << i << ": [" << items[i].timestamp << "] "
                          << (items[i].pinned ? "[PINNED] " : "")
                          << items[i].content << "\n";
            }
            return 0;
        }

        // ---------- SEARCH COMMAND ----------
        else if (cmd == "search" && args.size() >= 2) {
            std::string query = args[1];
            auto results = history.search(query);
            for (const auto& it : results)
                std::cout << "[" << it.timestamp << "] " << it.content << "\n";
            return 0;
        }

        // ---------- PIN COMMAND ----------
        else if (cmd == "pin" && args.size() >= 2) {
            int index = std::stoi(args[1]);
            history.pinItem(index);
            return 0;
        }

        // ---------- UNPIN COMMAND ----------
        else if (cmd == "unpin" && args.size() >= 2) {
            int index = std::stoi(args[1]);
            history.unpinItem(index);
            return 0;
        }

        // ---------- DELETE COMMAND ----------
        else if (cmd == "delete" && args.size() >= 2) {
            int index = std::stoi(args[1]);
            history.deleteItem(index);
            return 0;
        }

        // ---------- UNDO COMMAND ----------
        else if (cmd == "undo") {
            history.undoDelete();
            return 0;
        }

        // ---------- COPY COMMAND ----------
        else if (cmd == "copy" && args.size() >= 3) {
            if (!IsClipboardFormatAvailable(CF_UNICODETEXT))
                return 4;
            if (!OpenClipboard(nullptr))
                return 5;

            std::string value;
            HGLOBAL hData = GetClipboardData(CF_UNICODETEXT);
            if (hData) {
                LPCWSTR pszText = static_cast<LPCWSTR>(GlobalLock(hData));
                if (pszText) {
                    int size_needed = WideCharToMultiByte(CP_UTF8, 0, pszText, -1, NULL, 0, NULL, NULL);
                    std::string buffer(size_needed, '\0');
                    WideCharToMultiByte(CP_UTF8, 0, pszText, -1, &buffer[0], size_needed, NULL, NULL);
                    if (!buffer.empty() && buffer.back() == '\0')
                        buffer.pop_back();
                    value = buffer;
                    GlobalUnlock(hData);
                }
            }
            CloseClipboard();

            int slot = std::stoi(args[2]);
            history.setSlot(slot, value);
            history.addItem(value);
            return 0;
        }
    }

    // --- Interactive mode ---
    ClipboardMonitor monitor;
    monitor.start([&](const std::string &text) {
        history.addItem(text);
    });

    cli.runMenu();
    monitor.stop();

    return 0;
}
