const fs = require('fs');

const extractAndWrap = (filename) => {
    let html = fs.readFileSync(filename, 'utf8');
    let deTranslations = {};
    let enTranslations = {};
    let keyCounter = 1;

    // Use a simpler regex to find texts between > and <
    const regex = />([^<{}]+)</g;
    html = html.replace(regex, (match, p1) => {
        const text = p1.trim();
        // check if text contains letters
        if (text.length > 0 && /[A-Za-zäöüÄÖÜß]/.test(text) && !text.includes('{{') && !text.includes('}')) {
            const key = 'txt_' + text.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 20) + '_' + keyCounter++;
            deTranslations[key] = text;
            enTranslations[key] = text;

            // Rebuild string with data-i18n attribute
            // Because we matched >text<, it's safer to wrap it in a <span data-i18n="key">text</span>
            // Actually, if we wrap everything, it might break some formatting.
            // A better way is replacing the actual text with `<span data-i18n="key">...</span>`
            return `><span data-i18n="${key}">${text}</span><`;
        }
        return match;
    });

    // Handle placeholders
    const placeholderRegex = /placeholder="([^"]+)"/g;
    html = html.replace(placeholderRegex, (match, p1) => {
        const text = p1.trim();
        if (text.length > 0 && /[A-Za-zäöüÄÖÜß]/.test(text)) {
            const key = 'txt_' + text.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 20) + '_' + keyCounter++;
            deTranslations[key] = text;
            enTranslations[key] = text;
            return `placeholder="${text}" data-i18n-placeholder="${key}"`;
        }
        return match;
    });

    fs.writeFileSync(filename, html, 'utf8');
    return { deTranslations, enTranslations, keyCounter };
};

const resultIndex = extractAndWrap('index.html');
const resultSetup = extractAndWrap('setup.html');

const finalDe = { ...resultIndex.deTranslations, ...resultSetup.deTranslations };
const finalEn = { ...resultIndex.enTranslations, ...resultSetup.enTranslations };

fs.mkdirSync('assets/languages', { recursive: true });
fs.writeFileSync('assets/languages/de.json', JSON.stringify(finalDe, null, 2), 'utf8');
fs.writeFileSync('assets/languages/en.json', JSON.stringify(finalEn, null, 2), 'utf8');
