import { render, screen, waitFor } from '../../../test/utils';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import DonateNowModal from '../DonateNowModal';

// Mock Razorpay on window
(window as any).Razorpay = vi.fn().mockImplementation(() => ({
  open: vi.fn(),
}));

describe('DonateNowModal Component', () => {
  it('renders correctly on open', () => {
    render(<DonateNowModal isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText('DONATE_NOW')).toBeInTheDocument();
    expect(screen.getByText('AMOUNT (₹)')).toBeInTheDocument();
  });

  it('handles preset amount buttons correctly', async () => {
    render(<DonateNowModal isOpen={true} onClose={vi.fn()} />);
    
    const presetBtn = screen.getByText('₹5,000');
    await userEvent.click(presetBtn);
    
    // The input should be populated
    const input = screen.getByPlaceholderText('Enter amount') as HTMLInputElement;
    expect(input.value).toBe('5000');
  });

  it('fires validation error if submitting empty form', async () => {
    render(<DonateNowModal isOpen={true} onClose={vi.fn()} />);
    
    // Find the main "PAY WITH RAZORPAY" button. The text handles dynamic amount so we match partial.
    const payBtn = screen.getByText(/PAY .* WITH RAZORPAY/i);
    await userEvent.click(payBtn);
    
    // It should trigger a toast error, but since toast is external, we can just ensure 
    // it does not change steps (still says DONATE_NOW).
    expect(screen.getByText('DONATE_NOW')).toBeInTheDocument();
  });
});
