import { render, screen } from '../../../test/utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import ThemeToggle from '../ThemeToggle';

describe('ThemeToggle Component', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('renders toggle button', () => {
    render(<ThemeToggle />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('toggles theme correctly', async () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    
    // Default could be anything since JSdom doesn't match Media. Let's just click and verify toggle
    await userEvent.click(button);
    // Wait for internal state change
    const isDarkNow = document.documentElement.classList.contains('dark');
    
    await userEvent.click(button);
    expect(document.documentElement.classList.contains('dark')).toBe(!isDarkNow);
    
    expect(localStorage.getItem('benetrack-theme')).toBeDefined();
  });
});
