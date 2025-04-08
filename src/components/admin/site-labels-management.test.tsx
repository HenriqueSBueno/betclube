import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SiteLabelsManagement } from './site-labels-management';
import { SiteLabelService } from '@/services/site-label-service';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

// Mock dos hooks
vi.mock('@/hooks/use-auth', () => ({
  useAuth: vi.fn()
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn()
}));

// Mock do serviço
vi.mock('@/services/site-label-service', () => ({
  SiteLabelService: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  }
}));

describe('SiteLabelsManagement', () => {
  const mockUser = {
    id: 'user-1',
    email: 'test@example.com'
  };

  const mockToast = {
    toast: vi.fn()
  };

  const mockLabels = [
    { id: '1', name: 'Promoção', color: '#FF0000', admin_owner_id: 'user-1', created_at: '', updated_at: '' },
    { id: '2', name: 'VIP', color: '#00FF00', admin_owner_id: 'user-1', created_at: '', updated_at: '' }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({ user: mockUser });
    (useToast as any).mockReturnValue(mockToast);
    (SiteLabelService.getAll as any).mockResolvedValue(mockLabels);
  });

  it('deve renderizar o formulário de criação de rótulos', async () => {
    render(<SiteLabelsManagement />);
    
    expect(screen.getByText('Adicionar Novo Rótulo')).toBeInTheDocument();
    expect(screen.getByLabelText('Nome do Rótulo')).toBeInTheDocument();
    expect(screen.getByLabelText('Cor')).toBeInTheDocument();
  });

  it('deve carregar e exibir os rótulos existentes', async () => {
    render(<SiteLabelsManagement />);
    
    await waitFor(() => {
      expect(SiteLabelService.getAll).toHaveBeenCalled();
    });

    expect(screen.getByText('Promoção')).toBeInTheDocument();
    expect(screen.getByText('VIP')).toBeInTheDocument();
  });

  it('deve criar um novo rótulo', async () => {
    const newLabel = {
      name: 'Novo Rótulo',
      color: '#0000FF',
      admin_owner_id: mockUser.id
    };

    (SiteLabelService.create as any).mockResolvedValue({
      ...newLabel,
      id: '3',
      created_at: '',
      updated_at: ''
    });

    render(<SiteLabelsManagement />);
    
    const nameInput = screen.getByLabelText('Nome do Rótulo');
    const colorInput = screen.getByPlaceholderText('#3b82f6');
    
    fireEvent.change(nameInput, { target: { value: newLabel.name } });
    fireEvent.change(colorInput, { target: { value: newLabel.color } });
    
    // Aguardar o botão ficar habilitado
    await waitFor(() => {
      const submitButton = screen.getByText('Adicionar Rótulo');
      expect(submitButton).not.toBeDisabled();
    });
    
    const submitButton = screen.getByText('Adicionar Rótulo');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(SiteLabelService.create).toHaveBeenCalledWith(newLabel);
      expect(mockToast.toast).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Rótulo criado'
      }));
    });
  });

  it('deve atualizar um rótulo existente', async () => {
    const updatedLabel = {
      id: '1',
      name: 'Rótulo Atualizado',
      color: '#00FF00',
      admin_owner_id: mockUser.id
    };

    (SiteLabelService.update as any).mockResolvedValue({
      ...updatedLabel,
      created_at: '',
      updated_at: ''
    });

    render(<SiteLabelsManagement />);
    
    // Aguardar os rótulos serem carregados
    await waitFor(() => {
      expect(screen.getByText('Promoção')).toBeInTheDocument();
    });

    // Encontrar o botão de edição pelo aria-label
    const editButton = screen.getByLabelText('Editar Promoção');
    fireEvent.click(editButton);

    const nameInput = screen.getByLabelText('Nome do Rótulo');
    const colorInput = screen.getByPlaceholderText('#3b82f6');
    
    fireEvent.change(nameInput, { target: { value: updatedLabel.name } });
    fireEvent.change(colorInput, { target: { value: updatedLabel.color } });
    
    // Aguardar o formulário ser validado
    await waitFor(() => {
      const submitButton = screen.getByText('Atualizar Rótulo');
      expect(submitButton).not.toBeDisabled();
    });
    
    const submitButton = screen.getByText('Atualizar Rótulo');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(SiteLabelService.update).toHaveBeenCalledWith(updatedLabel.id, {
        name: updatedLabel.name,
        color: updatedLabel.color
      });
      expect(mockToast.toast).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Rótulo atualizado'
      }));
    });
  });

  it('deve excluir um rótulo', async () => {
    (SiteLabelService.delete as any).mockResolvedValue(undefined);

    render(<SiteLabelsManagement />);
    
    // Aguardar os rótulos serem carregados
    await waitFor(() => {
      expect(screen.getByText('Promoção')).toBeInTheDocument();
    });

    // Encontrar o botão de exclusão pelo aria-label
    const deleteButton = screen.getByLabelText('Excluir Promoção');
    fireEvent.click(deleteButton);

    // Confirmar a exclusão
    const confirmButton = screen.getByText('Excluir');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(SiteLabelService.delete).toHaveBeenCalledWith('1');
      expect(mockToast.toast).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Rótulo excluído'
      }));
    });
  });

  it('deve mostrar erro quando falhar ao carregar rótulos', async () => {
    const error = new Error('Erro ao carregar');
    (SiteLabelService.getAll as any).mockRejectedValue(error);

    render(<SiteLabelsManagement />);

    await waitFor(() => {
      expect(mockToast.toast).toHaveBeenCalledWith(expect.objectContaining({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível carregar os rótulos. Tente novamente.'
      }));
    });
  });
}); 