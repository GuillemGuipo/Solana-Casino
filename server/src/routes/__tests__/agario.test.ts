import request from 'supertest';
import express from 'express';
import agarioRoutes from '../agario';
import { agarioGame } from '../../game/agario';

describe('Agario routes', () => {
  const app = express();
  app.use(express.json());
  app.use('/api/agario', agarioRoutes);

  it('joins a game', async () => {
    const res = await request(app).post('/api/agario/join').send({ bet: 5 });
    expect(res.status).toBe(200);
    expect(res.body.playerId).toBeDefined();
  });

  it('updates player state', async () => {
    agarioGame.reset();
    const join = await request(app).post('/api/agario/join').send({ bet: 1 });
    const id = join.body.playerId;
    // place a pellet at (10,10) for deterministic test
    (agarioGame as any).pellets = { p: { id: 'p', x: 10, y: 10 } };
    const res = await request(app)
      .post('/api/agario/update')
      .send({ playerId: id, x: 10, y: 10 });
    expect(res.status).toBe(200);
    expect(res.body.state.size).toBeGreaterThan(1);
  });

  it('cashouts with fee', async () => {
    const join = await request(app).post('/api/agario/join').send({ bet: 20 });
    const id = join.body.playerId;
    const res = await request(app)
      .post('/api/agario/cashout')
      .send({ playerId: id });
    expect(res.status).toBe(200);
    expect(res.body.payout).toBeCloseTo(18);
  });
});
