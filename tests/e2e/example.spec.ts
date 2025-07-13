import { expect, test } from "@playwright/test";

test.describe("Homepage", () => {
    test("should load successfully", async ({ page }) => {
        await page.goto("/");

        // Wait for the page to load
        await page.waitForLoadState("networkidle");

        // Check that the page title contains expected text
        await expect(page).toHaveTitle(/Negro Industries/);

        // Check for basic page elements - use div instead of main
        const container = page.locator("div.min-h-screen");
        await expect(container).toBeVisible();

        // Check for the ASCII art logo
        const logo = page.locator("pre");
        await expect(logo).toBeVisible();
    });

    test("should have working navigation", async ({ page }) => {
        await page.goto("/");

        // Test navigation to different pages
        const dashboardLink = page.getByRole("link", { name: /dashboard/i });
        if (await dashboardLink.isVisible()) {
            await dashboardLink.click();
            await page.waitForLoadState("networkidle");
            await expect(page).toHaveURL(/dashboard/);
        }
    });
});

test.describe("Content Page", () => {
    test("should load content page", async ({ page }) => {
        await page.goto("/content");

        await page.waitForLoadState("networkidle");

        // Check that we're on the content page
        await expect(page).toHaveURL(/content/);

        // Check for main content area - use div instead of main
        const container = page.locator("div.min-h-screen");
        await expect(container).toBeVisible();

        // Check for the content archive header
        const header = page.getByText("AI-GENERATED CONTENT ARCHIVE");
        await expect(header).toBeVisible();
    });
});

test.describe("Dashboard Page", () => {
    test("should load dashboard page", async ({ page }) => {
        await page.goto("/dashboard");

        await page.waitForLoadState("networkidle");

        // Check that we're on the dashboard page
        await expect(page).toHaveURL(/dashboard/);

        // Check for main content area - use div instead of main
        const container = page.locator("div.min-h-screen");
        await expect(container).toBeVisible();

        // Check for system status panel
        const systemStatus = page.getByText("SYSTEM STATUS");
        await expect(systemStatus).toBeVisible();
    });
});

test.describe("API Health Check", () => {
    test("should have working API endpoints", async ({ request }) => {
        // Test that API endpoints are responsive
        const response = await request.get("/api/content");
        expect(response.status()).toBe(200);
    });
});
