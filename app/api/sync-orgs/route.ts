import { NextRequest, NextResponse } from "next/server";

interface OrganizationConfig {
    name: string;
    enabled: boolean;
    includePrivate: boolean;
    excludeRepos: string[];
    lastSyncTime?: string;
}

interface RepositoryConfig {
    owner: string;
    repo: string;
    enabled: boolean;
    lastCommitSha?: string;
    fromOrg?: boolean;
}

interface GitHubRepository {
    id: number;
    name: string;
    full_name: string;
    private?: boolean;
    owner: {
        login: string;
    };
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json() as { orgName?: string };

        if (body.orgName) {
            await syncOrganizationRepositories(body.orgName);
            return NextResponse.json({
                message: `Organization ${body.orgName} synced successfully`,
            });
        } else {
            await syncAllOrganizations();
            return NextResponse.json({
                message: "All organizations synced successfully",
            });
        }
    } catch (error) {
        console.error("Error syncing organizations:", error);
        return NextResponse.json({ error: "Internal Server Error" }, {
            status: 500,
        });
    }
}

async function syncAllOrganizations(): Promise<void> {
    const orgs = await listAllOrganizations();

    for (const org of orgs) {
        if (org.enabled) {
            await syncOrganizationRepositories(org.name);
        }
    }
}

async function syncOrganizationRepositories(orgName: string): Promise<void> {
    try {
        console.log(`🔄 Starting sync for organization: ${orgName}`);

        const orgConfig = await getOrganizationConfig(orgName);
        if (!orgConfig || !orgConfig.enabled) {
            console.log(
                `❌ Organization ${orgName} not configured or disabled`,
            );
            return;
        }

        console.log(
            `✅ Organization ${orgName} is enabled, fetching repositories...`,
        );
        const repos = await fetchOrganizationRepositories(orgName);
        let addedCount = 0;

        console.log(
            `📋 Processing ${repos.length} repositories for ${orgName}`,
        );
        for (const repo of repos) {
            console.log(
                `🔍 Processing repository: ${repo.full_name} (private: ${repo.private})`,
            );

            // Skip if repository is in exclude list
            if (orgConfig.excludeRepos.includes(repo.name)) {
                console.log(`⏭️ Skipping excluded repository: ${repo.name}`);
                continue;
            }

            // Skip private repositories if not included
            if (repo.private === true && !orgConfig.includePrivate) {
                console.log(
                    `⏭️ Skipping private repository (not included): ${repo.name}`,
                );
                continue;
            }

            // Check if repository is already being monitored
            const existingConfig = await getRepositoryConfig(repo.full_name);

            if (!existingConfig) {
                console.log(
                    `➕ Adding new repository to monitoring: ${repo.full_name}`,
                );
                const repoConfig: RepositoryConfig = {
                    owner: repo.owner.login,
                    repo: repo.name,
                    enabled: true,
                    fromOrg: true,
                };

                await updateRepositoryConfig(repo.full_name, repoConfig);
                addedCount++;
            } else {
                console.log(
                    `✅ Repository already monitored: ${repo.full_name}`,
                );
            }
        }

        console.log(`💾 Updating organization sync time for ${orgName}`);
        await updateOrganizationConfig(orgName, {
            ...orgConfig,
            lastSyncTime: new Date().toISOString(),
        });

        if (addedCount > 0) {
            console.log(
                `📤 Sending notification for ${addedCount} new repositories`,
            );
            await sendTelegramNotification(
                `🔄 Organization sync completed for ${orgName}: ${addedCount} new repositories added to monitoring`,
            );
        } else {
            console.log(
                `✅ Sync completed for ${orgName} - no new repositories added`,
            );
        }
    } catch (error) {
        console.error(`❌ Error syncing organization ${orgName}:`, error);
    }
}

async function fetchOrganizationRepositories(
    orgName: string,
): Promise<GitHubRepository[]> {
    const repositories: GitHubRepository[] = [];
    let page = 1;
    const perPage = 100;

    console.log(`🔍 Fetching repositories for organization: ${orgName}`);

    while (true) {
        const url =
            `https://api.github.com/orgs/${orgName}/repos?page=${page}&per_page=${perPage}&sort=updated`;

        console.log(`📡 GitHub API Request - URL: ${url}, Page: ${page}`);

        const response = await fetch(url, {
            headers: {
                Authorization: `token ${process.env.PERSONAL_GITHUB_TOKEN}`,
                Accept: "application/vnd.github.v3+json",
                "User-Agent": "nextjs-app/1.0",
                "X-GitHub-Api-Version": "2022-11-28",
            },
        });

        console.log(`📡 GitHub API Response - Status: ${response.status}`);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(
                `❌ GitHub API error for ${orgName} (page ${page}):`,
                {
                    status: response.status,
                    statusText: response.statusText,
                    error: errorText,
                    url: url,
                },
            );
            break;
        }

        const repos = await response.json() as GitHubRepository[];
        console.log(
            `✅ Fetched ${repos.length} repositories from page ${page} for ${orgName}`,
        );

        if (repos.length === 0) {
            console.log(
                `📄 No more repositories found for ${orgName} on page ${page}`,
            );
            break;
        }

        repositories.push(...repos);

        if (repos.length < perPage) {
            console.log(
                `📄 Last page reached for ${orgName} (${repos.length} < ${perPage})`,
            );
            break;
        }

        page++;
    }

    console.log(
        `🎉 Total repositories fetched for ${orgName}: ${repositories.length}`,
    );
    return repositories;
}

async function sendTelegramNotification(message: string): Promise<void> {
    const telegramApiUrl =
        `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;

    const telegramMessage = {
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: "Markdown",
    };

    console.log("📤 Sending Telegram notification");

    try {
        const response = await fetch(telegramApiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "User-Agent": "nextjs-app/1.0",
            },
            body: JSON.stringify(telegramMessage),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("❌ Telegram API error:", errorText);
        } else {
            console.log("✅ Telegram notification sent successfully");
        }
    } catch (error) {
        console.error("❌ Error sending Telegram notification:", error);
    }
}

// Storage functions - implement based on your storage solution
async function listAllOrganizations(): Promise<OrganizationConfig[]> {
    // Implement your storage logic here
    return [];
}

async function getOrganizationConfig(
    orgName: string,
): Promise<OrganizationConfig | null> {
    // Implement your storage logic here
    return null;
}

async function updateOrganizationConfig(
    orgName: string,
    config: OrganizationConfig,
): Promise<void> {
    // Implement your storage logic here
}

async function getRepositoryConfig(
    repoFullName: string,
): Promise<RepositoryConfig | null> {
    // Implement your storage logic here
    return null;
}

async function updateRepositoryConfig(
    repoFullName: string,
    config: RepositoryConfig,
): Promise<void> {
    // Implement your storage logic here
}
