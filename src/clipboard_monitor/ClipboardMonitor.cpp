#include "ClipboardMonitor.h"
#include <windows.h>
#include <iostream>
using namespace std;

ClipboardMonitor::ClipboardMonitor(HistoryManager* hm) : historyManager_(hm) {}

void ClipboardMonitor::startMonitoring() {
    cout << "Clipboard monitoring started...\n";

    while (true) {
        if (OpenClipboard(NULL)) {
            if (IsClipboardFormatAvailable(CF_UNICODETEXT)) {
                HANDLE hData = GetClipboardData(CF_UNICODETEXT);
                if (hData) {
                    wchar_t* pszText = static_cast<wchar_t*>(GlobalLock(hData));
                    if (pszText) {
                        wstring ws(pszText);
                        string text(ws.begin(), ws.end());
                        GlobalUnlock(hData);

                        if (text != lastText_) {
                            lastText_ = text;
                            static int id = 1;
                            ClipboardItem item{ id++, ItemType::Text, text, false };
                            historyManager_->addItem(item);
                            cout << "New item captured: " << text << "\n";
                        }
                    }
                }
            }
            CloseClipboard();
        }
        Sleep(1000); 
    }
}
