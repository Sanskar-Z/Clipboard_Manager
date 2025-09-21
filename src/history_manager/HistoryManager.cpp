#include "HistoryManager.h"

#include <iostream>
#include <fstream>
#include <sstream>
#include <string>
const string HISTORY_FILE = "history.txt";

// Load history when object is created
HistoryManager::HistoryManager() {
    loadHistory();
}

// Save current history to file
void HistoryManager::saveHistory() const {
    ofstream out(HISTORY_FILE);
    if (!out) {
        cerr << "Error: Could not open history file for writing!" << endl;
        return;
    }

    for (const auto& item : history) {
        out << item.id << "|" 
            << (item.type == ItemType::Text ? "Text" : "Unknown") << "|" 
            << item.text << "|" 
            << item.pinned << "\n";
    }

    out.close();
}

// Load history from file
void HistoryManager::loadHistory() {
    history.clear();
    std::ifstream inFile(HISTORY_FILE);
    if (!inFile) return;

    std::string line;
    while (std::getline(inFile, line)) {
        if (line.empty()) continue; // skip blank lines

        std::istringstream ss(line);
        std::string idStr, typeStr, pinnedStr, text;

        if (std::getline(ss, idStr, '|') &&
            std::getline(ss, typeStr, '|') &&
            std::getline(ss, pinnedStr, '|') &&
            std::getline(ss, text)) {

            try {
                ClipboardItem item;
                item.id = std::stoi(idStr);                     // might throw
                item.type = static_cast<ItemType>(std::stoi(typeStr));
                item.pinned = (pinnedStr == "1" || pinnedStr == "true");
                item.text = text;

                history.push_back(item);
            } catch (const std::exception& e) {
                std::cerr << "Skipping invalid history line: " << line << "\n";
            }
        }
    }
}

void HistoryManager::addItem(const ClipboardItem& item) {
    ClipboardItem newItem = item;
    newItem.id = getNextId();
    history.push_back(newItem);
    saveHistory();
}

void HistoryManager::showHistory() const {
    cout << "\n--- Clipboard History ---\n";
    for (const auto& item : history) {
        cout << item.id << ". "  << item.text << (item.pinned ? " [Pinned]" : " ") << "\n";
    }
    cout << "--------------------------\n";
}

int HistoryManager::getNextId() const {
    return history.size() + 1;
}

const vector<ClipboardItem>& HistoryManager::getItems() const {
    return history;
}

void HistoryManager::pinItem(int id) {
    for (auto& item : history) {
        if (item.id == id) {
            item.pinned = true;
            break;
        }
    }
    saveHistory();
}

void HistoryManager::unpinItem(int id) {
    for (auto& item : history) {
        if (item.id == id) {
            item.pinned = false;
            break;
        }
    }
    saveHistory();
}

void HistoryManager::deleteItem(int id) {
    for (auto it = history.begin(); it != history.end(); ++it) {
        if (it->id == id) {
            history.erase(it);
            break;
        }
    }

    // Reassign IDs (serial numbers)
    for (size_t i = 0; i < history.size(); i++) {
        history[i].id = i + 1;
    }

    saveHistory();
}
