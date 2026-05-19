## 2024-05-19 - Fast Path for ISO Date Formatting in Filters
**Learning:** Utilizing `Date` parsing and `Intl.DateTimeFormat` inside large iterative loops (like `Array.prototype.filter`) creates significant CPU overhead in Node.js.
**Action:** Always implement a fast-path string-slicing alternative for known date formats (like PocketBase's standard ISO `YYYY-MM-DD` string) before falling back to native formatters to ensure fast dataset filtering.
