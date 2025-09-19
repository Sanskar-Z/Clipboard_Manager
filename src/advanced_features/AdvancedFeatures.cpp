#include "AdvancedFeatures.h"
#include <iostream>
#include <windows.h>

AdvancedFeatures::AdvancedFeatures(HistoryManager* hm) : historyManager_(hm) {}

void AdvancedFeatures::reCopy(int id) {
    std::cout << "Re-copying item " << id << " (not yet implemented).\n";
}
