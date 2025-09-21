#pragma once
#include "../history_manager/HistoryManager.h"

class CLI {
private:
    HistoryManager* history;
public:
    CLI(HistoryManager* h);
    void showMenu();
};
