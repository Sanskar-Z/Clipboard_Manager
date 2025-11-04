#include <napi.h>
#include "../history_manager/HistoryManager.h"
#include <memory>

static std::unique_ptr<HistoryManager> historyManager;

Napi::Value Init(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    if (info.Length() < 1) {
        Napi::TypeError::New(env, "Wrong number of arguments").ThrowAsJavaScriptException();
        return env.Undefined();
    }

    std::string dataDir = info[0].As<Napi::String>().Utf8Value();
    historyManager = std::make_unique<HistoryManager>(dataDir);
    return env.Undefined();
}

Napi::Value AddToHistory(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    if (info.Length() < 1) {
        Napi::TypeError::New(env, "Wrong number of arguments").ThrowAsJavaScriptException();
        return env.Undefined();
    }

    std::string text = info[0].As<Napi::String>().Utf8Value();
    bool success = historyManager->addItem(text);
    return Napi::Boolean::New(env, success);
}

Napi::Value GetHistory(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    auto items = historyManager->readHistory();
    
    Napi::Array result = Napi::Array::New(env, items.size());
    for (size_t i = 0; i < items.size(); i++) {
        Napi::Object item = Napi::Object::New(env);
        item.Set("timestamp", items[i].timestamp);
        item.Set("content", items[i].content);
        item.Set("pinned", items[i].pinned);
        result[i] = item;
    }
    return result;
}

Napi::Value SaveToSlot(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    if (info.Length() < 2) {
        Napi::TypeError::New(env, "Wrong number of arguments").ThrowAsJavaScriptException();
        return env.Undefined();
    }

    int slot = info[0].As<Napi::Number>().Int32Value();
    std::string text = info[1].As<Napi::String>().Utf8Value();
    bool success = historyManager->setSlot(slot, text);
    return Napi::Boolean::New(env, success);
}

Napi::Value GetFromSlot(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    if (info.Length() < 1) {
        Napi::TypeError::New(env, "Wrong number of arguments").ThrowAsJavaScriptException();
        return env.Undefined();
    }

    int slot = info[0].As<Napi::Number>().Int32Value();
    auto text = historyManager->getSlot(slot);
    if (!text.has_value()) {
        return env.Null();
    }
    return Napi::String::New(env, text.value());
}

Napi::Value PinItem(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    if (info.Length() < 1) {
        Napi::TypeError::New(env, "Wrong number of arguments").ThrowAsJavaScriptException();
        return env.Undefined();
    }

    size_t index = info[0].As<Napi::Number>().Uint32Value();
    bool success = historyManager->pinItem(index);
    return Napi::Boolean::New(env, success);
}

Napi::Value UnpinItem(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    if (info.Length() < 1) {
        Napi::TypeError::New(env, "Wrong number of arguments").ThrowAsJavaScriptException();
        return env.Undefined();
    }

    size_t index = info[0].As<Napi::Number>().Uint32Value();
    bool success = historyManager->unpinItem(index);
    return Napi::Boolean::New(env, success);
}

Napi::Value DeleteItem(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    if (info.Length() < 1) {
        Napi::TypeError::New(env, "Wrong number of arguments").ThrowAsJavaScriptException();
        return env.Undefined();
    }

    size_t index = info[0].As<Napi::Number>().Uint32Value();
    bool success = historyManager->deleteItem(index);
    return Napi::Boolean::New(env, success);
}

Napi::Value SearchHistory(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    if (info.Length() < 1) {
        Napi::TypeError::New(env, "Wrong number of arguments").ThrowAsJavaScriptException();
        return env.Undefined();
    }

    std::string query = info[0].As<Napi::String>().Utf8Value();
    auto items = historyManager->search(query);
    
    Napi::Array result = Napi::Array::New(env, items.size());
    for (size_t i = 0; i < items.size(); i++) {
        Napi::Object item = Napi::Object::New(env);
        item.Set("timestamp", items[i].timestamp);
        item.Set("content", items[i].content);
        item.Set("pinned", items[i].pinned);
        result[i] = item;
    }
    return result;
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set("init", Napi::Function::New(env, Init));
    exports.Set("addToHistory", Napi::Function::New(env, AddToHistory));
    exports.Set("getHistory", Napi::Function::New(env, GetHistory));
    exports.Set("saveToSlot", Napi::Function::New(env, SaveToSlot));
    exports.Set("getFromSlot", Napi::Function::New(env, GetFromSlot));
    exports.Set("pinItem", Napi::Function::New(env, PinItem));
    exports.Set("unpinItem", Napi::Function::New(env, UnpinItem));
    exports.Set("deleteItem", Napi::Function::New(env, DeleteItem));
    exports.Set("searchHistory", Napi::Function::New(env, SearchHistory));
    return exports;
}

NODE_API_MODULE(clipboard_addon, Init)