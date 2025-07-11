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

export async function POST(request: NextRequest) {
    try {
        const body = await request.json() as {
            action: "add" | "remove" | "enable" | "disable";
            name: string;
            includePrivate?: boolean;
            excludeRepos?: string[];
        };

        const existingConfig = await getOrganizationConfig(body.name);

        switch (body.action) {
            case "add":
                const newConfig: OrganizationConfig = {
                    name: body.name,
                    enabled: true,
                    includePrivate: body.includePrivate || false,
                    excludeRepos: body.excludeRepos || [],
                };
                await updateOrganizationConfig(body.name, newConfig);

                // Sync repositories immediately
                await syncOrganizationRepositories(body.name);

                return NextResponse.json({
                    message:
                        `Organization ${body.name} added and synced successfully`,
                });

            case "remove":
                await removeOrganizationConfig(body.name);

                // Optionally remove all repositories from this organization
                const repos = await listAllRepositories();
                for (const repo of repos) {
                    if (repo.owner === body.name && repo.fromOrg) {
                        await removeRepositoryConfig(
                            `${repo.owner}/${repo.repo}`,
                        );
                    }
                }

                return NextResponse.json({
                    message:
                        `Organization ${body.name} and its repositories removed successfully`,
                });

            case "enable":
                if (existingConfig) {
                    await updateOrganizationConfig(
                        body.name,
                        { ...existingConfig, enabled: true },
                    );
                    return NextResponse.json({
                        message:
                            `Organization ${body.name} enabled successfully`,
                    });
                }
                return NextResponse.json({ error: "Organization not found" }, {
                    status: 404,
                });

            case "disable":
                if (existingConfig) {
                    await updateOrganizationConfig(
                        body.name,
                        { ...existingConfig, enabled: false },
                    );
                    return NextResponse.json({
                        message:
                            `Organization ${body.name} disabled successfully`,
                    });
                }
                return NextResponse.json({ error: "Organization not found" }, {
                    status: 404,
                });

            default:
                return NextResponse.json({ error: "Invalid action" }, {
                    status: 400,
                });
        }
    } catch (error) {
        console.error("Error managing organization:", error);
        return NextResponse.json({ error: "Internal Server Error" }, {
            status: 500,
        });
    }
}

// Storage functions - implement based on your storage solution
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

async function removeOrganizationConfig(orgName: string): Promise<void> {
    // Implement your storage logic here
}

async function listAllRepositories(): Promise<RepositoryConfig[]> {
    // Implement your storage logic here
    return [];
}

async function removeRepositoryConfig(repoFullName: string): Promise<void> {
    // Implement your storage logic here
}

async function syncOrganizationRepositories(orgName: string): Promise<void> {
    // Implement your sync logic here
}
