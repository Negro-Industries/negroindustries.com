import { NextRequest, NextResponse } from "next/server";
import { generatedContentService } from "@/lib/services/generated-content";

export async function GET(
    request: NextRequest,
    { params }: { params: { repository: string } },
) {
    try {
        const { repository } = await params;
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get("limit") || "10");
        const offset = parseInt(searchParams.get("offset") || "0");

        if (!repository) {
            return NextResponse.json(
                { error: "Missing required parameter: repository" },
                { status: 400 },
            );
        }

        // Decode the repository name (in case it contains special characters)
        const decodedRepository = decodeURIComponent(repository);

        // Get content from database
        const content = await generatedContentService.getAll({
            repository: decodedRepository,
            limit,
            offset,
        });

        // Get recent content for this repository
        const recentContent = await generatedContentService
            .getRecentByRepository(
                decodedRepository,
                5,
            );

        return NextResponse.json({
            repository: decodedRepository,
            content,
            recent: recentContent,
            pagination: {
                limit,
                offset,
                hasMore: content.length === limit,
            },
        });
    } catch (error) {
        console.error("Error fetching content by repository:", error);
        return NextResponse.json(
            { error: "Failed to fetch content" },
            { status: 500 },
        );
    }
}
