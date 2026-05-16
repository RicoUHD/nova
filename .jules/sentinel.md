## 2024-05-16 - Prevent IDOR in Request Modification
**Vulnerability:** Insecure Direct Object Reference (IDOR) allowed non-admin users to modify requests belonging to other users via `PATCH` or `PUT` to `/api/db` with a known `requestKey`.
**Learning:** Generic database update functions (like `writeLogicalPath`) must verify the ownership of the *existing* record before applying any updates, as checking only the incoming payload is insufficient to prevent cross-user data modification.
**Prevention:** Always fetch the existing resource and explicitly verify `existing.data.userId === current_user.uid` for non-admin users before merging and persisting updates.
