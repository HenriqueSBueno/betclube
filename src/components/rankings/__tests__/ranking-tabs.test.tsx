import { render, screen, fireEvent } from '@testing-library/react';
import { RankingTabs } from '../ranking-tabs';
import { vi } from 'vitest';

const mockCategories = [
  { id: '1', name: 'Categoria 1', position: 1 },
  { id: '2', name: 'Categoria 2', position: 2 },
];

const mockRankings = [
  {
    id: '1',
    categoryId: '1',
    categoryName: 'Categoria 1',
    generationDate: new Date(),
    expiration: new Date(),
    sites: [],
  },
];

describe('RankingTabs', () => {
  it('should render all category tabs', () => {
    render(
      <RankingTabs 
        categories={mockCategories} 
        rankings={mockRankings} 
      />
    );

    expect(screen.getByText('Categoria 1')).toBeInTheDocument();
    expect(screen.getByText('Categoria 2')).toBeInTheDocument();
  });

  it('should switch between tabs when clicked', () => {
    render(
      <RankingTabs 
        categories={mockCategories} 
        rankings={mockRankings} 
      />
    );

    const secondTab = screen.getByText('Categoria 2');
    fireEvent.click(secondTab);

    expect(secondTab).toHaveAttribute('data-state', 'active');
  });

  it('should render ranking list for active category', () => {
    render(
      <RankingTabs 
        categories={mockCategories} 
        rankings={mockRankings} 
      />
    );

    expect(screen.getByTestId('ranking-list')).toBeInTheDocument();
  });

  it('should handle empty categories gracefully', () => {
    render(
      <RankingTabs 
        categories={[]} 
        rankings={[]} 
      />
    );

    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
  });
}); 