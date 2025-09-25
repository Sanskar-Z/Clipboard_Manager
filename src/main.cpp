#include "history_manager/HistoryManager.h"
#include "cli/CLI.h"
#include "clipboard_monitor/ClipboardMonitor.h"
#include <thread>

int main() {
    HistoryManager history;
    CLI cli(history);
    ClipboardMonitor monitor(history);

    std::thread monitorThread([&monitor]() { monitor.startMonitoring(); });

    cli.runMenu();

    monitorThread.join();
    return 0;
}
