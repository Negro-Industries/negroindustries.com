import { NextRequest, NextResponse } from "next/server";

// In-memory storage for demo purposes
// In production, you'd want to use a proper database
let contentStore: Array<{
    id: string;
    timestamp: string;
    repository: string;
    blogPost: {
        title: string;
        description: string;
        body: string;
        tags: string[];
    };
    socialMedia: {
        twitter: string;
        linkedin: string;
        facebook: string;
    };
}> = [];

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get("limit") || "10");

        // Return the most recent content entries
        const recentContent = contentStore
            .sort((a, b) =>
                new Date(b.timestamp).getTime() -
                new Date(a.timestamp).getTime()
            )
            .slice(0, limit);

        return NextResponse.json({
            content: recentContent,
            total: contentStore.length,
        });
    } catch (error) {
        console.error("Error fetching content:", error);
        return NextResponse.json(
            { error: "Failed to fetch content" },
            { status: 500 },
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const contentEntry = {
            id: generateId(),
            timestamp: new Date().toISOString(),
            repository: body.repository,
            blogPost: body.blogPost,
            socialMedia: body.socialMedia,
        };

        contentStore.push(contentEntry);

        // Keep only the latest 100 entries to prevent memory issues
        if (contentStore.length > 100) {
            contentStore = contentStore.slice(-100);
        }

        return NextResponse.json({
            message: "Content stored successfully",
            id: contentEntry.id,
        });
    } catch (error) {
        console.error("Error storing content:", error);
        return NextResponse.json(
            { error: "Failed to store content" },
            { status: 500 },
        );
    }
}

function generateId(): string {
    return Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
}
