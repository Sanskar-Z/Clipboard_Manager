#ifndef ADVANCED_FEATURES_H
#define ADVANCED_FEATURES_H

#include "../history_manager/HistoryManager.h"

class AdvancedFeatures {
private:
    HistoryManager* history;

public:
    AdvancedFeatures(HistoryManager* history);
    void search(const std::string& keyword) const;
};

#endif
