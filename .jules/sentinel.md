## 2026-05-16 - Prevent DOM XSS in Transaction History
**Vulnerability:** A DOM XSS vulnerability existed where user-provided input in transaction descriptions (`t.description`) and names (`t.who`) was rendered directly into the HTML list via `.innerHTML` without escaping.
**Learning:** Even internal views generated from the database can be susceptible to XSS if the data originates from inputs (e.g., descriptions or names) and is rendered into the DOM using template literals without sanitization.
**Prevention:** Always use `escapeHtml()` when interpolating any string variables into HTML templates that are passed to `.innerHTML`.
