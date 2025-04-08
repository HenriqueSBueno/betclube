import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock do useAuth
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: '123',
      email: 'test@example.com',
      role: 'admin'
    },
    isAuthenticated: true
  })
}));

// Mock do useQuery
vi.mock('@tanstack/react-query', () => ({
  useQuery: ({ queryFn }: { queryFn: () => Promise<any> }) => ({
    data: queryFn(),
    isLoading: false,
    error: null
  })
})); 