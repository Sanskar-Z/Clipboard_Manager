#pragma once
#include "../history_manager/HistoryManager.h"
#include <string>

class ClipboardMonitor {
public:
    ClipboardMonitor(HistoryManager& hist);
    void startMonitoring();

private:
    HistoryManager& history;
    std::string lastClipboard;
    std::string getClipboardText();
};
