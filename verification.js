const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    // Mock the backend configuration
    await page.route('/assets/config.js', route => {
        route.fulfill({
            status: 200,
            contentType: 'application/javascript',
            body: 'export const config = { apiBaseUrl: "http://localhost:8080/api", appName: "Test App" };'
        });
    });

    // We will navigate to the page and inject a non-admin currentUser, then run loadData()
    await page.goto('http://127.0.0.1:8080/index.html');

    await page.evaluate(async () => {
        // Mock currentUser
        window.currentUser = {
            uid: 'test_user_1',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            admin: false,
            superAdmin: false
        };

        // Mock Firebase Auth state temporarily so loadData doesn't fail
        window.auth = {
            currentUser: {
                getIdToken: async () => 'dummy-token'
            }
        };

        // Mock get/child/ref/db from firebase
        window.db = {};
        window.ref = () => {};
        window.child = () => {};
        window.get = async () => ({ exists: () => true, val: () => ({}) });

        // Call loadData with silent=false
        await window.loadData(false);

        // Open the profile menu so the screenshot shows it
        window.toggleProfileMenu();
    });

    // Wait for animation
    await page.waitForTimeout(1000);

    await page.screenshot({ path: 'verification.png' });

    await browser.close();
})();
