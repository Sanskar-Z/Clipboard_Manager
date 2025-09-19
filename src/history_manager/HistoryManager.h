#pragma once
#include "../../include/Item.h"
#include <vector>
using namespace std;

class HistoryManager {
public:
    void addItem(const ClipboardItem& item);
    void showHistory() const;
    void deleteItem(int id);
    void pinItem(int id);

private:
    vector<ClipboardItem> history_;
};
