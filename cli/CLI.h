#pragma once
#include "../history_manager/HistoryManager.h"
#include "../advanced_features/AdvancedFeatures.h"
#include <string>

class CLI {
public:
    CLI(HistoryManager* hm, AdvancedFeatures* af);
    void start();

private:
    HistoryManager* historyManager_;
    AdvancedFeatures* advFeatures_;
};
