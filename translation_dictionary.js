// Instead of messing with the HTML structure which might break CSS or JS queries,
// we can do a text-node replacement dictionary.
const fs = require('fs');
const { JSDOM } = require('jsdom');

let allTexts = new Set();

function collectTexts(filename) {
    const html = fs.readFileSync(filename, 'utf8');
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const walker = document.createTreeWalker(document.body, dom.window.NodeFilter.SHOW_TEXT, null, false);
    let node;
    while(node = walker.nextNode()) {
        const text = node.textContent.trim();
        if(text.length > 0 && /[A-Za-zäöüÄÖÜß]/.test(text) && !text.includes('{{') && !text.includes('}')) {
            allTexts.add(text);
        }
    }
    const inputs = document.querySelectorAll('input[placeholder], textarea[placeholder]');
    inputs.forEach(el => {
        const text = el.getAttribute('placeholder').trim();
        if (text.length > 0 && /[A-Za-zäöüÄÖÜß]/.test(text)) {
            allTexts.add(text);
        }
    });
}
collectTexts('index.html');
collectTexts('setup.html');

let deDict = {};
let enDict = {};
// Also parse app.js for strings we want to translate
const appJs = fs.readFileSync('assets/app.js', 'utf8');
const regex = /['"]([^'"]*[A-Za-zäöüÄÖÜß][^'"]*)['"]/g; // very broad, just for manual review

allTexts.forEach(text => {
    deDict[text] = text;
    enDict[text] = text; // Manual translation needed for EN, but for now fallback to DE
});

// A few manual EN translations for proof of concept
const manualEn = {
    "Lade Daten...": "Loading data...",
    "App installieren": "Install App",
    "Startseite": "Home",
    "Personen": "People",
    "Historie": "History",
    "KI-Support": "AI Support",
    "Einstellungen": "Settings",
    "Anfragen": "Requests",
    "Systemeinstellungen": "System Settings",
    "Aktueller Kassenstand": "Current Balance",
    "Tippen für Details": "Tap for details",
    "Einnahmen": "Income",
    "Ausgaben": "Expenses",
    "Mitglieder": "Members",
    "Überfällig": "Overdue",
    "Verlauf (90 Tage)": "History (90 days)",
    "Mitglieder suchen": "Search members",
    "Hinzufügen": "Add",
    "Noch keine Mitglieder.": "No members yet.",
    "Abmelden": "Logout"
};
Object.keys(manualEn).forEach(k => {
    if (deDict[k]) {
        enDict[k] = manualEn[k];
    }
});

fs.mkdirSync('assets/languages', { recursive: true });
fs.writeFileSync('assets/languages/de.json', JSON.stringify(deDict, null, 2));
fs.writeFileSync('assets/languages/en.json', JSON.stringify(enDict, null, 2));

console.log("Dictionary created with", Object.keys(deDict).length, "entries.");
