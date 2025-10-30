#pragma once
#include "../../include/Item.h"
#include <vector>
#include <map>
#include <unordered_set>
#include <deque>
#include <stack>
#include <string>

class HistoryManager {
public:
    HistoryManager();
    void addItem(const ClipboardItem& item);
    void deleteItem(int id);
    void setSlot(int slot, const std::string& content);  
    ClipboardItem getSlot(int slot) const; 
    void undoDelete();
    void pinItem(int id);
    void unpinItem(int id);
    void showHistory() const;
    std::vector<ClipboardItem> search(const std::string& query) const;
    const std::vector<ClipboardItem>& getAllItems() const;

private:
    std::vector<ClipboardItem> history;
    std::map<int, ClipboardItem> historyMap;
    std::unordered_set<int> pinnedIds;
    std::deque<ClipboardItem> recentQueue;
    std::stack<ClipboardItem> undoStack;

    void saveHistory() const;
    void loadHistory();
    int getNextId() const;
};
