import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our activity logs
export interface ActivityLog {
  id?: string;
  timestamp: string;
  event_type: string;
  source: string;
  user_id?: string;
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

// CRUD operations for activity logs
export const activityLogService = {
  // Create a new activity log
  async create(log: Omit<ActivityLog, "id" | "created_at" | "updated_at">) {
    const { data, error } = await supabase
      .from("activity_logs")
      .insert([log])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create activity log: ${error.message}`);
    }

    return data;
  },

  // Get all activity logs with optional filtering
  async getAll(filters?: {
    event_type?: string;
    source?: string;
    user_id?: string;
    limit?: number;
    offset?: number;
  }) {
    let query = supabase
      .from("activity_logs")
      .select("*")
      .order("timestamp", { ascending: false });

    if (filters?.event_type) {
      query = query.eq("event_type", filters.event_type);
    }

    if (filters?.source) {
      query = query.eq("source", filters.source);
    }

    if (filters?.user_id) {
      query = query.eq("user_id", filters.user_id);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(
        filters.offset,
        filters.offset + (filters.limit || 10) - 1
      );
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch activity logs: ${error.message}`);
    }

    return data;
  },

  // Get a single activity log by ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from("activity_logs")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch activity log: ${error.message}`);
    }

    return data;
  },

  // Update an activity log
  async update(id: string, updates: Partial<ActivityLog>) {
    const { data, error } = await supabase
      .from("activity_logs")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update activity log: ${error.message}`);
    }

    return data;
  },

  // Delete an activity log
  async delete(id: string) {
    const { error } = await supabase
      .from("activity_logs")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(`Failed to delete activity log: ${error.message}`);
    }

    return true;
  },
};
