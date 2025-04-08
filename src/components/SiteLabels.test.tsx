import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SiteLabels } from './admin/site-labels-management';

describe('SiteLabels', () => {
  const mockLabels = [
    { id: 1, color: '#FF0000' },
    { id: 2, color: '#00FF00' }
  ];

  const mockOnChange = vi.fn();

  it('deve renderizar os labels corretamente', () => {
    render(<SiteLabels labels={mockLabels} onChange={mockOnChange} />);
    
    mockLabels.forEach(label => {
      const labelElement = screen.getByTestId(`label-${label.id}`);
      expect(labelElement).toBeInTheDocument();
      expect(labelElement).toHaveStyle({ backgroundColor: label.color });
    });
  });

  it('deve chamar onChange quando um label é clicado', () => {
    render(<SiteLabels labels={mockLabels} onChange={mockOnChange} />);
    
    const firstLabel = screen.getByTestId('label-1');
    fireEvent.click(firstLabel);
    
    expect(mockOnChange).toHaveBeenCalledWith([1]);
  });

  it('deve permitir seleção múltipla de labels', () => {
    render(<SiteLabels labels={mockLabels} onChange={mockOnChange} />);
    
    const firstLabel = screen.getByTestId('label-1');
    const secondLabel = screen.getByTestId('label-2');
    
    fireEvent.click(firstLabel);
    fireEvent.click(secondLabel);
    
    expect(mockOnChange).toHaveBeenCalledWith([1, 2]);
  });

  it('deve permitir desselecionar labels', () => {
    render(<SiteLabels labels={mockLabels} onChange={mockOnChange} />);
    
    const firstLabel = screen.getByTestId('label-1');
    
    fireEvent.click(firstLabel);
    fireEvent.click(firstLabel);
    
    expect(mockOnChange).toHaveBeenCalledWith([]);
  });
}); 