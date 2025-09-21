#pragma once
#include "../../include/Item.h"
#include "../history_manager/HistoryManager.h"
#include <string>

class AdvancedFeatures {
private:
    HistoryManager* history;

public:
    AdvancedFeatures(HistoryManager* hm) : history(hm) {}
    void search(const std::string& keyword) const;
};
