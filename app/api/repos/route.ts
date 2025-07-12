import { NextResponse } from "next/server";

interface RepositoryConfig {
    owner: string;
    repo: string;
    enabled: boolean;
    lastCommitSha?: string;
    fromOrg?: boolean;
}

export async function GET() {
    try {
        const repos = await listAllRepositories();
        return NextResponse.json(repos, {
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error listing repositories:", error);
        return NextResponse.json({ error: "Internal Server Error" }, {
            status: 500,
        });
    }
}

// Storage function - implement based on your storage solution
async function listAllRepositories(): Promise<RepositoryConfig[]> {
    // Implement your storage logic here
    // This could be a database query, Redis scan, etc.
    return [];
}
