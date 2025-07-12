import { expect, test } from "@playwright/test";

test.describe("API Endpoints", () => {
    test("should respond to content API", async ({ request }) => {
        const response = await request.get("/api/content");
        expect(response.status()).toBe(200);

        const data = await response.json();
        expect(data).toBeDefined();
    });

    test("should handle content by ID API", async ({ request }) => {
        // Test with a sample ID - this might return 404 which is fine
        const response = await request.get("/api/content/test-id");
        expect([200, 404]).toContain(response.status());
    });

    test("should respond to orgs API", async ({ request }) => {
        const response = await request.get("/api/orgs");
        expect([200, 401, 403]).toContain(response.status());
    });

    test("should respond to repos API", async ({ request }) => {
        const response = await request.get("/api/repos");
        expect([200, 401, 403]).toContain(response.status());
    });

    test("should handle repository content API", async ({ request }) => {
        // Test with a sample repository - this might return 404 which is fine
        const response = await request.get("/api/content/repository/test-repo");
        expect([200, 404, 401, 403]).toContain(response.status());
    });
});

test.describe("API Error Handling", () => {
    test("should handle invalid endpoints gracefully", async ({ request }) => {
        const response = await request.get("/api/nonexistent-endpoint");
        expect(response.status()).toBe(404);
    });

    test("should handle malformed requests", async ({ request }) => {
        // Test POST to GET-only endpoints
        const response = await request.post("/api/content", {
            data: { invalid: "data" },
        });
        expect([405, 404]).toContain(response.status());
    });
});

test.describe("Webhook Endpoints", () => {
    test("should respond to GitHub webhook endpoint", async ({ request }) => {
        // Test webhook endpoint - should require proper headers/auth
        const response = await request.post("/api/github-webhook", {
            data: { test: "data" },
        });
        expect([200, 400, 401, 403]).toContain(response.status());
    });

    test("should respond to Telegram webhook endpoint", async ({ request }) => {
        // Test webhook endpoint - should require proper headers/auth
        const response = await request.post("/api/telegram-webhook", {
            data: { test: "data" },
        });
        expect([200, 400, 401, 403]).toContain(response.status());
    });
});

test.describe("Management Endpoints", () => {
    test("should handle setup endpoint", async ({ request }) => {
        const response = await request.get("/api/setup");
        expect([200, 401, 403, 405]).toContain(response.status());
    });

    test("should handle manage-orgs endpoint", async ({ request }) => {
        const response = await request.get("/api/manage-orgs");
        expect([200, 401, 403, 405]).toContain(response.status());
    });

    test("should handle manage-repos endpoint", async ({ request }) => {
        const response = await request.get("/api/manage-repos");
        expect([200, 401, 403, 405]).toContain(response.status());
    });

    test("should handle sync-orgs endpoint", async ({ request }) => {
        const response = await request.get("/api/sync-orgs");
        expect([200, 401, 403, 405]).toContain(response.status());
    });
});
