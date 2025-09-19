
#include "clipboard_monitor/ClipboardMonitor.h"
#include "history_manager/HistoryManager.h"
#include "advanced_features/AdvancedFeatures.h"
#include "./cli/CLI.h"
#include <thread>
using namespace std;

int main() {
    HistoryManager history;
    ClipboardMonitor monitor(&history);
    AdvancedFeatures adv(&history);
    CLI cli(&history, &adv);

    thread monitorThread([&]() { monitor.startMonitoring(); });

    // Run CLI in main thread
    cli.start();

    monitorThread.detach();
    return 0;
}
