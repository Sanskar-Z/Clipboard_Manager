cmake_minimum_required(VERSION 3.20)
project(Clipboard_Manager VERSION 1.0 LANGUAGES CXX)

# Set C++ standard
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Include directories
include_directories(${CMAKE_SOURCE_DIR}/include)

# Source files
set(SOURCES
    src/main.cpp
    src/cli/CLI.cpp
    src/clipboard_monitor/ClipboardMonitor.cpp
    src/advanced_features/AdvancedFeatures.cpp
    src/history_manager/HistoryManager.cpp
)

# Create executable
add_executable(clipboard_manager ${SOURCES})
