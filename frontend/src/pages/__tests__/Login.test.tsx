import { render, screen, waitFor } from '../../test/utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import Login from '../Login';

const { mockLoginFn, mockAuthAPI } = vi.hoisted(() => ({
  mockLoginFn: vi.fn(),
  mockAuthAPI: { login: vi.fn() }
}));

// Mock Auth hook and API
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    login: mockLoginFn
  })
}));

vi.mock('../../api/client', () => ({
  authAPI: mockAuthAPI
}));

describe('Login Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login page with role selector', () => {
    render(<Login />);
    // Welcome heading should be visible by default
    expect(screen.getByText('Welcome to BeneTrack')).toBeInTheDocument();
    
    // Role selection buttons
    expect(screen.getByText('Administrator')).toBeInTheDocument();
  });

  it('navigates through role selection to the form and fires validation on empty submit', async () => {
    render(<Login />);
    
    // Select Admin role
    const adminBtn = screen.getByText('Administrator').closest('button');
    await userEvent.click(adminBtn!);

    // Should load the login form
    await waitFor(() => {
      expect(screen.getByText('Email')).toBeInTheDocument();
    });

    // Clear standard seeded inputs and submit to see validation
    const emailInput = screen.getByPlaceholderText('you@example.com');
    const pwdInput = screen.getByPlaceholderText('••••••••');
    
    await userEvent.clear(emailInput);
    await userEvent.clear(pwdInput);

    const submitBtn = screen.getByText('Sign In');
    await userEvent.click(submitBtn);

    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
  });

  it('triggers login success', async () => {
    mockAuthAPI.login.mockResolvedValueOnce({
      access_token: 'valid_token',
      user: { full_name: 'Admin', role: 'ADMIN' }
    });

    render(<Login />);
    const adminBtn = screen.getByText('Administrator').closest('button');
    await userEvent.click(adminBtn!);

    // The fields are auto-filled for demo. Just trigger submit.
    const submitBtn = screen.getByText('Sign In');
    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockAuthAPI.login).toHaveBeenCalledTimes(1);
      expect(mockLoginFn).toHaveBeenCalledWith('valid_token', expect.objectContaining({ role: 'ADMIN' }));
    });
  });

  it('toggles password visibility correctly', async () => {
    render(<Login />);
    // Select a role to show the form
    const adminBtn = screen.getByText('Administrator').closest('button');
    await userEvent.click(adminBtn!);

    // Initially password field is "password" type
    const pwdInput = screen.getByPlaceholderText('••••••••') as HTMLInputElement;
    expect(pwdInput.type).toBe('password');

    // Click view toggle — find button[type=button] that is not Back or Forgot
    const viewBtn = screen.getAllByRole('button').find(b => b.hasAttribute('type') && b.getAttribute('type') === 'button' && !b.textContent?.includes('Back') && !b.textContent?.includes('Forgot'));
    if (viewBtn) {
      await userEvent.click(viewBtn);
      expect(pwdInput.type).toBe('text');
    }
  });
});
