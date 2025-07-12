import { NextRequest, NextResponse } from "next/server";
import { generatedContentService } from "@/lib/services/generated-content";

export async function GET(
    request: NextRequest,
    props: { params: Promise<{ id: string }> },
) {
    try {
        const params = await props.params;
        const { id } = params;

        if (!id) {
            return NextResponse.json(
                { error: "Missing required parameter: id" },
                { status: 400 },
            );
        }

        // Get content from database
        const content = await generatedContentService.getById(id);

        if (!content) {
            return NextResponse.json(
                { error: "Content not found" },
                { status: 404 },
            );
        }

        return NextResponse.json({
            content,
        });
    } catch (error) {
        console.error("Error fetching content by ID:", error);
        return NextResponse.json(
            { error: "Failed to fetch content" },
            { status: 500 },
        );
    }
}

export async function PUT(
    request: NextRequest,
    props: { params: Promise<{ id: string }> },
) {
    try {
        const params = await props.params;
        const { id } = params;
        const body = await request.json();

        if (!id) {
            return NextResponse.json(
                { error: "Missing required parameter: id" },
                { status: 400 },
            );
        }

        // Update content in database
        const updatedContent = await generatedContentService.update(id, body);

        return NextResponse.json({
            message: "Content updated successfully",
            content: updatedContent,
        });
    } catch (error) {
        console.error("Error updating content:", error);
        return NextResponse.json(
            { error: "Failed to update content" },
            { status: 500 },
        );
    }
}

export async function DELETE(
    request: NextRequest,
    props: { params: Promise<{ id: string }> },
) {
    try {
        const params = await props.params;
        const { id } = params;

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
