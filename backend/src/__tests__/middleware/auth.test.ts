/**
 * Unit tests for Authentication Middleware
 * 
 * Tests cover:
 * - Token extraction from Authorization header
 * - Token validation
 * - User extraction from token
 * - Error handling for missing/invalid tokens
 */

import { describe, it, expect, beforeEach, mock, spyOn } from "bun:test";
import { createMockRequest, createMockResponse, createMockNextFunction } from "../helpers/mockRequest";
import * as jwtUtils from "../../utils/jwt";
import { authenticateToken } from "../../middleware/auth";

// Create mock function
const mockVerifyAccessToken = mock(() => ({}));

// Spy on the module function
spyOn(jwtUtils, "verifyAccessToken").mockImplementation(mockVerifyAccessToken);

describe("Authentication Middleware", () => {
  let mockReq: any;
  let mockRes: any;
  let mockNext: any;

  beforeEach(() => {
    mockReq = createMockRequest();
    mockRes = createMockResponse();
    mockNext = createMockNextFunction();
    mockVerifyAccessToken.mockClear();
    mockRes.status.mockClear();
    mockRes.json.mockClear();
    mockNext.mockClear();
  });

  it("should call next() when valid token is provided", () => {
    const token = "valid-access-token";
    mockReq.headers = {
      authorization: `Bearer ${token}`,
    };

    mockVerifyAccessToken.mockReturnValue({
      id: "user-123",
      email: "test@example.com",
    });

    authenticateToken(mockReq, mockRes, mockNext);

    expect(mockVerifyAccessToken).toHaveBeenCalledWith(token);
    expect(mockReq.user).toEqual({
      id: "user-123",
      email: "test@example.com",
    });
    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  it("should return 401 when no token is provided", () => {
    mockReq.headers = {};

    authenticateToken(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "No token provided",
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should return 401 when Authorization header is missing", () => {
    mockReq.headers = {};

    authenticateToken(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "No token provided",
    });
  });

  it("should return 401 when token format is invalid", () => {
    mockReq.headers = {
      authorization: "InvalidFormat token",
    };

    // The middleware extracts token as the second part after split
    // So "InvalidFormat token" would extract "token" and try to verify it
    // If verification fails, it should return 401 with "Invalid or expired token"
    mockVerifyAccessToken.mockImplementation(() => {
      throw new Error("Invalid token");
    });

    authenticateToken(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Invalid or expired token",
    });
  });

  it("should return 401 when token is invalid or expired", () => {
    const token = "invalid-token";
    mockReq.headers = {
      authorization: `Bearer ${token}`,
    };

    mockVerifyAccessToken.mockImplementation(() => {
      throw new Error("Invalid token");
    });

    authenticateToken(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Invalid or expired token",
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should extract token correctly from Bearer format", () => {
    const token = "valid-token-123";
    mockReq.headers = {
      authorization: `Bearer ${token}`,
    };

    mockVerifyAccessToken.mockReturnValue({ id: "user-123" });

    authenticateToken(mockReq, mockRes, mockNext);

    expect(mockVerifyAccessToken).toHaveBeenCalledWith(token);
  });
});

