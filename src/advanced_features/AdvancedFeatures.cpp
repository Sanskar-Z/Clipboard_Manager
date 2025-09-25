#include "AdvancedFeatures.h"

void AdvancedFeatures::addForUndo(const ClipboardItem& item) {
    undoStack.push(item);
}

ClipboardItem AdvancedFeatures::undo() {
    if (undoStack.empty()) {
        std::cout << "Undo stack is empty!\n";
        return ClipboardItem();
    }
    ClipboardItem last = undoStack.top();
    undoStack.pop();
    std::cout << "Undo: Removed item -> " << last.content << "\n";
    return last;
}

void AdvancedFeatures::buildSearchIndex(const std::vector<ClipboardItem>& items) {
    searchMap.clear();
    for (const auto& item : items) {
        searchMap[item.content] = item;
    }
}

void AdvancedFeatures::search(const std::string& keyword) const {
    bool found = false;
    for (const auto& [content, item] : searchMap) {
        if (content.find(keyword) != std::string::npos) {
            std::cout << "Found: [" << item.id << "] " << item.content << "\n";
            found = true;
        }
    }
    if (!found) std::cout << "No match found for: " << keyword << "\n";
}
