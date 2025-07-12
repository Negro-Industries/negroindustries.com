import { createClient } from "@/lib/utils/supabase/server";
import {
    CreateGeneratedContentRequest,
    GeneratedContent,
    GeneratedContentSummary,
} from "@/lib/types/generated-content";

export const generatedContentService = {
    // Create a new generated content entry
    async create(
        request: CreateGeneratedContentRequest,
    ): Promise<GeneratedContent> {
        const supabase = await createClient();

        const contentData: Omit<
            GeneratedContent,
            "id" | "created_at" | "updated_at"
        > = {
            repository_full_name: request.repository,
            commit_sha: request.commitSha,
            commit_message: request.commitMessage,
            content_type: "changelog_analysis",

            // Blog post content
            blog_title: request.blogPost.title,
            blog_description: request.blogPost.description,
            blog_body: request.blogPost.body,
            blog_tags: request.blogPost.tags,

            // Social media content
            twitter_content: request.socialMedia.twitter,
            linkedin_content: request.socialMedia.linkedin,
            facebook_content: request.socialMedia.facebook,

            // Telegram summary
            telegram_summary: request.telegramSummary,

            // Metadata
            source_diff: request.sourceDiff,
            generation_model: request.generationModel,
            generation_timestamp: new Date().toISOString(),
        };

        const { data, error } = await supabase
            .from("generated_content")
            .insert([contentData])
            .select()
            .single();

        if (error) {
            console.error("Failed to create generated content:", error);
            throw new Error(
                `Failed to create generated content: ${error.message}`,
            );
        }

        return data;
    },

    // Get all generated content with optional filtering
    async getAll(filters?: {
        repository?: string;
        content_type?: string;
        limit?: number;
        offset?: number;
    }): Promise<GeneratedContent[]> {
        const supabase = await createClient();

        let query = supabase
            .from("generated_content")
            .select("*")
            .order("generation_timestamp", { ascending: false });

        if (filters?.repository) {
            query = query.eq("repository_full_name", filters.repository);
        }

        if (filters?.content_type) {
            query = query.eq("content_type", filters.content_type);
        }

        if (filters?.limit) {
            query = query.limit(filters.limit);
        }

        if (filters?.offset) {
            query = query.range(
                filters.offset,
                filters.offset + (filters.limit || 10) - 1,
            );
        }

        const { data, error } = await query;

        if (error) {
            console.error("Failed to fetch generated content:", error);
            throw new Error(
                `Failed to fetch generated content: ${error.message}`,
            );
        }

        return data || [];
    },

    // Get content summary view
    async getSummary(filters?: {
        repository?: string;
        limit?: number;
        offset?: number;
    }): Promise<GeneratedContentSummary[]> {
        const supabase = await createClient();

        let query = supabase
            .from("generated_content_summary")
            .select("*");

        if (filters?.repository) {
            query = query.eq("repository_full_name", filters.repository);
        }

        if (filters?.limit) {
            query = query.limit(filters.limit);
        }

        if (filters?.offset) {
            query = query.range(
                filters.offset,
                filters.offset + (filters.limit || 10) - 1,
            );
        }

        const { data, error } = await query;

        if (error) {
            console.error("Failed to fetch generated content summary:", error);
            throw new Error(
                `Failed to fetch generated content summary: ${error.message}`,
            );
        }

        return data || [];
    },

    // Get a single generated content entry by ID
    async getById(id: string): Promise<GeneratedContent | null> {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("generated_content")
            .select("*")
            .eq("id", id)
            .single();

        if (error) {
            if (error.code === "PGRST116") {
                return null; // Not found
            }
            console.error("Failed to fetch generated content by ID:", error);
            throw new Error(
                `Failed to fetch generated content: ${error.message}`,
            );
        }

        return data;
    },

    // Get content by repository and commit SHA
    async getByRepositoryAndCommit(
        repository: string,
        commitSha: string,
    ): Promise<GeneratedContent | null> {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("generated_content")
            .select("*")
            .eq("repository_full_name", repository)
            .eq("commit_sha", commitSha)
            .single();

        if (error) {
            if (error.code === "PGRST116") {
                return null; // Not found
            }
            console.error(
                "Failed to fetch generated content by repository and commit:",
                error,
            );
            throw new Error(
                `Failed to fetch generated content: ${error.message}`,
            );
        }

        return data;
    },

    // Update generated content
    async update(
        id: string,
        updates: Partial<GeneratedContent>,
    ): Promise<GeneratedContent> {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("generated_content")
            .update(updates)
            .eq("id", id)
            .select()
            .single();

        if (error) {
            console.error("Failed to update generated content:", error);
            throw new Error(
                `Failed to update generated content: ${error.message}`,
            );
        }

        return data;
    },

    // Delete generated content
    async delete(id: string): Promise<boolean> {
        const supabase = await createClient();

        const { error } = await supabase
            .from("generated_content")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Failed to delete generated content:", error);
            throw new Error(
                `Failed to delete generated content: ${error.message}`,
            );
        }

        return true;
    },

    // Get recent content for a repository
    async getRecentByRepository(
        repository: string,
        limit: number = 5,
    ): Promise<GeneratedContent[]> {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("generated_content")
            .select("*")
            .eq("repository_full_name", repository)
            .order("generation_timestamp", { ascending: false })
            .limit(limit);

        if (error) {
            console.error("Failed to fetch recent generated content:", error);
            throw new Error(
                `Failed to fetch recent generated content: ${error.message}`,
            );
        }

        return data || [];
    },

    // Get content statistics
    async getStats(): Promise<{
        total: number;
        repositories: number;
        recent: number;
    }> {
        const supabase = await createClient();

        // Get total count
        const { count: totalCount, error: totalError } = await supabase
            .from("generated_content")
            .select("*", { count: "exact", head: true });

        if (totalError) {
            console.error("Failed to fetch total content count:", totalError);
            throw new Error(
                `Failed to fetch content statistics: ${totalError.message}`,
            );
        }

        // Get unique repositories count
        const { data: repoData, error: repoError } = await supabase
            .from("generated_content")
            .select("repository_full_name")
            .order("repository_full_name");

        if (repoError) {
            console.error("Failed to fetch repository count:", repoError);
            throw new Error(
                `Failed to fetch content statistics: ${repoError.message}`,
            );
        }

        const uniqueRepos = new Set(
            repoData?.map((item) => item.repository_full_name) || [],
        );

        // Get recent count (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { count: recentCount, error: recentError } = await supabase
            .from("generated_content")
            .select("*", { count: "exact", head: true })
            .gte("generation_timestamp", sevenDaysAgo.toISOString());

        if (recentError) {
            console.error("Failed to fetch recent content count:", recentError);
            throw new Error(
                `Failed to fetch content statistics: ${recentError.message}`,
            );
        }

        return {
            total: totalCount || 0,
            repositories: uniqueRepos.size,
            recent: recentCount || 0,
        };
    },
};
