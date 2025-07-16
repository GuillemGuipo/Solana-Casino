import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import UltraAgario from '../games/UltraAgario';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Suppress alert during tests
window.alert = jest.fn();

describe('UltraAgario component', () => {
  it('joins and cashes out', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { playerId: '1', state: { id: '1', size: 1, balance: 1, x: 0, y: 0 }, players: [], pellets: [] } });
    render(<UltraAgario />);
    fireEvent.click(screen.getByText('Join for $1'));
    await waitFor(() => screen.getByText(/Size:/));
    mockedAxios.post.mockResolvedValueOnce({ data: { payout: 0.9 } });
    fireEvent.click(screen.getByText('Cash Out'));
    await waitFor(() => expect(mockedAxios.post).toHaveBeenCalled());
  });
});
