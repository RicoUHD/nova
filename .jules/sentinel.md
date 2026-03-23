## 2024-05-24 - Add XSS mitigation to request rendering

**Vulnerability:** The application was vulnerable to Stored Cross-Site Scripting (XSS) in `assets/app.js` because user-supplied strings from requests (such as payment notes, expense descriptions, status change descriptions, and rejection reasons) were directly interpolated into the DOM using template literals (`innerHTML`) without escaping.

**Learning:** When generating HTML snippets dynamically via template strings, it is critical to sanitize all variable parts that might originate from user input. A dedicated helper function like `escapeHtml()` provides a reliable way to encode special characters.

**Prevention:** Always wrap user-supplied data in `escapeHtml(data)` before placing it into template literals that will be processed by `.innerHTML`. Establish this as a standard pattern across all frontend rendering functions.
