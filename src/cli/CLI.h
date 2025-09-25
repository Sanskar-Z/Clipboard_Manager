#pragma once
#include "../history_manager/HistoryManager.h"

class CLI {
public:
    CLI(HistoryManager& historyManager);
    void runMenu();

private:
    HistoryManager& history;
    void addItem();
    void deleteItem();
    void pinItem();
    void unpinItem();
    void undoDelete();
    void showHistory();
    void searchItems();
};
