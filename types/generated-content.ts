export interface GeneratedContent {
    id?: string;
    repository_full_name: string;
    commit_sha?: string;
    commit_message?: string;
    content_type: string;

    // Blog post content
    blog_title: string;
    blog_description: string;
    blog_body: string;
    blog_tags: string[];

    // Social media content
    twitter_content: string;
    linkedin_content: string;
    facebook_content: string;

    // Telegram summary
    telegram_summary: string;

    // Metadata
    source_diff?: string;
    generation_model?: string;
    generation_timestamp?: string;

    // Audit fields
    created_at?: string;
    updated_at?: string;
}

export interface GeneratedContentSummary {
    id: string;
    repository_full_name: string;
    commit_sha?: string;
    blog_title: string;
    blog_description: string;
    tag_count: number;
    content_type: string;
    generation_timestamp: string;
    created_at: string;
}

export interface ContentGeneration {
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
    telegramSummary: string;
}

export interface CreateGeneratedContentRequest {
    repository: string;
    commitSha?: string;
    commitMessage?: string;
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
    telegramSummary: string;
    sourceDiff?: string;
    generationModel?: string;
}
