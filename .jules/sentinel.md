## 2023-10-27 - Stored XSS in Admin Requests Rendering
**Vulnerability:** The `personName` property from user requests was directly injected into the DOM via `innerHTML` in the `renderAdminRequests` function in `assets/app.js` without sanitization.
**Learning:** Even internal or admin-facing UI elements must sanitize data coming from user input or database records when using `innerHTML`, as malicious users could submit crafted payloads (like `<img src=x onerror=...`) that execute scripts when an admin views the requests.
**Prevention:** Always use the application's `escapeHtml()` utility function to wrap any variable interpolation inside template literals that are assigned to `innerHTML`.
