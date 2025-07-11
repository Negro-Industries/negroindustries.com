import { NextRequest, NextResponse } from "next/server";

interface TelegramUpdate {
    update_id: number;
    message?: {
        message_id: number;
        from: {
            id: number;
            is_bot: boolean;
            first_name: string;
            username?: string;
        };
        chat: {
            id: number;
            first_name?: string;
            username?: string;
            type: string;
        };
        date: number;
        text?: string;
    };
}

interface RepositoryConfig {
    owner: string;
    repo: string;
    enabled: boolean;
    lastCommitSha?: string;
    fromOrg?: boolean;
}

interface OrganizationConfig {
    name: string;
    enabled: boolean;
    includePrivate: boolean;
    excludeRepos: string[];
    lastSyncTime?: string;
}

export async function POST(request: NextRequest) {
    try {
        console.log("📱 Telegram webhook received");

        const update = await request.json() as TelegramUpdate;
        console.log("📦 Telegram update:", JSON.stringify(update, null, 2));

        if (update.message && update.message.text) {
            console.log(
                `💬 Processing message: "${update.message.text}" from ${update.message.from.first_name}`,
            );
            await handleTelegramMessage(update.message);
        } else {
            console.log(
                "⏭️ Skipping non-text message or update without message",
            );
        }

        return NextResponse.json({ message: "OK" });
    } catch (error) {
        console.error("❌ Error handling Telegram webhook:", error);
        return NextResponse.json({ error: "Internal Server Error" }, {
            status: 500,
        });
    }
}

async function handleTelegramMessage(message: any): Promise<void> {
    const chatId = message.chat.id;
    const text = message.text;
    const firstName = message.from.first_name;

    let responseText = "";

    if (text === "/start") {
        responseText =
            `Hello ${firstName}! 👋\n\nWelcome to the GitHub Repository Monitor!\n\nCommands:\n/start - Show this message\n/repos - List monitored repositories\n/orgs - List monitored organizations\n/sync - Sync organization repositories\n/help - Get help`;
    } else if (text === "/help") {
        responseText =
            `🤖 GitHub Repository Monitor Help\n\nThis bot monitors GitHub repositories and organizations for CHANGELOG.md changes.\n\nCommands:\n• /start - Welcome message\n• /repos - List monitored repositories\n• /orgs - List monitored organizations\n• /sync - Sync organization repositories\n• /help - This help message\n\nAPI Endpoints:\n• POST /api/manage-repos - Add/remove individual repositories\n• POST /api/manage-orgs - Add/remove organizations\n• POST /api/sync-orgs - Sync all organization repositories`;
    } else if (text === "/repos") {
        const repos = await listAllRepositories();
        if (repos.length === 0) {
            responseText = "No repositories are currently being monitored.";
        } else {
            responseText = "📋 Monitored Repositories:\n\n" +
                repos
                    .map(
                        (repo) =>
                            `• ${repo.owner}/${repo.repo} ${
                                repo.enabled ? "✅" : "❌"
                            } ${repo.fromOrg ? "(from org)" : ""}`,
                    )
                    .join("\n");
        }
    } else if (text === "/orgs") {
        const orgs = await listAllOrganizations();
        if (orgs.length === 0) {
            responseText = "No organizations are currently being monitored.";
        } else {
            responseText = "🏢 Monitored Organizations:\n\n" +
                orgs
                    .map(
                        (org) =>
                            `• ${org.name} ${org.enabled ? "✅" : "❌"} ${
                                org.includePrivate
                                    ? "(incl. private)"
                                    : "(public only)"
                            }`,
                    )
                    .join("\n");
        }
    } else if (text === "/sync") {
        await syncAllOrganizations();
        responseText =
            "🔄 Organization repositories sync initiated. Check logs for details.";
    } else if (text?.startsWith("/")) {
        responseText =
            `Unknown command: ${text}\n\nType /help to see available commands.`;
    } else {
        responseText =
            `I monitor GitHub repositories and organizations for CHANGELOG.md changes. Type /help for more info.`;
    }

    await sendTelegramMessage(chatId, responseText);
}

async function sendTelegramMessage(
    chatId: number | string,
    text: string,
): Promise<void> {
    const telegramApiUrl =
        `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;

    const message = {
        chat_id: chatId,
        text: text,
        parse_mode: "Markdown",
    };

    console.log(`📤 Sending Telegram message to chat ${chatId}`);

    try {
        const response = await fetch(telegramApiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "User-Agent": "nextjs-app/1.0",
            },
            body: JSON.stringify(message),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(
                `❌ Telegram API error (status ${response.status}):`,
                errorText,
            );

            // Try again without markdown formatting
            const fallbackMessage = {
                chat_id: chatId,
                text: text
                    .replace(/\*([^*]+)\*/g, "$1")
                    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1"),
            };

            const fallbackResponse = await fetch(telegramApiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "User-Agent": "nextjs-app/1.0",
                },
                body: JSON.stringify(fallbackMessage),
            });

            if (!fallbackResponse.ok) {
                const fallbackErrorText = await fallbackResponse.text();
                console.error(
                    `❌ Telegram fallback API error:`,
                    fallbackErrorText,
                );
            } else {
                console.log("✅ Fallback message sent successfully");
            }
        } else {
            console.log("✅ Telegram message sent successfully");
        }
    } catch (error) {
        console.error("❌ Error sending Telegram message:", error);
    }
}

// Storage functions - implement based on your storage solution
async function listAllRepositories(): Promise<RepositoryConfig[]> {
    // Implement your storage logic here
    return [];
}

async function listAllOrganizations(): Promise<OrganizationConfig[]> {
    // Implement your storage logic here
    return [];
}

async function syncAllOrganizations(): Promise<void> {
    // Implement your sync logic here
}
