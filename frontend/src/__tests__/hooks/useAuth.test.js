/**
 * Unit tests for useAuth hook
 * 
 * Tests cover:
 * - Local login (success, failure)
 * - Local registration (success, duplicate email)
 * - Authentication check
 * - Logout
 * - State management
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import authService from '../../Services/auth';
import useStore from '../../hooks/useStore';

const mockNavigate = vi.fn();

// Mock dependencies
vi.mock('../../Services/auth');
vi.mock('../../hooks/useStore');
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/', search: '', key: '' }),
  };
});

describe('useAuth', () => {
  const mockSetUser = vi.fn();
  const mockSetUiState = vi.fn();
  const mockLogoutFromStore = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    
    // Mock useStore
    useStore.mockReturnValue({
      user: null,
      setUser: mockSetUser,
      setUiState: mockSetUiState,
      logout: mockLogoutFromStore,
      accessToken: null,
    });
  });

  const wrapper = ({ children }) => {
    return React.createElement(BrowserRouter, null, children);
  };

  describe('localLogin', () => {
    it('should successfully login with valid credentials', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        fullName: 'Test User',
        role: 'USER',
      };

      authService.localLogin.mockResolvedValue({
        status: 200,
        data: {
          user: mockUser,
          accessToken: 'mock-token',
        },
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Wait for initial checkAuth to complete
      await waitFor(() => {
        expect(authService.isAuthenticated).toHaveBeenCalled();
      });

      // Clear mocks from checkAuth
      mockSetUser.mockClear();

      let loginResult;
      await act(async () => {
        loginResult = await result.current.localLogin('test@example.com', 'password123');
      });

      expect(authService.localLogin).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(mockSetUser).toHaveBeenCalledWith({
        user: mockUser,
        accessToken: 'mock-token',
      });
      expect(loginResult).toEqual(mockUser);
    });

    it('should handle login failure', async () => {
      authService.localLogin.mockRejectedValue({
        response: {
          status: 400,
          data: { error: 'Invalid credentials' },
        },
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Wait for the initial checkAuth to complete (from useEffect)
      await waitFor(() => {
        expect(authService.isAuthenticated).toHaveBeenCalled();
      });

      // Clear the mock calls from checkAuth
      mockSetUser.mockClear();

      await act(async () => {
        await expect(
          result.current.localLogin('test@example.com', 'wrongpassword')
        ).rejects.toBeDefined();
      });

      // setUser should not be called for login failure (only checkAuth calls it)
      expect(mockSetUser).not.toHaveBeenCalled();
    });

    it('should set user state to null on failed login', async () => {
      authService.localLogin.mockResolvedValue({
        status: 400,
        data: { error: 'Login failed' },
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Wait for initial checkAuth to complete
      await waitFor(() => {
        expect(authService.isAuthenticated).toHaveBeenCalled();
      });

      let loginResult;
      await act(async () => {
        loginResult = await result.current.localLogin('test@example.com', 'wrongpassword');
      });

      expect(loginResult).toBeNull();
    });
  });

  describe('localRegister', () => {
    it('should successfully register a new user', async () => {
      const mockUser = {
        id: 'user-new',
        email: 'newuser@example.com',
        fullName: 'New User',
        role: 'USER',
      };

      authService.localRegister.mockResolvedValue({
        status: 200,
        data: {
          user: mockUser,
          accessToken: 'mock-token',
        },
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Wait for initial checkAuth to complete
      await waitFor(() => {
        expect(authService.isAuthenticated).toHaveBeenCalled();
      });

      await act(async () => {
        await result.current.localRegister(
          'New User',
          'newuser@example.com',
          'password123',
          '1234567890'
        );
      });

      expect(authService.localRegister).toHaveBeenCalledWith(
        'New User',
        'password123',
        'newuser@example.com',
        '1234567890'
      );
    });

    it('should handle registration failure', async () => {
      authService.localRegister.mockRejectedValue({
        response: {
          status: 400,
          data: { error: 'User already exists' },
        },
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Wait for initial checkAuth to complete
      await waitFor(() => {
        expect(authService.isAuthenticated).toHaveBeenCalled();
      });

      await act(async () => {
        await expect(
          result.current.localRegister(
            'New User',
            'existing@example.com',
            'password123',
            '1234567890'
          )
        ).rejects.toBeDefined();
      });
    });
  });

  describe('checkAuth', () => {
    it('should check authentication status successfully', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        fullName: 'Test User',
      };

      authService.isAuthenticated.mockResolvedValue({
        data: {
          user: mockUser,
          accessToken: 'mock-token',
        },
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(authService.isAuthenticated).toHaveBeenCalled();
      await waitFor(() => {
        expect(mockSetUser).toHaveBeenCalled();
      });
    });

    it('should handle authentication check failure', async () => {
      authService.isAuthenticated.mockRejectedValue({
        response: {
          status: 401,
        },
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await waitFor(() => {
        expect(mockSetUser).toHaveBeenCalledWith(null);
        expect(mockLogoutFromStore).toHaveBeenCalled();
      });
    });
  });

  describe('logout', () => {
    it('should successfully logout user', async () => {
      authService.logout.mockResolvedValue({ status: 200 });

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Wait for initial checkAuth to complete
      await waitFor(() => {
        expect(authService.isAuthenticated).toHaveBeenCalled();
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(authService.logout).toHaveBeenCalled();
      expect(mockSetUser).toHaveBeenCalledWith(null);
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
      });
    });

    it('should handle logout errors gracefully', async () => {
      authService.logout.mockRejectedValue(new Error('Logout failed'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Wait for initial checkAuth to complete
      await waitFor(() => {
        expect(authService.isAuthenticated).toHaveBeenCalled();
      });

      await act(async () => {
        await result.current.logout();
      });

      // Should still clear user state even on error
      await waitFor(() => {
        expect(mockSetUser).toHaveBeenCalledWith(null);
      });
    });
  });

  describe('isAuthenticated', () => {
    it('should check authentication status', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };

      authService.isAuthenticated.mockResolvedValue({
        data: {
          user: mockUser,
          accessToken: 'mock-token',
        },
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Wait for initial checkAuth to complete
      await waitFor(() => {
        expect(authService.isAuthenticated).toHaveBeenCalled();
      });

      // Clear the mock to test the explicit call
      authService.isAuthenticated.mockClear();

      let authResult;
      await act(async () => {
        authResult = await result.current.isAuthenticated();
      });

      expect(authResult).toEqual({
        user: mockUser,
        accessToken: 'mock-token',
      });
    });
  });
});

