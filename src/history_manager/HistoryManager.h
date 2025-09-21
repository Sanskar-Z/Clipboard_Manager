#pragma once
#include "../../include/Item.h"
#include <vector>

class HistoryManager {
private:
    std::vector<ClipboardItem> history;

    // private helper functions for persistence
    void saveHistory() const;
    void loadHistory();

public:
    // Constructor (loads history from file at startup)
    HistoryManager();

    void addItem(const ClipboardItem& item);
    void showHistory() const;
    int getNextId() const;
    const std::vector<ClipboardItem>& getItems() const;
    void pinItem(int id);
    void unpinItem(int id);
    void deleteItem(int id);
};
