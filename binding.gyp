{
  "targets": [{
    "target_name": "clipboard_addon",
    "cflags!": [ "-fno-exceptions" ],
    "cflags_cc!": [ "-fno-exceptions" ],
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
            "ExceptionHandling": 1
          }
        }
      }]
    ]
  }]
}