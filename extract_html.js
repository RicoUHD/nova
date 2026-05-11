const fs = require('fs');
const { JSDOM } = require('jsdom');

function processFile(filename) {
    const html = fs.readFileSync(filename, 'utf8');
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const texts = {};
    let keyCounter = 1;

    const walker = document.createTreeWalker(document.body, dom.window.NodeFilter.SHOW_TEXT, null, false);
    let node;
    const toReplace = [];
    while(node = walker.nextNode()) {
        let text = node.textContent;
        // Check if text has actual words and not just whitespace or symbols
        if(text.trim().length > 0 && /[A-Za-zäöüÄÖÜß]/.test(text) && !text.includes('{{') && !text.includes('}')) {
            const trimmed = text.trim();
            // Create a key
            const key = 'txt_' + trimmed.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 20) + '_' + keyCounter++;
            texts[key] = trimmed;

            // replace in node
            // Actually replacing is complex because text nodes might be split. Let's just wrap or add data-i18n to parent if parent only has text.
        }
    }

    // Let's just output the texts
    console.log(`--- ${filename} ---`);
    console.log(JSON.stringify(texts, null, 2));
}

processFile('index.html');
processFile('setup.html');
