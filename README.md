# Clipboard Manager C++

## Build (Windows)
1. Install Visual Studio or MinGW with C++17.
2. Open terminal at project root.
3. mkdir build && cd build
4. cmake ..
5. cmake --build .

## Run
./ClipboardManager.exe

## Features
- Monitors clipboard text
- Stores history with pin/unpin
- Console-based GUI placeholder (can upgrade to Qt later)


## Command 
#### 1.
```
g++ -std=c++17 src/main.cpp src/cli/CLI.cpp src/history_manager/HistoryManager.cpp src/advanced_features/AdvancedFeatures.cpp src/clipboard_monitor/ClipboardMonitor.cpp -Iinclude -o clipboard_manager.exe
```


#### 2.
```
.\clipboard_manager.exe
```