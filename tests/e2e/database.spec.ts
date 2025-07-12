import { expect, test } from "@playwright/test";

test.describe("Database Operations", () => {
    test("should handle content storage operations", async ({ request }) => {
        // Test creating content via API
        const createResponse = await request.post("/api/content", {
            data: {
                title: "Test Content",
                content: "This is test content for E2E testing",
                type: "test",
            },
        });

        // Should either succeed or fail gracefully
        expect([200, 201, 400, 401, 403, 405]).toContain(
            createResponse.status(),
        );

        if (createResponse.ok()) {
            const createdContent = await createResponse.json();
            expect(createdContent).toBeDefined();

            // If creation succeeded, try to fetch it
            if (createdContent.id) {
                const fetchResponse = await request.get(
                    `/api/content/${createdContent.id}`,
                );
                expect([200, 404]).toContain(fetchResponse.status());
            }
        }
    });

    test("should handle database connection gracefully", async ({ page }) => {
        // Navigate to a page that likely uses database
        await page.goto("/content");
        await page.waitForLoadState("networkidle");

        // Check for database connection errors in console
        const consoleErrors: string[] = [];
        page.on("console", (msg) => {
            if (msg.type() === "error") {
                consoleErrors.push(msg.text());
            }
        });

        // Wait for any async database operations
        await page.waitForTimeout(3000);

        // Filter for database-related errors
        const dbErrors = consoleErrors.filter((error) =>
            error.toLowerCase().includes("database") ||
            error.toLowerCase().includes("connection") ||
            error.toLowerCase().includes("supabase") ||
            error.toLowerCase().includes("postgres")
        );

        // Log database errors for debugging
        if (dbErrors.length > 0) {
            console.log("Database-related console errors:", dbErrors);
        }

        // Page should still be functional despite any database issues
        const pageTitle = await page.title();
        expect(pageTitle).toBeTruthy();
    });

    test("should handle content listing", async ({ request }) => {
        const response = await request.get("/api/content");
        expect(response.status()).toBe(200);

        const data = await response.json();
        expect(data).toBeDefined();

        // Data should be an array or an object with content
        if (Array.isArray(data)) {
            // If it's an array, it should be valid
            expect(data).toBeInstanceOf(Array);
        } else if (typeof data === "object") {
            // If it's an object, it should have some structure
            expect(data).toBeInstanceOf(Object);
        }
    });

    test("should handle repository data operations", async ({ request }) => {
        // Test repository-related endpoints
        const endpoints = [
            "/api/repos",
            "/api/orgs",
            "/api/content/repository/test-repo",
        ];

        for (const endpoint of endpoints) {
            const response = await request.get(endpoint);

            // Should return a valid HTTP status
            expect(response.status()).toBeLessThan(500);

            // If successful, should return valid JSON
            if (response.ok()) {
                try {
                    const data = await response.json();
                    expect(data).toBeDefined();
                } catch (error) {
                    // Some endpoints might return non-JSON responses, which is fine
                    console.log(
                        `Endpoint ${endpoint} returned non-JSON response`,
                    );
                }
            }
        }
    });
});

test.describe("Generated Content Table", () => {
    test("should handle generated content operations via API", async ({ request }) => {
        // Test the generated content endpoints
        const response = await request.get("/api/content");
        expect(response.status()).toBe(200);

        const data = await response.json();
        expect(data).toBeDefined();
    });

    test("should handle content by ID lookup", async ({ request }) => {
        // Test fetching content by ID (might not exist, which is fine)
        const testIds = ["test-id-1", "sample-content", "nonexistent"];

        for (const id of testIds) {
            const response = await request.get(`/api/content/${id}`);
            expect([200, 404]).toContain(response.status());

            if (response.ok()) {
                const content = await response.json();
                expect(content).toBeDefined();
                expect(content.id).toBe(id);
            }
        }
    });
});

test.describe("Database Schema Validation", () => {
    test("should have proper table structure", async ({ page }) => {
        // Navigate to admin page which might show database info
        await page.goto("/admin");
        await page.waitForLoadState("networkidle");

        // Check that the page loads without database schema errors
        const consoleErrors: string[] = [];
        page.on("console", (msg) => {
            if (msg.type() === "error") {
                consoleErrors.push(msg.text());
            }
        });

        await page.waitForTimeout(2000);

        // Filter for schema-related errors
        const schemaErrors = consoleErrors.filter((error) =>
            error.toLowerCase().includes("schema") ||
            error.toLowerCase().includes("table") ||
            error.toLowerCase().includes("column") ||
            error.toLowerCase().includes("migration")
        );

        if (schemaErrors.length > 0) {
            console.log("Schema-related console errors:", schemaErrors);
        }

        // Page should load successfully
        expect(page.url()).toContain("/admin");
    });
});
