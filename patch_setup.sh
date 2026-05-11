cat << 'DIFF' > patch.diff
<<<<<<< SEARCH
    const actualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', actualTheme);
</script>
=======
    let i18nDict = {};
    window.t = function(text) {
        if (!text) return text;
        return (i18nDict[text] && i18nDict[text] !== text) ? i18nDict[text] : text;
    };
    async function initI18n() {
        const lang = navigator.language.startsWith('de') ? 'de' : 'en';
        try {
            const res = await fetch(`/assets/languages/${lang}.json`);
            if (res.ok) {
                i18nDict = await res.json();
                translateDOM(document.body);
            }
        } catch (e) {
            console.error("Failed to load i18n", e);
        }
    }
    function translateDOM(root) {
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
        let node;
        const toTranslate = [];
        while (node = walker.nextNode()) {
            const text = node.nodeValue.trim();
            if (text.length > 0 && i18nDict[text] && i18nDict[text] !== text) {
                toTranslate.push({node, text});
            }
        }
        toTranslate.forEach(item => {
            item.node.nodeValue = item.node.nodeValue.replace(item.text, i18nDict[item.text]);
        });
        root.querySelectorAll('input[placeholder], textarea[placeholder]').forEach(el => {
            const p = el.getAttribute('placeholder').trim();
            if (i18nDict[p] && i18nDict[p] !== p) {
                el.setAttribute('placeholder', i18nDict[p]);
            }
        });
    }

    const actualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', actualTheme);

    document.addEventListener('DOMContentLoaded', initI18n);
</script>
>>>>>>> REPLACE
DIFF
