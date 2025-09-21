#include "history_manager/HistoryManager.h"
#include "clipboard_monitor/ClipboardMonitor.h"
#include "cli/CLI.h"
#include <thread>

int main() {
    HistoryManager history;
    ClipboardMonitor monitor(&history);
    CLI cli(&history);

    std::thread t([&monitor](){ monitor.startMonitoring(); });
    t.detach();

    cli.showMenu();

    return 0;
}
