import {
    OrganizationConfig,
    RepositoryConfig,
} from "@/types/github-monitor";

// Simple in-memory storage - replace with your preferred storage solution
// (database, Redis, file system, etc.)
const repositories = new Map<string, RepositoryConfig>();
const organizations = new Map<string, OrganizationConfig>();

export async function getRepositoryConfig(
    repoFullName: string,
): Promise<RepositoryConfig | null> {
    return repositories.get(repoFullName) || null;
}

export async function updateRepositoryConfig(
    repoFullName: string,
    config: RepositoryConfig,
): Promise<void> {
    repositories.set(repoFullName, config);
}

export async function removeRepositoryConfig(
    repoFullName: string,
): Promise<void> {
    repositories.delete(repoFullName);
}

export async function listAllRepositories(): Promise<RepositoryConfig[]> {
    return Array.from(repositories.values());
}

export async function getOrganizationConfig(
    orgName: string,
): Promise<OrganizationConfig | null> {
    return organizations.get(orgName) || null;
}

export async function updateOrganizationConfig(
    orgName: string,
    config: OrganizationConfig,
): Promise<void> {
    organizations.set(orgName, config);
}

export async function removeOrganizationConfig(orgName: string): Promise<void> {
    organizations.delete(orgName);
}

export async function listAllOrganizations(): Promise<OrganizationConfig[]> {
    return Array.from(organizations.values());
}
