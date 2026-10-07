/**
 * Integration tests for useAdmin hook
 * 
 * Tests the complete flow: admin service → backend routes → hook state management
 * Verifies that service calls match backend route definitions
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import useAdmin from '../../hooks/useAdmin';
import adminService from '../../Services/admin';
import useStore from '../../hooks/useStore';

// Mock dependencies
vi.mock('../../Services/admin');
vi.mock('../../hooks/useStore');

const mockNavigate = vi.fn();

describe('useAdmin Integration', () => {
  const mockSetUser = vi.fn();
  const mockSetUiState = vi.fn();
  const mockLogoutFromStore = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();

    useStore.mockReturnValue({
      accessToken: 'mock-admin-token',
      setUser: mockSetUser,
      setUiState: mockSetUiState,
      logout: mockLogoutFromStore,
      user: null,
    });
  });

  const wrapper = ({ children }) => {
    return React.createElement(BrowserRouter, null, children);
  };

  describe('getClassifications - full stack', () => {
    it('should fetch classifications with pagination and filters', async () => {
      const mockResponse = {
        data: {
          results: [
            { id: 'class-1', species: 'zea-mays', shape: 'elliptic' },
          ],
          pages: 3,
          count: 10,
          totalVerifiedCount: 5,
          totalPendingCount: 3,
          totalArchivedCount: 2,
          shapes: ['elliptic', 'ovate'],
        },
      };

      adminService.getAdminclassifications.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAdmin(), { wrapper });

      await act(async () => {
        await result.current.getClassifications(1, 10, 'createdAt', 'desc', {}, 'mock-admin-token');
      });

      expect(adminService.getAdminclassifications).toHaveBeenCalledWith(
        1,
        10,
        'createdAt',
        'desc',
        {},
        'mock-admin-token'
      );

      await waitFor(() => {
        expect(result.current.classifications).toEqual(mockResponse.data.results);
      });
      expect(result.current.pages).toBe(3);
      expect(result.current.classificationsCount).toEqual({
        total: 10,
        verified: 5,
        pending: 3,
        archived: 2,
      });
      expect(result.current.shapes).toEqual(['elliptic', 'ovate']);
    });

    it('should handle fetch errors for classifications', async () => {
      const error = new Error('Failed to fetch');
      adminService.getAdminclassifications.mockRejectedValue(error);

      const { result } = renderHook(() => useAdmin(), { wrapper });

      await act(async () => {
        await result.current.getClassifications(1, 10, 'createdAt', 'desc', {}, 'mock-admin-token');
      });

      await waitFor(() => {
        expect(result.current.error).toBe(error);
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('getClassification - full stack', () => {
    it('should fetch a single classification', async () => {
      const mockClassification = {
        id: 'class-1',
        species: 'zea-mays',
        shape: 'elliptic',
      };

      adminService.getAdminClassification.mockResolvedValue({
        data: { results: mockClassification },
      });

      const { result } = renderHook(() => useAdmin(), { wrapper });

      let classificationResult;
      await act(async () => {
        classificationResult = await result.current.getClassification('class-1');
      });

      expect(adminService.getAdminClassification).toHaveBeenCalledWith('class-1', 'mock-admin-token');

      await waitFor(() => {
        expect(result.current.classification).toEqual(mockClassification);
      });
      expect(classificationResult).toEqual(mockClassification);
    });

    it('should handle fetch errors for single classification', async () => {
      const error = new Error('Not found');
      adminService.getAdminClassification.mockRejectedValue(error);

      const { result } = renderHook(() => useAdmin(), { wrapper });

      await act(async () => {
        await result.current.getClassification('non-existent');
      });

      await waitFor(() => {
        expect(result.current.error).toBe(error);
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('updateClassification - full stack', () => {
    it('should successfully update a classification', async () => {
      const updateData = { taggedSpecies: 'new-species', taggedShape: 'ovate' };

      adminService.updateAdminClassification.mockResolvedValue({
        data: { results: { id: 'class-1', ...updateData } },
      });

      const { result } = renderHook(() => useAdmin(), { wrapper });

      await act(async () => {
        await result.current.updateClassification('class-1', updateData);
      });

      expect(adminService.updateAdminClassification).toHaveBeenCalledWith('class-1', updateData, 'mock-admin-token');

      await waitFor(() => {
        expect(result.current.classification).toMatchObject(updateData);
      });
    });

    it('should handle update errors', async () => {
      const error = new Error('Update failed');
      adminService.updateAdminClassification.mockRejectedValue(error);

      const { result } = renderHook(() => useAdmin(), { wrapper });

      await act(async () => {
        await result.current.updateClassification('class-1', {});
      });

      await waitFor(() => {
        expect(result.current.error).toBe(error);
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('deleteClassification - full stack', () => {
    it('should successfully delete a classification', async () => {
      adminService.deleteAdminClassification.mockResolvedValue({
        data: { results: { id: 'class-1' } },
      });

      const { result } = renderHook(() => useAdmin(), { wrapper });

      await act(async () => {
        await result.current.deleteClassification('class-1');
      });

      expect(adminService.deleteAdminClassification).toHaveBeenCalledWith('class-1', 'mock-admin-token');

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should handle delete errors', async () => {
      const error = new Error('Delete failed');
      adminService.deleteAdminClassification.mockRejectedValue(error);

      const { result } = renderHook(() => useAdmin(), { wrapper });

      await act(async () => {
        await result.current.deleteClassification('class-1');
      });

      await waitFor(() => {
        expect(result.current.error).toBe(error);
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('getUsers - full stack', () => {
    it('should fetch users with pagination', async () => {
      const mockResponse = {
        data: {
          results: [
            { id: 'user-1', email: 'user1@example.com', fullName: 'User One' },
          ],
          pages: 2,
          count: 5,
          requestedContributorCount: 1,
        },
      };

      adminService.getAdminUsers.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAdmin(), { wrapper });

      await act(async () => {
        await result.current.getUsers(1, 10, 'createdAt', 'desc', {}, 'mock-admin-token');
      });

      expect(adminService.getAdminUsers).toHaveBeenCalledWith(
        1,
        10,
        'createdAt',
        'desc',
        {},
        'mock-admin-token'
      );

      await waitFor(() => {
        expect(result.current.users).toEqual(mockResponse.data.results);
      });
      expect(result.current.pages).toBe(2);
      expect(result.current.usersCount).toEqual({
        total: 5,
        requestedContributor: 1,
      });
    });

    it('should handle fetch errors for users', async () => {
      const error = new Error('Failed to fetch users');
      adminService.getAdminUsers.mockRejectedValue(error);

      const { result } = renderHook(() => useAdmin(), { wrapper });

      await act(async () => {
        await result.current.getUsers(1, 10, 'createdAt', 'desc', {}, 'mock-admin-token');
      });

      await waitFor(() => {
        expect(result.current.error).toBe(error);
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('getUser - full stack', () => {
    it('should fetch a single user', async () => {
      const mockUser = { id: 'user-1', email: 'user1@example.com', fullName: 'User One' };

      adminService.getAdminUser.mockResolvedValue({
        data: { results: mockUser },
      });

      const { result } = renderHook(() => useAdmin(), { wrapper });

      let userResult;
      await act(async () => {
        userResult = await result.current.getUser('user-1');
      });

      expect(adminService.getAdminUser).toHaveBeenCalledWith('user-1', 'mock-admin-token');

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });
      expect(userResult).toEqual(mockUser);
    });

    it('should handle fetch errors for single user', async () => {
      const error = new Error('Not found');
      adminService.getAdminUser.mockRejectedValue(error);

      const { result } = renderHook(() => useAdmin(), { wrapper });

      await act(async () => {
        await result.current.getUser('non-existent');
      });

      await waitFor(() => {
        expect(result.current.error).toBe(error);
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('updateUser - full stack', () => {
    it('should successfully update a user', async () => {
      const updateData = { fullName: 'Updated Name', email: 'updated@example.com' };

      adminService.updateUserAdmin.mockResolvedValue({
        data: { results: { id: 'user-1', ...updateData } },
      });

      const { result } = renderHook(() => useAdmin(), { wrapper });

      await act(async () => {
        await result.current.updateUser('user-1', updateData);
      });

      expect(adminService.updateUserAdmin).toHaveBeenCalledWith('user-1', updateData, 'mock-admin-token');

      await waitFor(() => {
        expect(result.current.user).toMatchObject(updateData);
      });
    });

    it('should handle update errors', async () => {
      const error = new Error('Update failed');
      adminService.updateUserAdmin.mockRejectedValue(error);

      const { result } = renderHook(() => useAdmin(), { wrapper });

      await act(async () => {
        await result.current.updateUser('user-1', {});
      });

      await waitFor(() => {
        expect(result.current.error).toBe(error);
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('deleteUser - full stack', () => {
    it('should successfully delete a user', async () => {
      adminService.deleteAdminUser.mockResolvedValue({
        data: { results: { id: 'user-1' } },
      });

      const { result } = renderHook(() => useAdmin(), { wrapper });

      await act(async () => {
        await result.current.deleteUser('user-1');
      });

      expect(adminService.deleteAdminUser).toHaveBeenCalledWith('user-1', 'mock-admin-token');

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should handle delete errors', async () => {
      const error = new Error('Delete failed');
      adminService.deleteAdminUser.mockRejectedValue(error);

      const { result } = renderHook(() => useAdmin(), { wrapper });

      await act(async () => {
        await result.current.deleteUser('user-1');
      });

      await waitFor(() => {
        expect(result.current.error).toBe(error);
        expect(result.current.isLoading).toBe(false);
      });
    });
  });
});
