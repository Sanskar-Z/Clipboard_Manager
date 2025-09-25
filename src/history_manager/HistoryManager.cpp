#include "HistoryManager.h"
#include <iostream>
#include <fstream>
#include <sstream>
#include <algorithm>

const std::string HISTORY_FILE = "history.txt";

HistoryManager::HistoryManager() { loadHistory(); }

void HistoryManager::saveHistory() const {
    std::ofstream out(HISTORY_FILE);
    for (const auto& item : history)
        out << item.id << "|" << static_cast<int>(item.type) << "|"
            << item.pinned << "|" << item.content << "\n";
}

void HistoryManager::loadHistory() {
    history.clear();
    historyMap.clear();
    pinnedIds.clear();
    recentQueue.clear();

    std::ifstream in(HISTORY_FILE);
    if (!in.is_open()) return;

    std::string line;
    while (std::getline(in, line)) {
        if (line.empty()) continue;

        std::istringstream ss(line);
        std::string idStr, typeStr, pinnedStr, content;

        if (!std::getline(ss, idStr, '|') ||
            !std::getline(ss, typeStr, '|') ||
            !std::getline(ss, pinnedStr, '|') ||
            !std::getline(ss, content)) 
        {
            std::cerr << "Skipping malformed line: " << line << "\n";
            continue;
        }

        try {
            ClipboardItem item;
            item.id = std::stoi(idStr);  
            item.type = static_cast<ItemType>(std::stoi(typeStr));
            item.pinned = (pinnedStr == "1" || pinnedStr == "true");
            item.content = content;

            history.push_back(item);
            historyMap[item.id] = item;
            if (item.pinned) pinnedIds.insert(item.id);
            recentQueue.push_back(item);
        } catch (const std::exception& e) {
            std::cerr << "Skipping invalid line (stoi failed): " << line << "\n";
            continue;
        }
    }
}


int HistoryManager::getNextId() const { return history.empty() ? 1 : history.back().id + 1; }

void HistoryManager::addItem(const ClipboardItem& item) {
    ClipboardItem newItem = item;

    int nextId = 1;
    if (!history.empty()) {

        nextId = std::max_element(
            history.begin(), history.end(),
            [](const ClipboardItem& a, const ClipboardItem& b) { return a.id < b.id; }
        )->id + 1;
    }
    newItem.id = nextId;

    history.push_back(newItem);
    historyMap[newItem.id] = newItem;
    recentQueue.push_back(newItem);

    if (recentQueue.size() > 20) 
        recentQueue.pop_front();

    saveHistory();
}


void HistoryManager::deleteItem(int id) {
    auto it = std::find_if(history.begin(), history.end(), [id](const ClipboardItem& item){ return item.id == id; });
    if (it != history.end()) {
        undoStack.push(*it);
        history.erase(it);
        historyMap.erase(id);
        pinnedIds.erase(id);
    }
    saveHistory();
}

void HistoryManager::undoDelete() {
    if (!undoStack.empty()) {
        ClipboardItem item = undoStack.top();
        undoStack.pop();
        history.push_back(item);
        historyMap[item.id] = item;
        if (item.pinned) pinnedIds.insert(item.id);
        recentQueue.push_back(item);
        saveHistory();
    }
}

void HistoryManager::pinItem(int id) {
    if (historyMap.count(id)) {
        historyMap[id].pinned = true;
        pinnedIds.insert(id);
        saveHistory();
    }
}

void HistoryManager::unpinItem(int id) {
    if (historyMap.count(id)) {
        historyMap[id].pinned = false;
        pinnedIds.erase(id);
        saveHistory();
    }
}

void HistoryManager::showHistory() const {
    std::cout << "\n--- Clipboard History ---\n";
    for (const auto& item : history) {
        std::cout << item.id << ". " << item.content;
        if (item.pinned) std::cout << " [Pinned]";
        std::cout << "\n";
    }
    std::cout << "-------------------------\n";
}

const std::vector<ClipboardItem>& HistoryManager::getAllItems() const { return history; }

std::vector<ClipboardItem> HistoryManager::search(const std::string& query) const {
    std::vector<ClipboardItem> results;
    for (const auto& item : history) {
        if (item.content.find(query) != std::string::npos) results.push_back(item);
    }
    return results;
}
