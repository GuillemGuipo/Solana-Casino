import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';

interface PlayerState {
  size: number;
  balance: number;
}

const players: Record<string, PlayerState> = {};

const router = Router();

router.post('/join', (req, res) => {
  const { bet } = req.body;
  if (![1, 5, 20].includes(Number(bet))) {
    return res.status(400).json({ error: 'Invalid entry fee' });
  }
  const id = uuidv4();
  players[id] = { size: 1, balance: Number(bet) };
  res.json({ playerId: id, state: players[id] });
});

router.post('/update', (req, res) => {
  const { playerId, sizeDelta = 0, balanceDelta = 0 } = req.body;
  const player = players[playerId];
  if (!player) return res.status(404).json({ error: 'Player not found' });
  player.size += Number(sizeDelta);
  player.balance += Number(balanceDelta);
  res.json({ state: player });
});

router.post('/cashout', (req, res) => {
  const { playerId } = req.body;
  const player = players[playerId];
  if (!player) return res.status(404).json({ error: 'Player not found' });
  const payout = player.balance * 0.9; // 10% fee
  delete players[playerId];
  res.json({ payout });
});

export default router;
