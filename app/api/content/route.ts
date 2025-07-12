import { NextRequest, NextResponse } from "next/server";
import { generatedContentService } from "@/lib/services/generated-content";
import { CreateGeneratedContentRequest } from "@/lib/types/generated-content";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get("limit") || "10");
        const offset = parseInt(searchParams.get("offset") || "0");
        const repository = searchParams.get("repository") || undefined;

        // Get content from database
        const content = await generatedContentService.getAll({
            repository,
            limit,
            offset,
        });

        // Get statistics
        const stats = await generatedContentService.getStats();

        return NextResponse.json({
            content,
            stats,
            pagination: {
                limit,
                offset,
                hasMore: content.length === limit,
            },
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

        // Validate required fields
        if (!body.repository || !body.blogPost || !body.socialMedia) {
            return NextResponse.json(
                {
                    error:
                        "Missing required fields: repository, blogPost, socialMedia",
                },
                { status: 400 },
            );
        }

        // Create the content request
        const contentRequest: CreateGeneratedContentRequest = {
            repository: body.repository,
            commitSha: body.commitSha,
            commitMessage: body.commitMessage,
            blogPost: {
                title: body.blogPost.title,
                description: body.blogPost.description,
                body: body.blogPost.body,
                tags: body.blogPost.tags || [],
            },
            socialMedia: {
                twitter: body.socialMedia.twitter,
                linkedin: body.socialMedia.linkedin,
                facebook: body.socialMedia.facebook,
            },
            telegramSummary: body.telegramSummary || "",
            sourceDiff: body.sourceDiff,
            generationModel: body.generationModel,
        };

        // Store in database
        const storedContent = await generatedContentService.create(
            contentRequest,
        );

        return NextResponse.json({
            message: "Content stored successfully",
            id: storedContent.id,
            content: storedContent,
        });
    } catch (error) {
        console.error("Error storing content:", error);
        return NextResponse.json(
            { error: "Failed to store content" },
            { status: 500 },
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { error: "Missing required parameter: id" },
                { status: 400 },
            );
        }

        // Delete from database
        await generatedContentService.delete(id);

        return NextResponse.json({
            message: "Content deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting content:", error);
        return NextResponse.json(
            { error: "Failed to delete content" },
            { status: 500 },
        );
    }
}
