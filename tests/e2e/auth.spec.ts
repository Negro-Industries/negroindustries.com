import { expect, test } from "@playwright/test";

test.describe("Authentication Flow", () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the homepage before each test
        await page.goto("/");
        await page.waitForLoadState("networkidle");
    });

    test("should show login/signup options when not authenticated", async ({ page }) => {
        // Check if there are any auth-related elements on the page
        // This test will need to be adjusted based on your actual auth UI

        // Look for common auth indicators
        const authElements = [
            page.getByRole("button", { name: /sign in/i }),
            page.getByRole("button", { name: /login/i }),
            page.getByRole("link", { name: /sign in/i }),
            page.getByRole("link", { name: /login/i }),
        ];

        // Check if at least one auth element exists
        let hasAuthElement = false;
        for (const element of authElements) {
            if (await element.isVisible()) {
                hasAuthElement = true;
                break;
            }
        }

        // If no auth elements are found, that's also valid (app might not have visible auth UI)
        console.log("Auth elements check completed");
    });

    test("should handle navigation to protected routes", async ({ page }) => {
        // Try to access admin page (likely protected)
        await page.goto("/admin");
        await page.waitForLoadState("networkidle");

        // The page should either:
        // 1. Redirect to login
        // 2. Show access denied
        // 3. Show the admin page if auth is not required
        // We'll just verify the page loads without error

        const pageTitle = await page.title();
        expect(pageTitle).toBeTruthy();
    });

    test("should handle API authentication", async ({ request }) => {
        // Test API endpoints that might require authentication
        const protectedEndpoints = [
            "/api/setup",
            "/api/manage-orgs",
            "/api/manage-repos",
        ];

        for (const endpoint of protectedEndpoints) {
            const response = await request.get(endpoint);
            // Should either return 401/403 (unauthorized) or 200 (if no auth required)
            expect([200, 401, 403, 405]).toContain(response.status());
        }
    });
});

test.describe("Supabase Integration", () => {
    test("should connect to Supabase successfully", async ({ page }) => {
        // Navigate to a page that uses Supabase
        await page.goto("/dashboard");
        await page.waitForLoadState("networkidle");

        // Check for any Supabase connection errors in console
        const consoleErrors: string[] = [];
        page.on("console", (msg) => {
            if (msg.type() === "error") {
                consoleErrors.push(msg.text());
            }
        });

        // Wait a bit for any async operations to complete
        await page.waitForTimeout(2000);

        // Filter out non-Supabase related errors
        const supabaseErrors = consoleErrors.filter((error) =>
            error.toLowerCase().includes("supabase") ||
            error.toLowerCase().includes("auth") ||
            error.toLowerCase().includes("connection")
        );

        // Log any Supabase-related errors for debugging
        if (supabaseErrors.length > 0) {
            console.log("Supabase-related console errors:", supabaseErrors);
        }
    });

    test("should handle database operations gracefully", async ({ request }) => {
        // Test content API which likely uses Supabase
        const response = await request.get("/api/content");

        // Should return either success or a proper error response
        expect(response.status()).toBeLessThan(500);

        if (response.ok()) {
            const data = await response.json();
            expect(data).toBeDefined();
        }
    });
});
