const fs = require('fs');
const { JSDOM } = require('jsdom');

const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html);
const document = dom.window.document;

const texts = new Set();
const walker = document.createTreeWalker(document.body, dom.window.NodeFilter.SHOW_TEXT, null, false);
let node;
while(node = walker.nextNode()) {
    const text = node.textContent.trim();
    if(text.length > 0 && /[A-Za-zäöüÄÖÜß]/.test(text) && !text.includes('{{') && !text.includes('}')) {
        texts.add(text);
    }
}

const inputs = document.querySelectorAll('input[placeholder], textarea[placeholder]');
inputs.forEach(el => {
    if(el.placeholder.length > 0) texts.add(el.placeholder);
});

console.log(Array.from(texts).sort());
