#pragma once
#include "../history_manager/HistoryManager.h"

class AdvancedFeatures {
public:
    AdvancedFeatures(HistoryManager* hm);
    void reCopy(int id);

private:
    HistoryManager* historyManager_;
};
