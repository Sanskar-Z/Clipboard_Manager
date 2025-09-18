#pragma once

class HistoryManager {
public:
    HistoryManager();
    void addEntry(const QString &entry);
    QStringList getHistory() const;
};
