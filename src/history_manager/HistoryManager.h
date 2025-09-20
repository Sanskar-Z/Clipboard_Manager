#ifndef HISTORY_MANAGER_H
#define HISTORY_MANAGER_H

#include <vector>
#include <string>
#include "../include/json.hpp" // JSON header
using json = nlohmann::json;

struct Item {
    std::string content;
    bool pinned = false;
};

class HistoryManager {
private:
    std::vector<Item> history;
    std::string filename = "history.json";

public:
    HistoryManager();
    void addItem(const std::string& item);
    void showHistory();
    std::vector<Item> search(const std::string& query);

    void loadHistory();
    void saveHistory();
    void pinItem(int index);
    void deleteItem(int index);
};

#endif
