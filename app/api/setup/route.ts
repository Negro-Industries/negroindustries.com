import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const githubWebhookUrl = `${url.origin}/api/github-webhook`;
    const telegramWebhookUrl = `${url.origin}/api/telegram-webhook`;

    try {
        // Set Telegram webhook
        const setTelegramWebhookUrl =
            `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/setWebhook`;
        const telegramResponse = await fetch(setTelegramWebhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: telegramWebhookUrl }),
        });

        const telegramResult = await telegramResponse.json() as {
            ok: boolean;
            description?: string;
        };

        if (telegramResult.ok) {
            return NextResponse.json({
                message: "✅ Setup completed successfully!",
                githubWebhookUrl,
                telegramWebhookUrl,
                instructions: [
                    "Add organizations using POST /api/manage-orgs",
                    "Add individual repositories using POST /api/manage-repos",
                    "Configure GitHub webhooks for your repositories/organizations",
                    "Set up the following environment variables:",
                    "  - TELEGRAM_BOT_TOKEN",
                    "  - TELEGRAM_CHAT_ID",
                    "  - GITHUB_TOKEN",
                    "  - GROQ_API_KEY",
                    "",
                    "Organization monitoring will automatically discover and monitor new repositories!",
                ],
            });
        } else {
            return NextResponse.json(
                {
                    error:
                        `Failed to set Telegram webhook: ${telegramResult.description}`,
                },
                { status: 400 },
            );
        }
    } catch (error) {
        console.error("Setup error:", error);
        return NextResponse.json(
            { error: `Error setting up webhooks: ${error}` },
            { status: 500 },
        );
    }
}
