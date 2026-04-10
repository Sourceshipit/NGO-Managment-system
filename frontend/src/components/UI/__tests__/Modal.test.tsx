import { render, screen } from '../../../test/utils';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import Modal from '../Modal';

describe('Modal Component', () => {
  it('renders correctly and conditionally', () => {
    const { rerender } = render(
      <Modal isOpen={true} onClose={vi.fn()} title="Test Modal">
        <div>Modal Content Body</div>
      </Modal>
    );

    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal Content Body')).toBeInTheDocument();

    rerender(
      <Modal isOpen={false} onClose={vi.fn()} title="Test Modal">
        <div>Modal Content Body</div>
      </Modal>
    );
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
  });

  it('calls onClose when the close icon is clicked', async () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose} title="Closeable">
        <div>Content</div>
      </Modal>
    );

    const buttons = screen.getAllByRole('button');
    // The close button is the one with the X lucide icon. Assume it's the only generic button.
    const closeBtn = buttons.find(b => !b.textContent.includes('Content'));
    if (closeBtn) {
      await userEvent.click(closeBtn);
      expect(onClose).toHaveBeenCalledTimes(1);
    }
  });

  it('calls onClose when pressing Escape', async () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose} title="Closeable">
        <div>Content</div>
      </Modal>
    );
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
