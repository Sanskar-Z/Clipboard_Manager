#include "CLI.h"
#include <iostream>

CLI::CLI(HistoryManager* history, AdvancedFeatures* adv)
    : history(history), adv(adv) {}

void CLI::start() {
    int choice;
    do {
        std::cout << "\n==== Clipboard Manager Menu ====\n";
        std::cout << "1. Show History\n";
        std::cout << "2. Search in History\n";
        std::cout << "3. Pin/Unpin Item\n";
        std::cout << "4. Delete Item\n";
        std::cout << "5. Exit\n";
        std::cout << "Enter choice: ";
        std::cin >> choice;
        std::cin.ignore();  // clear newline

        if (choice == 1) {
            history->showHistory();
        } 
        else if (choice == 2) {
            std::string keyword;
            std::cout << "Enter keyword: ";
            std::getline(std::cin, keyword);
            adv->search(keyword);
        } 
        else if (choice == 3) {
            int index;
            history->showHistory();
            std::cout << "Enter item number to Pin/Unpin: ";
            std::cin >> index;
            std::cin.ignore();
            history->pinItem(index - 1);
            std::cout << "Item toggled pin status.\n";
        } 
        else if (choice == 4) {
            int index;
            history->showHistory();
            std::cout << "Enter item number to delete: ";
            std::cin >> index;
            std::cin.ignore();
            history->deleteItem(index - 1);
            std::cout << "Item deleted.\n";
        }

    } while (choice != 5);
}
