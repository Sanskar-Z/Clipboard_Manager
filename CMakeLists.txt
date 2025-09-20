cmake_minimum_required(VERSION 3.10)
project(ClipboardManager)

set(CMAKE_CXX_STANDARD 17)

add_executable(ClipboardManager
    src/main.cpp
    src/clipboard_monitor/ClipboardMonitor.cpp
    src/history_manager/HistoryManager.cpp
    src/advanced_features/AdvancedFeatures.cpp
    src/cli/CLI.cpp
)
