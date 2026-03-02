import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';
import StudentRoute from './StudentRoute';

const mockUseAuth = vi.fn();

vi.mock('../context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

const renderWithRoutes = (element: React.ReactNode, initialPath: string) => {
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/auth" element={<div>Auth Page</div>} />
        <Route path="/admin" element={<div>Admin Dashboard</div>} />
        <Route path="/user-portal" element={<div>User Portal</div>} />
        <Route path="/protected" element={<>{element}</>} />
      </Routes>
    </MemoryRouter>
  );
};

describe('Route guards', () => {
  it('ProtectedRoute redirects unauthenticated users to /auth', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      loading: false,
      role: null,
    });

    renderWithRoutes(
      <ProtectedRoute>
        <div>Private Content</div>
      </ProtectedRoute>,
      '/protected'
    );

    expect(screen.getByText('Auth Page')).toBeInTheDocument();
  });

  it('AdminRoute allows admin and blocks student', () => {
    mockUseAuth.mockReturnValueOnce({
      isAuthenticated: true,
      loading: false,
      role: 'admin',
    });

    const { unmount } = render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/admin" element={<div>Admin Dashboard</div>} />
          <Route path="/user-portal" element={<div>User Portal</div>} />
          <Route
            path="/protected"
            element={
              <AdminRoute>
                <div>Admin Content</div>
              </AdminRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Admin Content')).toBeInTheDocument();
    unmount();

    mockUseAuth.mockReturnValueOnce({
      isAuthenticated: true,
      loading: false,
      role: 'student',
    });

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/admin" element={<div>Admin Dashboard</div>} />
          <Route path="/user-portal" element={<div>User Portal</div>} />
          <Route
            path="/protected"
            element={
              <AdminRoute>
                <div>Admin Content</div>
              </AdminRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('User Portal')).toBeInTheDocument();
  });

  it('StudentRoute allows student and blocks admin', () => {
    mockUseAuth.mockReturnValueOnce({
      isAuthenticated: true,
      loading: false,
      role: 'student',
    });

    const { unmount } = render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/admin" element={<div>Admin Dashboard</div>} />
          <Route path="/user-portal" element={<div>User Portal</div>} />
          <Route
            path="/protected"
            element={
              <StudentRoute>
                <div>Student Content</div>
              </StudentRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Student Content')).toBeInTheDocument();
    unmount();

    mockUseAuth.mockReturnValueOnce({
      isAuthenticated: true,
      loading: false,
      role: 'admin',
    });

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/admin" element={<div>Admin Dashboard</div>} />
          <Route path="/user-portal" element={<div>User Portal</div>} />
          <Route
            path="/protected"
            element={
              <StudentRoute>
                <div>Student Content</div>
              </StudentRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
  });
});
