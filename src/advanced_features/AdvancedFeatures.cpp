#include "AdvancedFeatures.h"
#include <iostream>

void AdvancedFeatures::search(const std::string& keyword) const {
    std::cout << "\nSearch results for \"" << keyword << "\":\n";
    for(const auto &item : history->getItems()) {
        if(item.text.find(keyword) != std::string::npos) {
            std::cout << item.id << ": " << item.text;
            if(item.pinned) std::cout << " [Pinned]";
            std::cout << "\n";
        }
    }
}
