1. **Initialize i18n logic**:
   - I will modify `assets/app.js` using `replace_with_git_merge_diff` to add an `i18nDict` variable and an `initI18n()` function right before the `DOMContentLoaded` event listener (lines 60-61). The search block will be:
     `document.addEventListener('DOMContentLoaded', async () => {`
     `    const appName = config.appName || "Nova";`
   - `initI18n()` will fetch `/assets/languages/de.json` or `en.json` based on `navigator.language` and call `translateDOM(document.body)` to walk text nodes and update their values based on the dictionary.
   - The same initialization logic will be added to the `<script>` block in `setup.html` right before the `const actualTheme` line using `replace_with_git_merge_diff` (lines 250-252). The search block will be:
     `    const actualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';`
     `    document.documentElement.setAttribute('data-theme', actualTheme);`
     `</script>`
   - I will also add a global wrapper `window.t(text)` that replaces strings via `i18nDict`.

2. **Translate dynamic backend strings**:
   - `assets/app.js` renders backend generated strings (like "Keine Zahlungen"). These German strings are already in `en.json`. They are consumed in `assets/app.js` as `statusMeta.text`.
   - I will use `replace_with_git_merge_diff` to modify `assets/app.js` based on grep results.
     Search block 1:
     `            <h2 style="color: ${statusColor}; font-size: 1.25rem; font-weight: 800; margin-bottom: 5px;">`
     `                ${statusMeta.text}`
     `            </h2>`
     Replace block 1:
     `            <h2 style="color: ${statusColor}; font-size: 1.25rem; font-weight: 800; margin-bottom: 5px;">`
     `                ${window.t(statusMeta.text)}`
     `            </h2>`
     Search block 2:
     `                        ${(statusMeta.isActiveStandingOrder && !statusMeta.isOverdue) ? '' : \`<span class="payment-pill \${pillClass}">\${dateText}</span>\`}`
     `                        <span class="time-remaining">${statusMeta.text}</span>`
     `                    </div>`
     Replace block 2:
     `                        ${(statusMeta.isActiveStandingOrder && !statusMeta.isOverdue) ? '' : \`<span class="payment-pill \${pillClass}">\${dateText}</span>\`}`
     `                        <span class="time-remaining">${window.t(statusMeta.text)}</span>`
     `                    </div>`

3. **Verify modifications**:
   - Use `run_in_bash_session` to run `cat assets/app.js | grep "window.t"` to ensure the wrapper was added correctly.
   - Use `run_in_bash_session` to run `cat setup.html | grep "initI18n"` to check if `setup.html` was updated correctly.

4. **Verify backend integrity**:
   - Run the backend tests using `run_in_bash_session` to execute `cd backend && npm install && node --test` to verify no regressions were introduced.

5. **Complete pre-commit steps to ensure proper testing, verification, review, and reflection are done.**

6. **Submit**.
