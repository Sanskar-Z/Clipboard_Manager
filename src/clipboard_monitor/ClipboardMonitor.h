#ifndef CLIPBOARD_MONITOR_H
#define CLIPBOARD_MONITOR_H

#include "../history_manager/HistoryManager.h"
#include <string>
#include <atomic>

class ClipboardMonitor {
private:
    HistoryManager* history;
    std::string lastContent;
    std::atomic<bool> running;

public:
    ClipboardMonitor(HistoryManager* history);
    void startMonitoring();
    void stopMonitoring();
};

#endif
