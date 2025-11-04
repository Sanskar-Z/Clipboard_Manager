#include <napi.h>
#include "history_manager/HistoryManager.h"
#include <memory>
#include <string>

static std::unique_ptr<HistoryManager> manager;

Napi::Value Init(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    if (info.Length() < 1 || !info[0].IsString()) {
        Napi::TypeError::New(env, "Expected a string argument (data directory)").ThrowAsJavaScriptException();
        return env.Undefined();
    }
    
    std::string dataDir = info[0].As<Napi::String>().Utf8Value();
    manager = std::make_unique<HistoryManager>(dataDir);
    
    return env.Undefined();
}

Napi::Value SaveToSlot(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    if (info.Length() < 2 || !info[0].IsNumber() || !info[1].IsString()) {
        Napi::TypeError::New(env, "Expected (number, string) arguments").ThrowAsJavaScriptException();
        return env.Undefined();
    }
    
    int slot = info[0].As<Napi::Number>().Int32Value();
    std::string text = info[1].As<Napi::String>().Utf8Value();
    
    bool success = manager->setSlot(slot, text);
    return Napi::Boolean::New(env, success);
}

Napi::Value GetFromSlot(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    if (info.Length() < 1 || !info[0].IsNumber()) {
        Napi::TypeError::New(env, "Expected a number argument").ThrowAsJavaScriptException();
        return env.Undefined();
    }
    
    int slot = info[0].As<Napi::Number>().Int32Value();
    auto text = manager->getSlot(slot);
    
    if (!text.has_value()) return env.Null();
    return Napi::String::New(env, text.value());
}

Napi::Value AddToHistory(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    if (info.Length() < 1 || !info[0].IsString()) {
        Napi::TypeError::New(env, "Expected a string argument").ThrowAsJavaScriptException();
        return env.Undefined();
    }
    
    std::string text = info[0].As<Napi::String>().Utf8Value();
    bool success = manager->addItem(text);
    
    return Napi::Boolean::New(env, success);
}

Napi::Value GetHistory(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    auto items = manager->readHistory();
    auto result = Napi::Array::New(env, items.size());
    
    for (size_t i = 0; i < items.size(); i++) {
        auto item = Napi::Object::New(env);
        item.Set("content", items[i].content);
        item.Set("timestamp", items[i].timestamp);
        item.Set("pinned", items[i].pinned);
        result.Set(i, item);
    }
    
    return result;
}

Napi::Value SearchHistory(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    if (info.Length() < 1 || !info[0].IsString()) {
        Napi::TypeError::New(env, "Expected a string argument").ThrowAsJavaScriptException();
        return env.Undefined();
    }
    
    std::string query = info[0].As<Napi::String>().Utf8Value();
    auto items = manager->search(query);
    auto result = Napi::Array::New(env, items.size());
    
    for (size_t i = 0; i < items.size(); i++) {
        auto item = Napi::Object::New(env);
        item.Set("content", items[i].content);
        item.Set("timestamp", items[i].timestamp);
        item.Set("pinned", items[i].pinned);
        result.Set(i, item);
    }
    
    return result;
}

Napi::Value PinItem(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    if (info.Length() < 1 || !info[0].IsNumber()) {
        Napi::TypeError::New(env, "Expected a number argument").ThrowAsJavaScriptException();
        return env.Undefined();
    }
    
    size_t index = info[0].As<Napi::Number>().Uint32Value();
    bool success = manager->pinItem(index);
    
    return Napi::Boolean::New(env, success);
}

Napi::Value UnpinItem(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    if (info.Length() < 1 || !info[0].IsNumber()) {
        Napi::TypeError::New(env, "Expected a number argument").ThrowAsJavaScriptException();
        return env.Undefined();
    }
    
    size_t index = info[0].As<Napi::Number>().Uint32Value();
    bool success = manager->unpinItem(index);
    
    return Napi::Boolean::New(env, success);
}

Napi::Value DeleteItem(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    if (info.Length() < 1 || !info[0].IsNumber()) {
        Napi::TypeError::New(env, "Expected a number argument").ThrowAsJavaScriptException();
        return env.Undefined();
    }
    
    size_t index = info[0].As<Napi::Number>().Uint32Value();
    bool success = manager->deleteItem(index);
    
    return Napi::Boolean::New(env, success);
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set("init", Napi::Function::New(env, Init));
    exports.Set("saveToSlot", Napi::Function::New(env, SaveToSlot));
    exports.Set("getFromSlot", Napi::Function::New(env, GetFromSlot));
    exports.Set("addToHistory", Napi::Function::New(env, AddToHistory));
    exports.Set("getHistory", Napi::Function::New(env, GetHistory));
    exports.Set("searchHistory", Napi::Function::New(env, SearchHistory));
    exports.Set("pinItem", Napi::Function::New(env, PinItem));
    exports.Set("unpinItem", Napi::Function::New(env, UnpinItem));
    exports.Set("deleteItem", Napi::Function::New(env, DeleteItem));
    return exports;
}

NODE_API_MODULE(clipboard_addon, Init)