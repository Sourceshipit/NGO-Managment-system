import { render, screen, waitFor } from '../../../test/utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import SettingsPage from '../Settings';

// Mock context and APIs
vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 1, full_name: 'Test Administrator', role: 'ADMIN', email: 'test@example.com', phone: '123' },
  })
}));

const { mockUsersAPI, mockAuthAPI } = vi.hoisted(() => ({
  mockUsersAPI: { update: vi.fn() },
  mockAuthAPI: { changePassword: vi.fn() }
}));

vi.mock('../../../api/client', () => ({
  usersAPI: mockUsersAPI,
  authAPI: mockAuthAPI
}));

describe('Settings Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders account tab correctly', () => {
    render(<SettingsPage />);
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Administrator')).toBeInTheDocument();
  });

  it('tests saving profile', async () => {
    mockUsersAPI.update.mockResolvedValueOnce({ status: 'success' });
    render(<SettingsPage />);
    
    const saveBtn = screen.getByText('Save');
    await userEvent.click(saveBtn);

    await waitFor(() => {
      expect(mockUsersAPI.update).toHaveBeenCalledWith(1, { full_name: 'Test Administrator', phone: '123' });
    });
  });

  it('validates minimum password length', async () => {
    render(<SettingsPage />);
    
    const curPwdInput = screen.getByPlaceholderText('Current Password');
    const newPwdInput = screen.getByPlaceholderText('New Password (min 8 chars)');
    const updateBtn = screen.getByText('Update Password');

    await userEvent.type(curPwdInput, 'oldpass');
    await userEvent.type(newPwdInput, 'short');
    
    await userEvent.click(updateBtn);
    
    // API shouldn't be called because short validates
    expect(mockAuthAPI.changePassword).not.toHaveBeenCalled();
  });

  it('switches to notifications tab and toggles buttons', async () => {
    render(<SettingsPage />);
    
    const notificationsTab = screen.getByText('Notifications');
    await userEvent.click(notificationsTab);

    // Email Notifications is enabled by default
    const emailToggle = screen.getByText('Email Notifications').closest('.flex')?.querySelector('button');
    expect(emailToggle).toBeInTheDocument();

    // Click the toggle button
    await userEvent.click(emailToggle!);
    // At this point we are just asserting no crash happens
    
    const savePrefsBtn = screen.getByText('Save Preferences');
    await userEvent.click(savePrefsBtn); // will toast
  });
});
