import { render, screen } from '../../../test/utils';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import ConfirmModal from '../ConfirmModal';

describe('ConfirmModal Component', () => {
  it('renders correctly when open', () => {
    const props = {
      isOpen: true,
      onClose: vi.fn(),
      onConfirm: vi.fn(),
      title: 'Delete Record',
      message: 'This action is permanent.',
      confirmLabel: 'Delete',
    };
    render(<ConfirmModal {...props} />);
    
    expect(screen.getByText('Delete Record')).toBeInTheDocument();
    expect(screen.getByText('This action is permanent.')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    const props = {
      isOpen: false,
      onClose: vi.fn(),
      onConfirm: vi.fn(),
    };
    render(<ConfirmModal {...props} />);
    expect(screen.queryByText('Confirm Action')).not.toBeInTheDocument();
  });

  it('fires onConfirm when confirm button is clicked', async () => {
    const props = {
      isOpen: true,
      onClose: vi.fn(),
      onConfirm: vi.fn(),
    };
    render(<ConfirmModal {...props} />);
    
    const confirmBtn = screen.getByText('Confirm');
    await userEvent.click(confirmBtn);
    expect(props.onConfirm).toHaveBeenCalledTimes(1);
    expect(props.onClose).not.toHaveBeenCalled();
  });

  it('fires onClose when cancel button is clicked', async () => {
    const props = {
      isOpen: true,
      onClose: vi.fn(),
      onConfirm: vi.fn(),
    };
    render(<ConfirmModal {...props} />);
    
    const cancelBtn = screen.getByText('Cancel');
    await userEvent.click(cancelBtn);
    expect(props.onClose).toHaveBeenCalledTimes(1);
    expect(props.onConfirm).not.toHaveBeenCalled();
  });

  it('disables buttons when loading', () => {
    const props = {
      isOpen: true,
      onClose: vi.fn(),
      onConfirm: vi.fn(),
      loading: true,
    };
    render(<ConfirmModal {...props} />);
    
    expect(screen.getByText('Cancel')).toBeDisabled();
    expect(screen.getByText('Processing…')).toBeDisabled();
  });
});
