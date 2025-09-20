#include "AdvancedFeatures.h"
#include <iostream>

AdvancedFeatures::AdvancedFeatures(HistoryManager* history) : history(history) {}

void AdvancedFeatures::search(const std::string& keyword) const {
    auto results = history->search(keyword);
    std::cout << "\nSearch results for \"" << keyword << "\":\n";
    for (auto& item : results) {
        std::cout << "- " << item.content;
        if (item.pinned) std::cout << " [Pinned]";
        std::cout << "\n";
    }
    if (results.empty()) std::cout << "No results found.\n";
}
