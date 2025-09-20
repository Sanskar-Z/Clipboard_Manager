#include "HistoryManager.h"
#include <fstream>
#include <iostream>

HistoryManager::HistoryManager() {
    loadHistory();
}

void HistoryManager::addItem(const std::string& content) {
    history.push_back({content, false});
    saveHistory();
}

void HistoryManager::showHistory() {
    std::cout << "--- Clipboard History ---\n";
    for (size_t i = 0; i < history.size(); i++) {
        std::cout << i + 1 << ". " << history[i].content;
        if (history[i].pinned) std::cout << " [Pinned]";
        std::cout << "\n";
    }
}

std::vector<Item> HistoryManager::search(const std::string& query) {
    std::vector<Item> results;
    for (auto& item : history) {
        if (item.content.find(query) != std::string::npos) results.push_back(item);
    }
    return results;
}

void HistoryManager::loadHistory() {
    std::ifstream infile(filename);
    if (!infile.is_open()) return;

    json j;
    infile >> j;

    history.clear();
    for (auto& element : j) {
        history.push_back({element["content"], element["pinned"]});
    }
}

void HistoryManager::saveHistory() {
    json j = json::array();
    for (auto& item : history) {
        j.push_back({{"content", item.content}, {"pinned", item.pinned}});
    }
    std::ofstream outfile(filename);
    outfile << j.dump(4); // pretty print with 4-space indent
}

void HistoryManager::pinItem(int index) {
    if (index >= 0 && index < (int)history.size()) {
        history[index].pinned = !history[index].pinned; // toggle pin
        saveHistory();
    }
}

void HistoryManager::deleteItem(int index) {
    if (index >= 0 && index < (int)history.size()) {
        history.erase(history.begin() + index);
        saveHistory();
    }
}
