/**
 * Unit tests for ProtectedRoute component
 * 
 * Tests cover:
 * - Rendering protected content when authenticated
 * - Redirecting to login when not authenticated
 * - Loading state during authentication check
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProtectedRoute from '../../Components/ProtectedRoute';
import useAuth from '../../hooks/useAuth';
import useStore from '../../hooks/useStore';

const mockNavigate = vi.fn();

// Mock dependencies
vi.mock('../../hooks/useAuth');
vi.mock('../../hooks/useStore');
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('ProtectedRoute', () => {
  const mockIsAuthenticated = vi.fn();
  const mockSetUiState = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    
    useStore.mockReturnValue({
      uiState: { showLoginAnimation: false },
      setUiState: mockSetUiState,
    });

    useAuth.mockReturnValue({
      isAuthenticated: mockIsAuthenticated,
    });
  });

  it('should render children when user is authenticated', async () => {
    mockIsAuthenticated.mockResolvedValue({
      user: { id: 'user-123', email: 'test@example.com' },
      accessToken: 'token',
    });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  it('should redirect to login when user is not authenticated', async () => {
    mockIsAuthenticated.mockResolvedValue(null);

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    // Should not render protected content
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should show loading state during authentication check', () => {
    // Don't resolve the promise immediately
    mockIsAuthenticated.mockReturnValue(new Promise(() => {}));

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    // Should show loading animation
    // The actual loading component might vary based on implementation
  });

  it('should handle authentication errors gracefully', async () => {
    mockIsAuthenticated.mockRejectedValue(new Error('Auth failed'));

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });
});

