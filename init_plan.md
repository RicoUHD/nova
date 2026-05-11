I need to add i18n support.
We'll create `assets/languages/de.json` and `assets/languages/en.json`.
We'll implement a translation layer in `assets/app.js`.

The implementation will be:
1. Detect device language `navigator.language.startsWith('de') ? 'de' : 'en'`.
2. Load language JSON via `fetch('/assets/languages/' + currentLanguage + '.json')`.
3. In `index.html` and `setup.html`, we need to tag elements with `data-i18n="key"` or `data-i18n-placeholder="key"`.
4. Then `document.querySelectorAll('[data-i18n]').forEach(el => el.textContent = i18n[el.dataset.i18n] || el.textContent);`
5. Since texts are dynamically generated in `app.js`, we need a helper function `t('key')` that will be used in place of strings.
6. Similar in `backend/derivedData.js` since it outputs strings like `Zahlung überfällig` that the UI consumes. Wait, `derivedData.js` returns localized strings in backend? If we want real i18n we should return keys like `status.overdue` and translate in UI, or keep the German string as a key. Let's see how `derivedData.js` works.

I will request plan review.
