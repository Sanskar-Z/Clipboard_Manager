cmake_minimum_required(VERSION 3.10)
project(ClipboardManager)

set(CMAKE_CXX_STANDARD 17)

include_directories(include)

file(GLOB SRC
    "src/*.cpp"
    "src/*/*.cpp"
    "src/*/*/*.cpp"
)

add_executable(ClipboardManager ${SRC})
target_link_libraries(ClipboardManager user32)

cmake_minimum_required(VERSION 3.10)
project(ClipboardManager)

set(CMAKE_CXX_STANDARD 17)

include_directories(
    ${PROJECT_SOURCE_DIR}/src
    ${PROJECT_SOURCE_DIR}/include
)

file(GLOB SOURCES
    src/*.cpp
    src/*/*.cpp
)

add_executable(ClipboardManager ${SOURCES})

