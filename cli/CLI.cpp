#include "CLI.h"
#include <iostream>
#include <sstream>

CLI::CLI(HistoryManager* hm, AdvancedFeatures* af)
    : historyManager_(hm), advFeatures_(af) {}

void CLI::start() {
    std::cout << "CLI started. Type commands (history, pin <id>, delete <id>, exit)\n";

    std::string line;
    while (true) {
        std::cout << "> ";
        std::getline(std::cin, line);

        if (line == "exit") break;
        else if (line == "history") historyManager_->showHistory();
        else if (line.find("pin") == 0) {
            int id; std::istringstream(line.substr(4)) >> id;
            historyManager_->pinItem(id);
        }
        else if (line.find("delete") == 0) {
            int id; std::istringstream(line.substr(7)) >> id;
            historyManager_->deleteItem(id);
        }
        else std::cout << "Unknown command.\n";
    }
}
