#include "HistoryManager.h"
#include <iostream>
using namespace std;

void HistoryManager::addItem(const ClipboardItem& item) {
    history_.push_back(item);
}

void HistoryManager::showHistory() const {
    std::cout << "\nClipboard History:\n";
    for (const auto& item : history_) {
        cout << item.id << (item.pinned ? " [PINNED]" : "") 
                  << ": " << item.text << endl;
    }
}

void HistoryManager::deleteItem(int id) {
    for (auto it = history_.begin(); it != history_.end(); ++it) {
        if (it->id == id) {
            history_.erase(it);
            cout << "Item " << id << " deleted.\n";
            return;
        }
    }
    cout << "Item not found.\n";
}

void HistoryManager::pinItem(int id) {
    for (auto& item : history_) {
        if (item.id == id) {
            item.pinned = !item.pinned;
            cout << "Item " << id 
                      << (item.pinned ? " pinned.\n" : " unpinned.\n");
            return;
        }
    }
    std::cout << "Item not found.\n";
}
