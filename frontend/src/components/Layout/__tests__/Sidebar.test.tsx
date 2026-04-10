import { render, screen, waitFor } from '../../../test/utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import Sidebar from '../Sidebar';

// We mock the navigation configs by mocking the useAuth hook to simulate an ADMIN
const mockLogout = vi.fn();
vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { full_name: 'Test Administrator', role: 'ADMIN' },
    logout: mockLogout,
    login: vi.fn()
  })
}));

describe('Sidebar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders sidebar with correct role portal name', () => {
    render(<Sidebar />);
    expect(screen.getByText('BeneTrack Admin')).toBeInTheDocument();
    expect(screen.getByText('TA')).toBeInTheDocument(); // Initials
  });

  it('displays navigation items for the role config', () => {
    render(<Sidebar />);
    // Testing a couple of ADMIN default tabs
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Donors')).toBeInTheDocument();
  });

  it('calls logout when the logout button is clicked', async () => {
    render(<Sidebar />);
    const logoutBtn = screen.getAllByRole('button').find(b => b.textContent?.includes('Sign Out'));
    expect(logoutBtn).toBeInTheDocument();
    
    await userEvent.click(logoutBtn!);
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });
});
