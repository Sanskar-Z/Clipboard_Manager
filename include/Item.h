#pragma once
#include <string>
using namespace std;

enum class ItemType { Text };

struct ClipboardItem {
    int id;
    ItemType type;
    string text;
    bool pinned = false;
};
