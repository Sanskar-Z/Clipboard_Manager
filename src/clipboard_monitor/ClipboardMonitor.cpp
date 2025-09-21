#include "ClipboardMonitor.h"
#define WIN32_LEAN_AND_MEAN
#include <windows.h>
#undef byte
#include <iostream>

ClipboardMonitor::ClipboardMonitor(HistoryManager* h) {
    history = h;
    lastText = "";
}

std::string ClipboardMonitor::getClipboardText() {
    if (!OpenClipboard(nullptr)) return "";

    HANDLE hData = GetClipboardData(CF_TEXT);
    if (!hData) { CloseClipboard(); return ""; }

    char* pszText = static_cast<char*>(GlobalLock(hData));
    if (!pszText) { CloseClipboard(); return ""; }

    std::string text(pszText);
    GlobalUnlock(hData);
    CloseClipboard();
    return text;
}

void ClipboardMonitor::startMonitoring() {
    while(true) {
        std::string currentText = getClipboardText();
        if(!currentText.empty() && currentText != lastText) {
            lastText = currentText;
            ClipboardItem item{ history->getNextId(), ItemType::Text, currentText };
            history->addItem(item);
            std::cout << "Copied: " << currentText << "\n";
        }
        Sleep(500); // check clipboard every 0.5 sec
    }
}
