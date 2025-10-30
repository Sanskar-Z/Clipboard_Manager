const fs = require('fs');
const path = require('path');

function parseLine(line) {
    const parts = line.split('|');
    if (parts.length < 4) return null;
    const id = parseInt(parts[0]);
    const type = parseInt(parts[1]);
    const pinned = parts[2] === '1' || parts[2] === 'true';
    const content = parts.slice(3).join('|');
    return { id, type, pinned, content };
}

function formatLine(item) {
    return `${item.id}|${item.type}|${item.pinned ? 1 : 0}|${item.content}`;
}

function readHistory(filePath) {
    if (!fs.existsSync(filePath)) return [];
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').filter(l => l.trim());
    const items = lines.map(parseLine).filter(x => x !== null);
    return items;
}

function writeHistory(filePath, items) {
    const lines = items.map(formatLine).join('\n');
    fs.writeFileSync(filePath, lines + (lines.length ? '\n' : ''), 'utf8');
}

let lastDeleted = null;
let lastDeletedPath = null;

function ensureLastDeletedPath(filePath) {
    if (lastDeletedPath) return lastDeletedPath;
    const dir = path.dirname(filePath);
    lastDeletedPath = path.join(dir, '.clipboard_last_deleted.json');
    return lastDeletedPath;
}

function writeLastDeleted(filePath) {
    try {
        const p = ensureLastDeletedPath(filePath);
        if (!lastDeleted) {
            if (fs.existsSync(p)) fs.unlinkSync(p);
            return;
        }
        fs.writeFileSync(p, JSON.stringify(lastDeleted, null, 2), 'utf8');
    } catch (e) {
        // ignore errors
        console.error('Failed to write lastDeleted:', e);
    }
}

function readLastDeleted(filePath) {
    try {
        const p = ensureLastDeletedPath(filePath);
        if (!fs.existsSync(p)) return null;
        const txt = fs.readFileSync(p, 'utf8');
        const obj = JSON.parse(txt);
        lastDeleted = obj;
        return lastDeleted;
    } catch (e) {
        console.error('Failed to read lastDeleted:', e);
        return null;
    }
}

function addItem(filePath, content) {
    const items = readHistory(filePath);
    const nextId = items.length === 0 ? 1 : Math.max(...items.map(i => i.id)) + 1;
    const item = { id: nextId, type: 0, pinned: false, content };
    items.push(item);
    writeHistory(filePath, items);
    return item;
}

function setSlot(filePath, slot, content) {
    // Ensure directory exists
    const dir = path.dirname(filePath);
    try { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); } catch (e) {}

    // Update history: remove any existing item with this slot id, then add pinned item with id=slot
    const items = readHistory(filePath).filter(i => i.id !== slot);
    const item = { id: slot, type: 0, pinned: true, content };
    items.push(item);
    writeHistory(filePath, items);

    // Also write a per-slot file for easy access: slot0.txt .. slot9.txt
    try {
        const slotPath = path.join(dir, `slot${slot}.txt`);
        fs.writeFileSync(slotPath, content, 'utf8');
    } catch (e) {
        console.error('Failed to write slot file:', e);
    }

    return item;
}

function deleteItem(filePath, id) {
    const items = readHistory(filePath);
    const idx = items.findIndex(i => i.id === id);
    if (idx === -1) return null;
    lastDeleted = items[idx];
    items.splice(idx, 1);
    writeHistory(filePath, items);
    // persist lastDeleted to disk so undo survives reloads
    writeLastDeleted(filePath);
    return lastDeleted;
}

function pinItem(filePath, id) {
    const items = readHistory(filePath);
    const it = items.find(i => i.id === id);
    if (!it) return false;
    it.pinned = true;
    writeHistory(filePath, items);
    return true;
}

function unpinItem(filePath, id) {
    const items = readHistory(filePath);
    const it = items.find(i => i.id === id);
    if (!it) return false;
    it.pinned = false;
    writeHistory(filePath, items);
    return true;
}

function undoDelete(filePath) {
    // try to read persisted lastDeleted if in-memory is empty
    if (!lastDeleted) readLastDeleted(filePath);
    if (!lastDeleted) return null;
    const items = readHistory(filePath);
    items.push(lastDeleted);
    writeHistory(filePath, items);
    const restored = lastDeleted;
    lastDeleted = null;
    // remove persisted file
    try {
        const p = ensureLastDeletedPath(filePath);
        if (fs.existsSync(p)) fs.unlinkSync(p);
    } catch (e) { /* ignore */ }
    return restored;
}

function search(filePath, query) {
    const items = readHistory(filePath);
    return items.filter(i => i.content.indexOf(query) !== -1);
}

module.exports = {
    readHistory,
    writeHistory,
    addItem,
    deleteItem,
    pinItem,
    unpinItem,
    undoDelete,
    search,
    setSlot
};
