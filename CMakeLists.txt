cmake_minimum_required(VERSION 3.20)
project(Clipboard_Manager VERSION 1.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

include_directories(${CMAKE_SOURCE_DIR}/include)

set(SOURCES
    src/main.cpp
    src/cli/CLI.cpp
    src/clipboard_monitor/ClipboardMonitor.cpp
    src/advanced_features/AdvancedFeatures.cpp
    src/history_manager/HistoryManager.cpp
)

add_executable(clipboard_manager ${SOURCES})

# Link Windows Shell libraries for AppData path functionality
if(WIN32)
    target_link_libraries(clipboard_manager PRIVATE shell32 shlwapi)
endif()
