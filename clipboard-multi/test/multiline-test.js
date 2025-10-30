// Test different line endings and content
const testCases = [
    // Simple multiline
    `Line 1
Line 2
Line 3`,

    // With indentation
    `function test() {
    const x = 1;
        return x;
}`,

    // With empty lines
    `Header

Section 1

Section 2
`,

    // With special characters
    `🚀 UTF-8 Test
→ Indented line
• Bullet point
  ♥ Love symbol`
];

// Save each test case and verify
for (const text of testCases) {
    console.log('Original text:', text);
    console.log('Length:', text.length);
    console.log('Bytes:', Buffer.from(text).length);
    console.log('---');
}