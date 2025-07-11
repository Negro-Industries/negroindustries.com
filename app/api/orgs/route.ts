import { NextRequest, NextResponse } from 'next/server';

interface OrganizationConfig {
  name: string;
  enabled: boolean;
  includePrivate: boolean;
  excludeRepos: string[];
  lastSyncTime?: string;
}

export async function GET(request: NextRequest) {
  try {
    const orgs = await listAllOrganizations();
    return NextResponse.json(orgs, {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error listing organizations:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Storage function - implement based on your storage solution
async function listAllOrganizations(): Promise<OrganizationConfig[]> {
  // Implement your storage logic here
  // This could be a database query, Redis scan, etc.
  return [];
} 