import request from 'supertest';
import express from 'express';
import agarioRoutes from '../agario';

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
    const join = await request(app).post('/api/agario/join').send({ bet: 1 });
    const id = join.body.playerId;
    const res = await request(app)
      .post('/api/agario/update')
      .send({ playerId: id, sizeDelta: 2 });
    expect(res.status).toBe(200);
    expect(res.body.state.size).toBe(3);
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
