import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/providers/auth-provider';
import Index from '../Index';
import { vi } from 'vitest';

// Mock dos módulos
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
    })),
  },
}));

vi.mock('@/services/rankings-service', () => ({
  RankingsService: {
    getAllRankings: vi.fn().mockResolvedValue([]),
  },
}));

// Criar um wrapper com os providers necessários
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          {children}
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Index Page', () => {
  it('should render loading state initially', () => {
    render(<Index />, { wrapper: createWrapper() });
    expect(screen.getByText(/carregando rankings/i)).toBeInTheDocument();
  });

  it('should render landing page for unauthenticated users', async () => {
    render(<Index />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByTestId('landing-page')).toBeInTheDocument();
    });
  });

  it('should render rankings for authenticated users', async () => {
    // Mock authenticated user
    vi.mock('@/hooks/use-auth', () => ({
      useAuth: () => ({ isAuthenticated: true }),
    }));

    render(<Index />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText(/ranking de hoje/i)).toBeInTheDocument();
    });
  });
}); 