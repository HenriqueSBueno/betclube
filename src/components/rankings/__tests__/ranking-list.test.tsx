import { render, screen, waitFor } from '@testing-library/react';
import { RankingList } from '../ranking-list';
import { vi } from 'vitest';

const mockRanking = {
  id: '1',
  categoryId: '1',
  categoryName: 'Categoria 1',
  generationDate: new Date(),
  expiration: new Date(),
  sites: [
    {
      id: '1',
      name: 'Site 1',
      url: 'https://site1.com',
      description: 'Descrição do Site 1',
      logo_url: 'https://site1.com/logo.png',
      position: 1,
      votes: 10,
    },
  ],
};

// Mock do hook useAuth
vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: { id: '1' },
  }),
}));

// Mock do hook useQuery
vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({
    data: mockRanking,
    isLoading: false,
    error: null,
  }),
}));

describe('RankingList', () => {
  it('should render ranking sites', async () => {
    render(<RankingList ranking={mockRanking} />);

    await waitFor(() => {
      expect(screen.getByText('Site 1')).toBeInTheDocument();
      expect(screen.getByText('Descrição do Site 1')).toBeInTheDocument();
    });
  });

  it('should show loading state', () => {
    vi.mocked(useQuery).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    render(<RankingList ranking={mockRanking} />);
    expect(screen.getByText(/carregando/i)).toBeInTheDocument();
  });

  it('should show error state', () => {
    vi.mocked(useQuery).mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Erro ao carregar'),
    });

    render(<RankingList ranking={mockRanking} />);
    expect(screen.getByText(/erro ao carregar/i)).toBeInTheDocument();
  });

  it('should handle empty sites list', () => {
    const emptyRanking = { ...mockRanking, sites: [] };
    render(<RankingList ranking={emptyRanking} />);
    expect(screen.getByText(/nenhum site encontrado/i)).toBeInTheDocument();
  });
}); 