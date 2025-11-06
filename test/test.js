const path = require('path');
const fs = require('fs');

console.log('🧪 Testing Clipboard Manager Native Addon...\n');

try {
    // Load the native addon
    const clipboardAddon = require('bindings')('clipboard_addon');
    console.log('✅ Native addon loaded successfully');

    // Create test data directory
    const testDataDir = path.join(__dirname, 'test_data');
    if (!fs.existsSync(testDataDir)) {
        fs.mkdirSync(testDataDir, { recursive: true });
    }

    // Initialize the manager
    console.log('\n📁 Initializing with data directory:', testDataDir);
    clipboardAddon.init(testDataDir);
    console.log('✅ Manager initialized');

    // Test 1: Add items to history
    console.log('\n📝 Test 1: Adding items to history');
    clipboardAddon.addToHistory('First clipboard item');
    clipboardAddon.addToHistory('Second clipboard item');
    clipboardAddon.addToHistory('Third clipboard item with\nmultiple lines');
    console.log('✅ Added 3 items to history');

    // Test 2: Get history
    console.log('\n📋 Test 2: Reading history');
    const history = clipboardAddon.getHistory();
    console.log(`✅ Retrieved ${history.length} items:`);
    history.forEach((item, index) => {
        console.log(`   [${index}] ${item.timestamp} - ${item.content.substring(0, 50)}${item.content.length > 50 ? '...' : ''}`);
    });

    // Test 3: Save to slot
    console.log('\n💾 Test 3: Saving to slots');
    clipboardAddon.saveToSlot(0, 'Slot 0 content');
    clipboardAddon.saveToSlot(5, 'Slot 5 content');
    console.log('✅ Saved to slots 0 and 5');

    // Test 4: Get from slot
    console.log('\n📥 Test 4: Reading from slots');
    const slot0 = clipboardAddon.getFromSlot(0);
    const slot5 = clipboardAddon.getFromSlot(5);
    const slotEmpty = clipboardAddon.getFromSlot(9);
    console.log(`✅ Slot 0: "${slot0}"`);
    console.log(`✅ Slot 5: "${slot5}"`);
    console.log(`✅ Slot 9 (empty): ${slotEmpty === null ? 'null' : slotEmpty}`);

    // Test 5: Pin item
    console.log('\n📌 Test 5: Pinning item');
    clipboardAddon.pinItem(0);
    const historyAfterPin = clipboardAddon.getHistory();
    console.log(`✅ Item 0 pinned: ${historyAfterPin[0].pinned}`);

    // Test 6: Search
    console.log('\n🔍 Test 6: Searching history');
    const searchResults = clipboardAddon.searchHistory('clipboard');
    console.log(`✅ Found ${searchResults.length} items matching "clipboard"`);
    searchResults.forEach((item, index) => {
        console.log(`   [${index}] ${item.content.substring(0, 50)}`);
    });

    // Test 7: Unpin item
    console.log('\n📍 Test 7: Unpinning item');
    clipboardAddon.unpinItem(0);
    const historyAfterUnpin = clipboardAddon.getHistory();
    console.log(`✅ Item 0 unpinned: ${!historyAfterUnpin[0].pinned}`);

    // Test 8: Delete item
    console.log('\n🗑️  Test 8: Deleting item');
    const beforeDelete = clipboardAddon.getHistory().length;
    clipboardAddon.deleteItem(1);
    const afterDelete = clipboardAddon.getHistory().length;
    console.log(`✅ Deleted item. Count: ${beforeDelete} → ${afterDelete}`);

    console.log('\n✨ All tests passed successfully!\n');

    // Cleanup
    console.log('🧹 Cleaning up test data...');
    fs.rmSync(testDataDir, { recursive: true, force: true });
    console.log('✅ Cleanup complete\n');

} catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
}
