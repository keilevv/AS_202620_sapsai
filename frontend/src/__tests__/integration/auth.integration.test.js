/**
 * Integration tests for useAuth hook
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import authService from '../../Services/auth';
import useStore from '../../hooks/useStore';

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

const mockNavigate = vi.fn();

describe('useAuth Integration', () => {
  const mockSetUser = vi.fn();
  const mockSetUiState = vi.fn();
  const mockLogoutFromStore = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    
    useStore.mockReturnValue({
      accessToken: 'mock-token',
      user: null,
      setUser: mockSetUser,
      setUiState: mockSetUiState,
      logout: mockLogoutFromStore,
    });
  });

  const wrapper = ({ children }) => {
    return React.createElement(BrowserRouter, null, children);
  };

  describe('localLogin - full stack', () => {
    it('should successfully login', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };

      authService.localLogin.mockResolvedValue({
        status: 200,
        data: { user: mockUser, accessToken: 'token' },
      });

      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(authService.isAuthenticated).toHaveBeenCalled());
      mockSetUser.mockClear();

      const loginResult = await act(async () => result.current.localLogin('test@example.com', 'pass'));
      expect(authService.localLogin).toHaveBeenCalledWith('test@example.com', 'pass');
      expect(mockSetUser).toHaveBeenCalledWith({ user: mockUser, accessToken: 'token' });
      expect(loginResult).toEqual(mockUser);
    });
  });

  describe('googleLogin - full stack', () => {
    it('should initiate Google OAuth flow', async () => {
      const mockUser = { id: 'user-google-123', email: 'google@example.com' };

      authService.googleLogin.mockResolvedValue({
        status: 200,
        data: { user: mockUser, accessToken: 'google-token' },
      });

      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(authService.isAuthenticated).toHaveBeenCalled());
      mockSetUser.mockClear();

      // Use act to wrap the async googleLogin call
      await act(async () => {
        // Wait for the promise to resolve
        await result.current.googleLogin();
      });
      
      // Verify the service method was called
      expect(authService.googleLogin).toHaveBeenCalled();
      
      // Wait for the state update to propagate
      // The useEffect should re-run because the store's user changes
      await waitFor(() => {
        expect(mockSetUser).toHaveBeenCalledWith(mockUser);
      });
    });

    it('should handle google login rejection', async () => {
      authService.googleLogin.mockRejectedValue(new Error('Failed'));

      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(authService.isAuthenticated).toHaveBeenCalled());

      await expect(result.current.googleLogin()).rejects.toThrow('Failed');
    });
  });

  describe('logout - full stack', () => {
    it('should logout and clear state', async () => {
      authService.logout.mockResolvedValue({ status: 200 });

      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(authService.isAuthenticated).toHaveBeenCalled());

      await act(async () => result.current.logout());
      expect(authService.logout).toHaveBeenCalled();
      expect(mockSetUser).toHaveBeenCalledWith(null);
      await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true }));
    });

    it('should handle logout errors', async () => {
      authService.logout.mockRejectedValue(new Error('Logout failed'));

      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(authService.isAuthenticated).toHaveBeenCalled());

      await act(async () => result.current.logout());
      await waitFor(() => expect(mockSetUser).toHaveBeenCalledWith(null));
    });
  });

  describe('isAuthenticated', () => {
    it('should check auth status', async () => {
      const mockUser = { id: 'user-123' };

      authService.isAuthenticated.mockResolvedValue({ data: { user: mockUser, accessToken: 'token' } });

      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(authService.isAuthenticated).toHaveBeenCalled();
      await waitFor(() => expect(mockSetUser).toHaveBeenCalled());
    });

    it('should handle auth check failure', async () => {
      authService.isAuthenticated.mockRejectedValue({ response: { status: 401 } });

      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.loading).toBe(false));
      await waitFor(() => expect(mockSetUser).toHaveBeenCalledWith(null));
      await waitFor(() => expect(mockLogoutFromStore).toHaveBeenCalled());
    });
  });
});
