#include "CLI.h"
#include <iostream>
#include <string>

CLI::CLI(HistoryManager& historyManager) : history(historyManager) {}

void CLI::runMenu() {
    int choice;
    do {
        std::cout << "\n=== Clipboard Manager Menu ===\n";
        std::cout << "1. Add item\n";
        std::cout << "2. Delete item\n";
        std::cout << "3. Pin item\n";
        std::cout << "4. Unpin item\n";
        std::cout << "5. Undo last delete\n";
        std::cout << "6. Show history\n";
        std::cout << "7. Search\n";
        std::cout << "0. Exit\n";
        std::cout << "Enter your choice: ";
        std::cin >> choice;
        std::cin.ignore(); // discard newline

        switch (choice) {
            case 1: addItem(); break;
            case 2: deleteItem(); break;
            case 3: pinItem(); break;
            case 4: unpinItem(); break;
            case 5: undoDelete(); break;
            case 6: showHistory(); break;
            case 7: searchItems(); break;
            case 0: std::cout << "Exiting...\n"; break;
            default: std::cout << "Invalid choice!\n";
        }
    } while (choice != 0);
}

void CLI::addItem() {
    std::string content;
    std::cout << "Enter text to add: ";
    std::getline(std::cin, content);
    history.addItem(ClipboardItem{0, ItemType::Text, false, content});
}

void CLI::deleteItem() {
    int id;
    std::cout << "Enter ID to delete: ";
    std::cin >> id;
    std::cin.ignore();
    history.deleteItem(id);
}

void CLI::pinItem() {
    int id;
    std::cout << "Enter ID to pin: ";
    std::cin >> id;
    std::cin.ignore();
    history.pinItem(id);
}

void CLI::unpinItem() {
    int id;
    std::cout << "Enter ID to unpin: ";
    std::cin >> id;
    std::cin.ignore();
    history.unpinItem(id);
}

void CLI::undoDelete() {
    history.undoDelete();
}

void CLI::showHistory() {
    history.showHistory();
}

void CLI::searchItems() {
    std::string query;
    std::cout << "Enter search keyword: ";
    std::getline(std::cin, query);
    auto results = history.search(query);
    if (results.empty()) {
        std::cout << "No matches found.\n";
    } else {
        std::cout << "Search results:\n";
        for (const auto& item : results)
            std::cout << item.id << ". " << item.content << (item.pinned ? " [Pinned]" : "") << "\n";
    }
}
