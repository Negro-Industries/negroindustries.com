import { activityLogService, ActivityLog } from "../supabase";

// Mock the Supabase client
jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(),
    channel: jest.fn(),
  })),
}));

// Import the mocked supabase after mocking
import { supabase } from "../supabase";

describe("activityLogService", () => {
  const mockLog: Omit<ActivityLog, "id" | "created_at" | "updated_at"> = {
    timestamp: "2024-01-01T00:00:00Z",
    event_type: "test_event",
    source: "test_source",
    user_id: "test_user",
    metadata: { test: "data" },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a new activity log successfully", async () => {
      const mockResponse = {
        id: "123",
        ...mockLog,
        created_at: "2024-01-01T00:00:00Z",
      };

      const mockSingle = jest
        .fn()
        .mockResolvedValue({ data: mockResponse, error: null });
      const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = jest.fn().mockReturnValue({ select: mockSelect });

      (supabase.from as jest.Mock).mockReturnValue({ insert: mockInsert });

      const result = await activityLogService.create(mockLog);

      expect(supabase.from).toHaveBeenCalledWith("activity_logs");
      expect(mockInsert).toHaveBeenCalledWith([mockLog]);
      expect(result).toEqual(mockResponse);
    });

    it("should throw an error when creation fails", async () => {
      const mockError = { message: "Database error" };

      const mockSingle = jest
        .fn()
        .mockResolvedValue({ data: null, error: mockError });
      const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = jest.fn().mockReturnValue({ select: mockSelect });

      (supabase.from as jest.Mock).mockReturnValue({ insert: mockInsert });

      await expect(activityLogService.create(mockLog)).rejects.toThrow(
        "Failed to create activity log: Database error"
      );
    });
  });

  describe("getAll", () => {
    it("should fetch all activity logs with default ordering", async () => {
      const mockLogs = [
        { id: "1", ...mockLog },
        { id: "2", ...mockLog },
      ];

      // Mock the entire query chain as a thenable object
      const mockQueryChain = {
        eq: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
        // Make it thenable so it can be awaited
        then: jest.fn((resolve) => resolve({ data: mockLogs, error: null })),
      };

      const mockOrder = jest.fn().mockReturnValue(mockQueryChain);
      const mockSelect = jest.fn().mockReturnValue({ order: mockOrder });

      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      const result = await activityLogService.getAll();

      expect(supabase.from).toHaveBeenCalledWith("activity_logs");
      expect(mockSelect).toHaveBeenCalledWith("*");
      expect(mockOrder).toHaveBeenCalledWith("timestamp", { ascending: false });
      expect(result).toEqual(mockLogs);
    });

    it("should apply filters when provided", async () => {
      const filters = {
        event_type: "test_event",
        source: "test_source",
        limit: 10,
      };

      const mockLogs = [{ id: "1", ...mockLog }];

      // Mock the query chain with filter methods
      const mockQueryChain = {
        eq: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
        then: jest.fn((resolve) => resolve({ data: mockLogs, error: null })),
      };

      const mockOrder = jest.fn().mockReturnValue(mockQueryChain);
      const mockSelect = jest.fn().mockReturnValue({ order: mockOrder });

      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      const result = await activityLogService.getAll(filters);

      expect(mockQueryChain.eq).toHaveBeenCalledWith(
        "event_type",
        "test_event"
      );
      expect(mockQueryChain.eq).toHaveBeenCalledWith("source", "test_source");
      expect(mockQueryChain.limit).toHaveBeenCalledWith(10);
      expect(result).toEqual(mockLogs);
    });
  });

  describe("getById", () => {
    it("should fetch a single activity log by ID", async () => {
      const mockLogWithId = { id: "123", ...mockLog };

      const mockSingle = jest
        .fn()
        .mockResolvedValue({ data: mockLogWithId, error: null });
      const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });

      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      const result = await activityLogService.getById("123");

      expect(supabase.from).toHaveBeenCalledWith("activity_logs");
      expect(mockEq).toHaveBeenCalledWith("id", "123");
      expect(result).toEqual(mockLogWithId);
    });
  });

  describe("update", () => {
    it("should update an activity log successfully", async () => {
      const updates = { event_type: "updated_event" };
      const mockUpdatedLog = { id: "123", ...mockLog, ...updates };

      const mockSingle = jest
        .fn()
        .mockResolvedValue({ data: mockUpdatedLog, error: null });
      const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
      const mockEq = jest.fn().mockReturnValue({ select: mockSelect });
      const mockUpdate = jest.fn().mockReturnValue({ eq: mockEq });

      (supabase.from as jest.Mock).mockReturnValue({ update: mockUpdate });

      const result = await activityLogService.update("123", updates);

      expect(mockUpdate).toHaveBeenCalledWith(updates);
      expect(mockEq).toHaveBeenCalledWith("id", "123");
      expect(result).toEqual(mockUpdatedLog);
    });
  });

  describe("delete", () => {
    it("should delete an activity log successfully", async () => {
      const mockEq = jest.fn().mockResolvedValue({ error: null });
      const mockDelete = jest.fn().mockReturnValue({ eq: mockEq });

      (supabase.from as jest.Mock).mockReturnValue({ delete: mockDelete });

      const result = await activityLogService.delete("123");

      expect(mockDelete).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith("id", "123");
      expect(result).toBe(true);
    });
  });
});
