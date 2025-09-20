#include "ClipboardMonitor.h"
#include <iostream>
#include <thread>
#include <chrono>

// For demo, we simulate clipboard input from user
ClipboardMonitor::ClipboardMonitor(HistoryManager* history)
    : history(history), running(false) {}

void ClipboardMonitor::startMonitoring() {
    running = true;
    while (running) {
        std::string input;
        std::cout << "Enter text to copy (or 'exit' to stop): ";
        std::getline(std::cin, input);

        if (input == "exit") {
            running = false;
            break;
        }

        if (input != lastContent) {
            lastContent = input;
            history->addItem(input);
        }
    }
}

void ClipboardMonitor::stopMonitoring() {
    running = false;
}
