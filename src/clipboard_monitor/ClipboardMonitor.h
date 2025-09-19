#pragma once
#include "../../include/Item.h"
#include "../history_manager/HistoryManager.h"
#include <string>
using namespace std;

class ClipboardMonitor {
public:
    ClipboardMonitor(HistoryManager* hm);
    void startMonitoring();

private:
    HistoryManager* historyManager_;
    string lastText_;
};
