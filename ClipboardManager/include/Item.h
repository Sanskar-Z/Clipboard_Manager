// Placeholder for clipboard item structure
#pragma once
#include <string>
#include <vector>

enum class ClipboardDataType { Text, Image, Files };

struct ClipboardItem {
    int id = 0;
    ClipboardDataType type;
    std::string text;
    std::string imagePath;
    std::vector<std::string> files;
    bool pinned = false;
};
