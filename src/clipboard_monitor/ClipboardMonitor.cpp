#include "ClipboardMonitor.h"
#include <windows.h>
#include <thread>
#include <chrono>
#include <iostream>

ClipboardMonitor::ClipboardMonitor(HistoryManager& hist) : history(hist), lastClipboard("") {}

std::string ClipboardMonitor::getClipboardText() {
    if (!OpenClipboard(nullptr)) return "";
    HANDLE hData = GetClipboardData(CF_TEXT);
    if (!hData) { CloseClipboard(); return ""; }

    char* pszText = static_cast<char*>(GlobalLock(hData));
    std::string text(pszText ? pszText : "");
    if (pszText) GlobalUnlock(hData);
    CloseClipboard();
    return text;
}

void ClipboardMonitor::startMonitoring() {
    while (true) {
        std::string text = getClipboardText();
        if (!text.empty() && text != lastClipboard) {
            lastClipboard = text;
            ClipboardItem item{0, ItemType::Text, false, text};
            history.addItem(item);
            std::cout << "\n[Clipboard updated]: " << text << "\n";
        }
        std::this_thread::sleep_for(std::chrono::seconds(1));
    }
}
