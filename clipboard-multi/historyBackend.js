const fs = require('fs');
const path = require('path');

function readHistory(filePath) {
    if (!fs.existsSync(filePath)) return [];
    const raw = fs.readFileSync(filePath, 'utf8');
    const lines = raw.split(/\r?\n/).filter(l => l.trim().length);
    return lines.map((l, idx) => {
        const sep = ' ||| ';
        const sidx = l.indexOf(sep);
        if (sidx !== -1) {
            let ts = l.substring(0, sidx);
            let content = l.substring(sidx + sep.length);
            let pinned = false;
            if (content.startsWith('[PINNED]')) {
                pinned = true;
                content = content.substring(8);
            }
            return { index: idx, timestamp: ts, content, pinned };
        } else {
            return { index: idx, timestamp: '', content: l, pinned: false };
        }
    });
}

function writeHistory(filePath, items) {
    const lines = items.map(it => {
        let content = it.content;
        if (it.pinned) content = '[PINNED]' + content;
        return `${it.timestamp} ||| ${content}`;
    });
    fs.writeFileSync(filePath, lines.join('\n') + (lines.length ? '\n' : ''), 'utf8');
}

function addItem(filePath, text) {
    const items = readHistory(filePath);
    const ts = new Date().toISOString().replace('T', ' ').split('.')[0];
    items.unshift({ index: 0, timestamp: ts, content: text, pinned: false });
    // reindex not strictly necessary
    writeHistory(filePath, items);
}

function deleteItem(filePath, index) {
    const items = readHistory(filePath);
    if (index < 0 || index >= items.length) return false;
    const removed = items.splice(index, 1);
    writeHistory(filePath, items);
    // save last deleted
    const lastDeletedPath = path.join(path.dirname(filePath), '.clipboard_last_deleted.json');
    fs.writeFileSync(lastDeletedPath, JSON.stringify(removed[0]), 'utf8');
    return true;
}

function undoDelete(filePath) {
    const lastDeletedPath = path.join(path.dirname(filePath), '.clipboard_last_deleted.json');
    if (!fs.existsSync(lastDeletedPath)) return false;
    const raw = fs.readFileSync(lastDeletedPath, 'utf8');
    try {
        const item = JSON.parse(raw);
        const items = readHistory(filePath);
        items.unshift(item);
        writeHistory(filePath, items);
        fs.unlinkSync(lastDeletedPath);
        return true;
    } catch (e) {
        return false;
    }
}

function pinItem(filePath, index) {
    const items = readHistory(filePath);
    if (index < 0 || index >= items.length) return false;
    items[index].pinned = true;
    writeHistory(filePath, items);
    return true;
}

function unpinItem(filePath, index) {
    const items = readHistory(filePath);
    if (index < 0 || index >= items.length) return false;
    items[index].pinned = false;
    writeHistory(filePath, items);
    return true;
}

function readSlotFile(slotPath) {
    try {
        if (!fs.existsSync(slotPath)) return null;
        return fs.readFileSync(slotPath, 'utf8');
    } catch (e) {
        return null;
    }
}

function setSlot(slotPath, slot, text) {
    try {
        fs.writeFileSync(slotPath, text, 'utf8');
        return true;
    } catch (e) {
        return false;
    }
}

module.exports = {
    readHistory,
    writeHistory,
    addItem,
    deleteItem,
    undoDelete,
    pinItem,
    unpinItem,
    setSlot,
    readSlotFile
};
