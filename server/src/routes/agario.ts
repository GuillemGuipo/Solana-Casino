import { Router } from 'express';
import { agarioGame } from '../game/agario';

const router = Router();

router.post('/join', (req, res) => {
  const { bet } = req.body;
  if (![1, 5, 20].includes(Number(bet))) {
    return res.status(400).json({ error: 'Invalid entry fee' });
  }
  const state = agarioGame.joinGame(Number(bet));
  const gameState = agarioGame.getState();
  res.json({ playerId: state.id, state, players: gameState.players, pellets: gameState.pellets });
});

router.post('/update', (req, res) => {
  const { playerId, x, y } = req.body;
  const state = agarioGame.updatePlayer(String(playerId), Number(x), Number(y));
  if (!state) return res.status(404).json({ error: 'Player not found' });
  res.json({ state });
});

router.get('/state', (_req, res) => {
  res.json(agarioGame.getState());
});

router.post('/cashout', (req, res) => {
  const { playerId } = req.body;
  const payout = agarioGame.cashOut(String(playerId));
  if (payout === null) return res.status(404).json({ error: 'Player not found' });
  res.json({ payout });
});

export default router;
