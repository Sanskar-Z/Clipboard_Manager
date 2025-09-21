#include "CLI.h"
#include <iostream>
using namespace std;

CLI::CLI(HistoryManager* h) {
    history = h;
}

void CLI::showMenu() {
    int choice;
    while(true) {
        cout << "\n==== Clipboard Manager Menu ====\n";
        cout << "1. Show History\n2. Pin Item\n3. Unpin Item\n4. Delete Item\n5. Exit\n";
        cout << "Enter choice: ";
        cin >> choice;

        int id;
        switch(choice) {
            case 1:
                history->showHistory();
                break;
            case 2:
                cout << "Enter ID to Pin: "; cin >> id;
                history->pinItem(id);
                break;
            case 3:
                cout << "Enter ID to Unpin: "; cin >> id;
                history->unpinItem(id);
                break;
            case 4:
                cout << "Enter ID to Delete: "; cin >> id;
                history->deleteItem(id);
                break;
            case 5:
                return;
            default:
                cout << "Invalid choice\n";
        }
    }
}
