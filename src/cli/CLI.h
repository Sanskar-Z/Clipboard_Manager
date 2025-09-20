#ifndef CLI_H
#define CLI_H

#include "../history_manager/HistoryManager.h"
#include "../advanced_features/AdvancedFeatures.h"

class CLI {
private:
    HistoryManager* history;
    AdvancedFeatures* adv;

public:
    CLI(HistoryManager* history, AdvancedFeatures* adv);
    void start();
};

#endif
