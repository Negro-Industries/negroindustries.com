import { NextRequest, NextResponse } from "next/server";

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
            owner: string;
            repo: string;
        };

        const repoFullName = `${body.owner}/${body.repo}`;
        const existingConfig = await getRepositoryConfig();

        switch (body.action) {
            case "add":
                await updateRepositoryConfig();
                return NextResponse.json({
                    message: `Repository ${repoFullName} added successfully`,
                });

            case "remove":
                await removeRepositoryConfig();
                return NextResponse.json({
                    message: `Repository ${repoFullName} removed successfully`,
                });

            case "enable":
                if (existingConfig) {
                    await updateRepositoryConfig();
                    return NextResponse.json({
                        message:
                            `Repository ${repoFullName} enabled successfully`,
                    });
                }
                return NextResponse.json({ error: "Repository not found" }, {
                    status: 404,
                });

            case "disable":
                if (existingConfig) {
                    await updateRepositoryConfig();
                    return NextResponse.json({
                        message:
                            `Repository ${repoFullName} disabled successfully`,
                    });
                }
                return NextResponse.json({ error: "Repository not found" }, {
                    status: 404,
                });

            default:
                return NextResponse.json({ error: "Invalid action" }, {
                    status: 400,
                });
        }
    } catch (error) {
        console.error("Error managing repository:", error);
        return NextResponse.json({ error: "Internal Server Error" }, {
            status: 500,
        });
    }
}

// Storage functions - implement based on your storage solution
async function getRepositoryConfig(): Promise<RepositoryConfig | null> {
    // Implement your storage logic here
    // This could be a database query, Redis get, etc.
    return null;
}

async function updateRepositoryConfig(): Promise<void> {
    // Implement your storage logic here
    // This could be a database insert/update, Redis set, etc.
}

async function removeRepositoryConfig(): Promise<void> {
    // Implement your storage logic here
    // This could be a database delete, Redis del, etc.
}
