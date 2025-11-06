{
  "targets": [{
    "target_name": "clipboard_addon",
    "cflags!": [ "-fno-exceptions" ],
    "cflags_cc!": [ "-fno-exceptions" ],
    "cflags_cc": [ "-std=c++17" ],
    "sources": [ 
      "src/node_addon/clipboard_addon.cpp",
      "src/history_manager/HistoryManager.cpp"
    ],
    "include_dirs": [
      "<!@(node -p \"require('node-addon-api').include\")",
      "include",
      "src"
    ],
    "defines": [ "NAPI_DISABLE_CPP_EXCEPTIONS" ],
    'conditions': [
      ['OS=="win"', {
        "defines": [
          "_HAS_EXCEPTIONS=1"
        ],
        "msvs_settings": {
          "VCCLCompilerTool": {
            "ExceptionHandling": 1,
            "AdditionalOptions": [ "/std:c++17" ]
          }
        }
      }],
      ['OS=="linux"', {
        "cflags_cc": [ "-std=c++17", "-fexceptions" ],
        "libraries": [ "-lstdc++fs" ]
      }],
      ['OS=="mac"', {
        "cflags_cc": [ "-std=c++17", "-fexceptions" ],
        "xcode_settings": {
          "GCC_ENABLE_CPP_EXCEPTIONS": "YES",
          "CLANG_CXX_LANGUAGE_STANDARD": "c++17",
          "MACOSX_DEPLOYMENT_TARGET": "10.15"
        }
      }]
    ]
  }]
}