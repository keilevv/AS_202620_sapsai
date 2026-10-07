/**
 * Unit tests for User Controller
 * 
 * Tests cover:
 * - Get user profile (own, admin access, unauthorized)
 * - Update user profile (own, admin, validation)
 * - Contributor status request validation
 */

import { describe, it, expect, beforeEach, afterEach, mock, spyOn } from "bun:test";
import userController from "../../controllers/user";
import { createMockRequest, createMockResponse } from "../helpers/mockRequest";
import { mockUser, mockAdminUser } from "../helpers/testUtils";
import prisma from "../../lib/prisma";
import bcrypt from "bcryptjs";

// Create mock functions
const mockPrismaUser = {
  findUnique: mock(() => Promise.resolve(null)),
  update: mock(() => Promise.resolve(mockUser)),
};

const mockBcryptHash = mock(() => Promise.resolve("hashed_password"));

// Replace Prisma methods
(prisma as any).user = mockPrismaUser;

// Spy on bcrypt
spyOn(bcrypt, "hash").mockImplementation(mockBcryptHash as any);

describe("User Controller", () => {
  let controller: ReturnType<typeof userController>;
  let mockReq: any;
  let mockRes: any;
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    // Suppress console.error during tests to avoid error messages in output
    originalConsoleError = console.error;
    console.error = mock(() => {});

    controller = userController();
    mockReq = createMockRequest();
    mockRes = createMockResponse();
    
    // Clear all mocks
    mockPrismaUser.findUnique.mockClear();
    mockPrismaUser.update.mockClear();
    mockBcryptHash.mockClear();
    mockRes.status.mockClear();
    mockRes.json.mockClear();
  });

  afterEach(() => {
    // Restore console.error
    console.error = originalConsoleError;
  });

  describe("getUser", () => {
    it("should return user profile when accessing own profile", async () => {
      mockReq.params.id = mockUser.id;
      mockReq.user = { id: mockUser.id };

      mockPrismaUser.findUnique.mockResolvedValue(mockUser);

      await controller.getUser(mockReq, mockRes);

      expect(mockPrismaUser.findUnique).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        user: expect.objectContaining({
          email: mockUser.email,
          fullName: mockUser.fullName,
        }),
      });
      const userData = (mockRes.json as any).mock.calls[0][0].user;
      expect(userData).not.toHaveProperty("passwordHash");
    });

    it("should allow admin to access any user profile", async () => {
      mockReq.params.id = mockUser.id;
      mockReq.user = { id: mockAdminUser.id };

      mockPrismaUser.findUnique
        .mockResolvedValueOnce(mockAdminUser) // Acting user
        .mockResolvedValueOnce(mockUser); // Requested user

      await controller.getUser(mockReq, mockRes);

      expect(mockPrismaUser.findUnique).toHaveBeenCalledTimes(2);
      expect(mockRes.json).toHaveBeenCalledWith({
        user: expect.objectContaining({
          email: mockUser.email,
        }),
      });
    });

    it("should return 403 when non-admin tries to access another user", async () => {
      mockReq.params.id = "other-user-id";
      mockReq.user = { id: mockUser.id };

      mockPrismaUser.findUnique.mockResolvedValue(mockUser);

      await controller.getUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ error: "Forbidden" });
    });

    it("should return 404 when user not found", async () => {
      // When accessing own profile, it doesn't check authorization first
      mockReq.params.id = "non-existent-id";
      mockReq.user = { id: "non-existent-id" }; // Same ID, so no authorization check

      mockPrismaUser.findUnique.mockResolvedValue(null); // User not found

      await controller.getUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: "User not found" });
    });

    it("should handle database errors", async () => {
      mockReq.params.id = mockUser.id;
      mockReq.user = { id: mockUser.id };

      // When accessing own profile, only one findUnique call is made
      // Mock to throw error on that call
      mockPrismaUser.findUnique.mockRejectedValue(new Error("Database error"));

      await controller.getUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Internal server error",
      });
    });
  });

  describe("updateUser", () => {
    it("should successfully update own profile", async () => {
      const updateData = {
        fullName: "Updated Name",
        phone: "9876543210",
        email: "updated@example.com",
      };

      mockReq.params.id = mockUser.id;
      mockReq.user = { id: mockUser.id };
      mockReq.body = updateData;

      mockPrismaUser.findUnique.mockResolvedValue(mockUser);
      mockPrismaUser.update.mockResolvedValue({
        ...mockUser,
        ...updateData,
      });

      await controller.updateUser(mockReq, mockRes);

      expect(mockPrismaUser.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: expect.objectContaining(updateData),
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        user: expect.objectContaining(updateData),
      });
    });

    it("should allow admin to update any user", async () => {
      const updateData = {
        fullName: "Updated Name",
        role: "CONTRIBUTOR",
      };

      mockReq.params.id = mockUser.id;
      mockReq.user = { id: mockAdminUser.id };
      mockReq.body = updateData;

      // First call: get user to update (for validation)
      // Second call: get acting user (for authorization check)
      mockPrismaUser.findUnique
        .mockResolvedValueOnce(mockUser) // User to update
        .mockResolvedValueOnce(mockAdminUser); // Acting user (admin)

      mockPrismaUser.update.mockResolvedValue({
        ...mockUser,
        ...updateData,
      });

      await controller.updateUser(mockReq, mockRes);

      expect(mockPrismaUser.update).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalled();
    });

    it("should return 403 when non-admin tries to update another user", async () => {
      mockReq.params.id = "other-user-id";
      mockReq.user = { id: mockUser.id };
      mockReq.body = { fullName: "Updated Name" };

      mockPrismaUser.findUnique.mockResolvedValue(mockUser);

      await controller.updateUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ error: "Forbidden" });
    });

    it("should update password when provided", async () => {
      const newPassword = "newPassword123";
      mockReq.params.id = mockUser.id;
      mockReq.user = { id: mockUser.id };
      mockReq.body = { password: newPassword };

      mockPrismaUser.findUnique.mockResolvedValue(mockUser);
      mockBcryptHash.mockResolvedValue("hashed_new_password");
      mockPrismaUser.update.mockResolvedValue({
        ...mockUser,
        passwordHash: "hashed_new_password",
      });

      await controller.updateUser(mockReq, mockRes);

      expect(mockBcryptHash).toHaveBeenCalledWith(newPassword, 10);
      expect(mockPrismaUser.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: expect.objectContaining({
          passwordHash: "hashed_new_password",
        }),
      });
    });

    it("should validate required fields for contributor status request", async () => {
      mockReq.params.id = mockUser.id;
      mockReq.user = { id: mockUser.id };
      mockReq.body = {
        requestedContributorStatus: true,
        fullName: "Test User",
        email: "test@example.com",
        // Missing required fields
      };

      mockPrismaUser.findUnique.mockResolvedValue(mockUser);

      await controller.updateUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining("Missing required field"),
        })
      );
    });

    it("should return 401 when user is not authenticated", async () => {
      mockReq.params.id = mockUser.id;
      mockReq.user = undefined;
      mockReq.body = { fullName: "Updated Name" };

      await controller.updateUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: "Unauthorized" });
    });

    it("should return 404 when user not found", async () => {
      mockReq.params.id = "non-existent-id";
      mockReq.user = { id: mockUser.id };
      mockReq.body = { fullName: "Updated Name" };

      mockPrismaUser.findUnique.mockResolvedValue(null);

      await controller.updateUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: "User not found" });
    });

    it("should handle database errors", async () => {
      mockReq.params.id = mockUser.id;
      mockReq.user = { id: mockUser.id };
      mockReq.body = { fullName: "Updated Name" };

      // Mock findUnique to succeed, but update to fail
      // The error should be caught by the try-catch in the controller
      mockPrismaUser.findUnique.mockResolvedValue(mockUser);
      mockPrismaUser.update.mockImplementation(() => {
        return Promise.reject(new Error("Database error"));
      });

      await controller.updateUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Internal server error",
      });
    });
  });
});
