#pragma once
#include "../history_manager/HistoryManager.h"
#include <string>

class ClipboardMonitor {
private:
    HistoryManager* history;
    std::string lastText;

public:
    ClipboardMonitor(HistoryManager* h);
    void startMonitoring();
    std::string getClipboardText();
};
