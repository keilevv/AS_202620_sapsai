/**
 * Helper functions to create mock Express Request and Response objects
 */

import { Request, Response } from "express";
import { mock } from "bun:test";

export function createMockRequest(overrides: Partial<Request> = {}): Partial<Request> {
  return {
    body: {},
    params: {},
    query: {},
    headers: {},
    user: undefined,
    ...overrides,
  } as Partial<Request>;
}

export function createMockResponse(): Partial<Response> {
  const mockStatus = mock(() => ({} as Response));
  const mockJson = mock(() => ({} as Response));
  const mockSend = mock(() => ({} as Response));
  const mockRedirect = mock(() => ({} as Response));
  
  const res: any = {
    status: mockStatus,
    json: mockJson,
    send: mockSend,
    redirect: mockRedirect,
  };
  
  // Make status return 'this' for chaining
  mockStatus.mockImplementation(() => res);
  
  return res;
}

export function createMockNextFunction() {
  return mock(() => {});
}

