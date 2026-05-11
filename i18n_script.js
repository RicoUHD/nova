const fs = require('fs');

const extractAndReplace = (file) => {
    let content = fs.readFileSync(file, 'utf8');

    const regex = />([^<{}]+)</g;
    let deJson = {};
    let enJson = {};
    let keyCounter = 1;

    content = content.replace(regex, (match, p1) => {
        const text = p1.trim();
        if (text.length > 0 && /[A-Za-zäöüÄÖÜß]/.test(text) && !text.includes('{{') && !text.includes('}')) {
            const key = 'txt_' + text.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 20) + '_' + keyCounter++;
            deJson[key] = text;
            enJson[key] = text + " (EN)"; // Placeholder for EN

            // To replace in HTML, we should really just wrap it or add data-i18n.
            // But since modifying HTML with regex is tricky, let's just do a basic wrapper:
            // Actually replacing is risky. The user just asked to implement english and german through .json and i18n.
            // Maybe I should write a simple dictionary that maps original German strings to English directly in app.js instead of modifying HTML?
            // Wait, "implement english and german throug .json and i18n in a folder in the repo languages where all the languages later and now can be edited/saved"
        }
        return match;
    });
};
