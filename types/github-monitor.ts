export interface GitHubWebhookPayload {
    action: string;
    repository: {
        id: number;
        name: string;
        full_name: string;
        private?: boolean;
        owner: {
            login: string;
        };
    };
    commits?: Array<{
        id: string;
        message: string;
        added: string[];
        removed: string[];
        modified: string[];
    }>;
    head_commit?: {
        id: string;
        message: string;
        added: string[];
        removed: string[];
        modified: string[];
    };
}

export interface RepositoryConfig {
    owner: string;
    repo: string;
    enabled: boolean;
    lastCommitSha?: string;
    fromOrg?: boolean;
}

export interface OrganizationConfig {
    name: string;
    enabled: boolean;
    includePrivate: boolean;
    excludeRepos: string[];
    lastSyncTime?: string;
}

export interface GitHubRepository {
    id: number;
    name: string;
    full_name: string;
    private?: boolean;
    owner: {
        login: string;
    };
}

export interface TelegramUpdate {
    update_id: number;
    message?: {
        message_id: number;
        from: {
            id: number;
            is_bot: boolean;
            first_name: string;
            username?: string;
        };
        chat: {
            id: number;
            first_name?: string;
            username?: string;
            type: string;
        };
        date: number;
        text?: string;
    };
}
