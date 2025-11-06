#include "HistoryManager.h"
#include <filesystem>
#include <fstream>
#include <sstream>
#include <chrono>
#include <iomanip>
#include <iostream>
#include <algorithm>

namespace fs = std::filesystem;

HistoryManager::HistoryManager(const std::string &data_dir)
    : m_dataDir(data_dir) {
    if (!fs::exists(m_dataDir)) fs::create_directories(m_dataDir);
    m_historyPath = (fs::path(m_dataDir) / "history.txt").string();
    m_lastDeletedPath = (fs::path(m_dataDir) / ".clipboard_last_deleted.txt").string();
    // Ensure slot directory
    if (!fs::exists(fs::path(m_dataDir) / "slots")) {
        fs::create_directories(fs::path(m_dataDir) / "slots");
    }
}

static std::string now_iso8601() {
    auto t = std::chrono::system_clock::now();
    auto tt = std::chrono::system_clock::to_time_t(t);
    std::tm* tm = std::localtime(&tt);
    std::ostringstream ss;
    ss << std::put_time(tm, "%Y-%m-%d %H:%M:%S");
    return ss.str();
}

std::vector<HistoryItem> HistoryManager::readHistory() {
    std::vector<HistoryItem> out;
    std::ifstream in(m_historyPath);
    if (!in.is_open()) return out;
    
    std::string entry;
    std::string line;
    bool isReading = false;
    bool isReadingContent = false;
    HistoryItem currentItem;
    size_t contentLength = 0;
    
    while (std::getline(in, line)) {
        if (line.find("=== ENTRY START ===") != std::string::npos) {
            isReading = true;
            isReadingContent = false;
            currentItem = HistoryItem();
            continue;
        }
        
        if (line.find("=== ENTRY END ===") != std::string::npos) {
            if (isReading && !currentItem.content.empty()) {
                out.push_back(currentItem);
            }
            isReading = false;
            isReadingContent = false;
            continue;
        }
        
        if (isReading) {
            if (line.find("TIMESTAMP: ") == 0) {
                currentItem.timestamp = line.substr(11);
            } else if (line.find("PINNED: ") == 0) {
                currentItem.pinned = (line.substr(8) == "1");
            } else if (line.find("CONTENT_LENGTH: ") == 0) {
                contentLength = std::stoul(line.substr(15));
            } else if (line == "CONTENT:") {
                isReadingContent = true;
                continue;
            } else if (line == "END_CONTENT") {
                isReadingContent = false;
            } else if (isReadingContent) {
                if (!currentItem.content.empty()) {
                    currentItem.content += "\n";
                }
                currentItem.content += line;
            }
        }
    }
    return out;
}

bool HistoryManager::writeHistory(const std::vector<HistoryItem>& items) {
    std::ofstream out(m_historyPath, std::ios::trunc);
    if (!out.is_open()) return false;
    for (const auto &it : items) {
        out << "=== ENTRY START ===" << "\n";
        out << "TIMESTAMP: " << it.timestamp << "\n";
        out << "PINNED: " << (it.pinned ? "1" : "0") << "\n";
        out << "CONTENT_LENGTH: " << it.content.length() << "\n";
        out << "CONTENT:\n" << it.content << "\nEND_CONTENT\n";
        out << "=== ENTRY END ===" << "\n\n";
    }
    return true;
}

bool HistoryManager::addItem(const std::string &text) {
    auto items = readHistory();
    HistoryItem it;
    it.timestamp = now_iso8601();
    it.content = text;
    it.pinned = false;
    items.insert(items.begin(), it); // newest at front
    return writeHistory(items);
}

bool HistoryManager::deleteItem(size_t index) {
    auto items = readHistory();
    if (index >= items.size()) return false;
    auto deleted = items[index];
    // remove that item
    items.erase(items.begin() + index);
    if (!writeHistory(items)) return false;
    saveLastDeleted(deleted);
    return true;
}

bool HistoryManager::pinItem(size_t index) {
    auto items = readHistory();
    if (index >= items.size()) return false;
    items[index].pinned = true;
    return writeHistory(items);
}

bool HistoryManager::unpinItem(size_t index) {
    auto items = readHistory();
    if (index >= items.size()) return false;
    items[index].pinned = false;
    return writeHistory(items);
}

bool HistoryManager::saveLastDeleted(const HistoryItem &it) {
    std::ofstream out(m_lastDeletedPath, std::ios::trunc);
    if (!out.is_open()) return false;
    out << "=== ENTRY START ===" << "\n";
    out << "TIMESTAMP: " << it.timestamp << "\n";
    out << "PINNED: " << (it.pinned ? "1" : "0") << "\n";
    out << "CONTENT: " << it.content << "\n";
    out << "=== ENTRY END ===" << "\n";
    return true;
}

std::optional<HistoryItem> HistoryManager::loadLastDeleted() {
    std::ifstream in(m_lastDeletedPath);
    if (!in.is_open()) return std::nullopt;
    
    HistoryItem it;
    std::string line;
    bool isReading = false;
    
    while (std::getline(in, line)) {
        if (line.find("=== ENTRY START ===") != std::string::npos) {
            isReading = true;
            continue;
        }
        
        if (line.find("=== ENTRY END ===") != std::string::npos) {
            break;
        }
        
        if (isReading) {
            if (line.find("TIMESTAMP: ") == 0) {
                it.timestamp = line.substr(11);
            } else if (line.find("PINNED: ") == 0) {
                it.pinned = (line.substr(8) == "1");
            } else if (line.find("CONTENT: ") == 0) {
                it.content = line.substr(9);
            } else if (!line.empty()) {
                // Append additional content lines
                it.content += "\n" + line;
            }
        }
    }
    
    if (it.content.empty()) return std::nullopt;
    return it;
}

bool HistoryManager::undoDelete() {
    auto maybe = loadLastDeleted();
    if (!maybe.has_value()) return false;
    auto it = maybe.value();
    auto items = readHistory();
    items.insert(items.begin(), it);
    bool ok = writeHistory(items);
    if (ok) {
        // remove lastDeleted
        std::error_code ec;
        fs::remove(m_lastDeletedPath, ec);
    }
    return ok;
}

std::string HistoryManager::historyFilePath() const {
    return m_historyPath;
}

std::string HistoryManager::slotFilePath(int slot) const {
    std::ostringstream ss;
    ss << (fs::path(m_dataDir) / "slots" / ("slot_" + std::to_string(slot) + ".txt")).string();
    return ss.str();
}

bool HistoryManager::setSlot(int slot, const std::string &text) {
    if (slot < 0 || slot > 9) return false;
    auto path = slotFilePath(slot);
    std::ofstream out(path, std::ios::trunc | std::ios::binary);
    if (!out.is_open()) return false;
    
    // Store with entry markers and length to maintain consistency
    out << "=== SLOT START ===" << "\n";
    out << "CONTENT_LENGTH: " << text.length() << "\n";
    out << "CONTENT:\n" << text << "\nEND_CONTENT\n";
    out << "=== SLOT END ===";
    return true;
}

std::optional<std::string> HistoryManager::getSlot(int slot) {
    if (slot < 0 || slot > 9) return std::nullopt;
    auto path = slotFilePath(slot);
    std::ifstream in(path, std::ios::binary);
    if (!in.is_open()) return std::nullopt;
    
    std::string content;
    std::string line;
    bool isReading = false;
    bool isReadingContent = false;
    size_t contentLength = 0;
    
    while (std::getline(in, line)) {
        if (line == "=== SLOT START ===") {
            isReading = true;
            continue;
        }
        if (line == "=== SLOT END ===") {
            break;
        }
        if (isReading) {
            if (line.find("CONTENT_LENGTH: ") == 0) {
                contentLength = std::stoul(line.substr(15));
            } else if (line == "CONTENT:") {
                isReadingContent = true;
                continue;
            } else if (line == "END_CONTENT") {
                isReadingContent = false;
            } else if (isReadingContent) {
                if (!content.empty()) {
                    content += "\n";
                }
                content += line;
            }
        }
    }
    
    if (content.empty()) return std::nullopt;
    return content;
}

std::vector<HistoryItem> HistoryManager::search(const std::string &keyword) {
    if (keyword.empty()) return readHistory();
    
    auto items = readHistory();
    std::vector<HistoryItem> results;
    std::string lowerKeyword = keyword;
    std::transform(lowerKeyword.begin(), lowerKeyword.end(), lowerKeyword.begin(), ::tolower);
    
    for (auto &it : items) {
        std::string lowerContent = it.content;
        std::transform(lowerContent.begin(), lowerContent.end(), lowerContent.begin(), ::tolower);
        if (lowerContent.find(lowerKeyword) != std::string::npos) {
            results.push_back(it);
        }
    }
    return results;
}
