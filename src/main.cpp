#include "clipboard_monitor/ClipboardMonitor.h"
#include "history_manager/HistoryManager.h"
#include "advanced_features/AdvancedFeatures.h"
#include "cli/CLI.h"

int main() {
    HistoryManager history;
    ClipboardMonitor monitor(&history);
    AdvancedFeatures adv(&history);
    CLI cli(&history, &adv);

    // For terminal-only version, run monitor in same thread
    monitor.startMonitoring();

    // Then allow user to interact
    cli.start();

    return 0;
}
