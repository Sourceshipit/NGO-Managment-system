import { render, screen, waitFor } from '../../../test/utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import Navbar from '../Navbar';

const { mockNotificationsAPI } = vi.hoisted(() => ({
  mockNotificationsAPI: {
    getUnreadCount: vi.fn(),
    getAll: vi.fn(),
    markAllRead: vi.fn()
  }
}));

vi.mock('../../../api/client', () => ({
  notificationsAPI: mockNotificationsAPI
}));

// Mock useAuth directly to bypass real AuthProvider effects if needed, 
// but since we are wrapping in AuthProvider, we should mock the hook 
// so we don't have to wait for "loading" state.
vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { full_name: 'Test Administrator', role: 'ADMIN' },
    logout: vi.fn(),
    login: vi.fn()
  })
}));

describe('Navbar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNotificationsAPI.getUnreadCount.mockResolvedValue({ count: 5 });
    mockNotificationsAPI.getAll.mockResolvedValue([
      { id: 1, message: 'Test Notif', is_read: false, type: 'SYSTEM', created_at: new Date().toISOString() }
    ]);
  });

  it('renders and fetches unread count', async () => {
    render(<Navbar />);
    await waitFor(() => {
     expect(mockNotificationsAPI.getUnreadCount).toHaveBeenCalled();
    });
    // Find unread badge
    expect(await screen.findByText('5')).toBeInTheDocument();
  });

  it('toggles notification dropdown and purges', async () => {
    render(<Navbar />);
    // Wait for the badge to appear and click closest button
    const bellBtnText = await screen.findByText('5');
    await userEvent.click(bellBtnText.closest('button')!);
    
    await waitFor(() => {
      expect(screen.getByText('Notifications')).toBeInTheDocument();
    });

    const clearBtn = screen.getByText('Mark all read');
    await userEvent.click(clearBtn);
    expect(mockNotificationsAPI.markAllRead).toHaveBeenCalled();
  });

  it('toggles user profile dropdown', async () => {
    render(<Navbar />);
    // The initals for "Test Administrator" are "TA"
    const profileBtn = screen.getByText('TA').closest('button');
    expect(profileBtn).toBeInTheDocument();
    
    await userEvent.click(profileBtn!);
    
    await waitFor(() => {
      expect(screen.getByText('Test Administrator')).toBeInTheDocument();
      expect(screen.getByText('Sign Out')).toBeInTheDocument();
    });
  });
});
