#include "HistoryManager.h"
#include <iostream>
#include <fstream>
#include <sstream>
#include <algorithm>
#include <shlobj.h> // For SHGetFolderPath
#include <shlwapi.h> // For path manipulation

const std::string APP_DATA_FOLDER = "ClipboardManager";
const std::string HISTORY_FILENAME = "history.txt";

std::string GetHistoryFilePath() {
    char path[MAX_PATH];
    
    // Get the Roaming AppData directory
    if (SHGetFolderPathA(NULL, CSIDL_APPDATA, NULL, 0, path) != S_OK) {
        // Fallback to current directory if AppData is not accessible
        return HISTORY_FILENAME;
    }

    std::string app_data_path = path;
    app_data_path += "\\";
    app_data_path += APP_DATA_FOLDER;

    // Create the directory if it doesn't exist
    CreateDirectoryA(app_data_path.c_str(), NULL);

    app_data_path += "\\";
    app_data_path += HISTORY_FILENAME;

    return app_data_path;
}

HistoryManager::HistoryManager() { loadHistory(); }

void HistoryManager::saveHistory() const {
    std::ofstream out(GetHistoryFilePath());
    if (!out.is_open()) {
        std::cerr << "Failed to open history file for writing\n";
        return;
    }

    for (const auto& item : history) {
        out << item.id << "|" << static_cast<int>(item.type) << "|"
            << item.pinned << "|" << item.content << "\n";
    }
}

void HistoryManager::loadHistory() {
    history.clear();
    historyMap.clear();
    pinnedIds.clear();
    recentQueue.clear();

    std::ifstream in(GetHistoryFilePath());
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

void HistoryManager::setSlot(int slot, const std::string& content) {
    // Remove any existing item with this slot number
    auto it = std::remove_if(history.begin(), history.end(),
        [slot](const ClipboardItem& item) { return item.id == slot; });
    history.erase(it, history.end());
    
    // Remove from maps
    historyMap.erase(slot);
    pinnedIds.erase(slot);

    // Create new item with the specified slot number as ID
    ClipboardItem item{slot, ItemType::Text, true, content};
    
    // Add to collections
    history.push_back(item);
    historyMap[slot] = item;
    pinnedIds.insert(slot);  // Slots are always pinned
    
    saveHistory();
}

ClipboardItem HistoryManager::getSlot(int slot) const {
    auto it = std::find_if(history.begin(), history.end(),
        [slot](const ClipboardItem& item) { return item.id == slot; });
    
    if (it != history.end()) {
        return *it;
    }
    
    // Return empty item if slot not found
    return ClipboardItem{slot, ItemType::Text, false, ""};
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
